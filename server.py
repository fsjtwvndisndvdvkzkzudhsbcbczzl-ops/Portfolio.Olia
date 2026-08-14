#!/usr/bin/env python3
"""Serve the portfolio and bridge its chat UI to Dora without exposing the API key."""

from __future__ import annotations

import importlib.util
import json
import os
import re
import sys
import threading
import time
import uuid
from collections import defaultdict, deque
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from types import ModuleType
from typing import Any


ROOT = Path(__file__).resolve().parent
DORA_SKILL = ROOT / ".agents" / "skills" / "fine-dora" / "scripts" / "fine_dora.py"
DEFAULT_AGENT_ID = "5d86ea41-8733-4d60-85fc-52b642e8f54a"
DEFAULT_CHANNEL = "web"
MAX_BODY_BYTES = 64 * 1024
MAX_MESSAGE_LENGTH = 600
RATE_LIMIT_REQUESTS = 12
RATE_LIMIT_WINDOW_SECONDS = 60
SESSION_PATTERN = re.compile(r"^[A-Za-z0-9._:-]{1,160}$")

_dora_module: ModuleType | None = None
_dora_lock = threading.Lock()
_request_times: dict[str, deque[float]] = defaultdict(deque)
_rate_lock = threading.Lock()


def load_dora_module() -> ModuleType:
    """Load the installed fine-dora adapter once for SSE parsing and API calls."""
    global _dora_module
    with _dora_lock:
        if _dora_module is not None:
            return _dora_module
        if not DORA_SKILL.exists():
            raise RuntimeError("fine-dora skill is missing from .agents/skills/fine-dora")
        spec = importlib.util.spec_from_file_location("portfolio_fine_dora", DORA_SKILL)
        if spec is None or spec.loader is None:
            raise RuntimeError("Unable to load fine-dora")
        module = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = module
        spec.loader.exec_module(module)
        _dora_module = module
        return module


def dora_ready() -> tuple[bool, str]:
    try:
        module = load_dora_module()
        module.api_base()
        module.api_key()
        return True, "Olia 的作品集问答助手"
    except Exception as error:
        return False, str(error)


def allow_request(client: str) -> bool:
    now = time.monotonic()
    with _rate_lock:
        bucket = _request_times[client]
        while bucket and now - bucket[0] > RATE_LIMIT_WINDOW_SECONDS:
            bucket.popleft()
        if len(bucket) >= RATE_LIMIT_REQUESTS:
            return False
        bucket.append(now)
        return True


def normalized_session(value: Any) -> str:
    if isinstance(value, str) and SESSION_PATTERN.fullmatch(value):
        return value
    return f"portfolio-{uuid.uuid4()}"


def build_question(message: str, context: Any) -> str:
    """Add only public page context so project-level questions stay grounded."""
    if not isinstance(context, dict):
        return message
    title = str(context.get("title") or "").strip()[:120]
    project_title = str(context.get("projectTitle") or "").strip()[:120]
    summary = str(context.get("summary") or "").strip()[:360]
    context_lines = []
    if title:
        context_lines.append(f"当前浏览模块：{title}")
    if project_title and project_title != title:
        context_lines.append(f"当前项目：{project_title}")
    if summary:
        context_lines.append(f"页面公开简介：{summary}")
    if not context_lines:
        return message
    return "\n".join([
        "以下是访客当前浏览位置的公开上下文，仅用于理解问题：",
        *context_lines,
        f"访客问题：{message}",
    ])


def ask_dora(message: str, conversation_id: str, context: Any) -> str:
    module = load_dora_module()
    payload = {
        "publishedAgentId": os.environ.get("DORA_PUBLISHED_AGENT_ID", DEFAULT_AGENT_ID),
        "externalSessionKey": conversation_id,
        "queryId": str(uuid.uuid4()),
        "userMessage": build_question(message, context),
        "channelType": os.environ.get("DORA_CHANNEL_TYPE", DEFAULT_CHANNEL),
        "traceId": str(uuid.uuid4()),
    }
    result = module.execute_sse_chat(None, payload)
    display = module.build_chat_display(result)
    answer = str(display.get("displayText") or display.get("content") or "").strip()
    if not answer:
        raise RuntimeError("Dora returned an empty answer")
    return answer


class PortfolioHandler(SimpleHTTPRequestHandler):
    server_version = "OliaPortfolio/1.0"

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self) -> None:
        if self.path.startswith("/api/"):
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, status: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        try:
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self.end_headers()

    def do_GET(self) -> None:
        if self.path.split("?", 1)[0] == "/api/health":
            ready, agent = dora_ready()
            self.send_json(
                HTTPStatus.OK if ready else HTTPStatus.SERVICE_UNAVAILABLE,
                {"connected": ready, "agent": agent if ready else None},
            )
            return
        super().do_GET()

    def do_POST(self) -> None:
        if self.path.split("?", 1)[0] != "/api/chat":
            self.send_json(HTTPStatus.NOT_FOUND, {"error": "Not found"})
            return
        client = self.client_address[0] if self.client_address else "unknown"
        if not allow_request(client):
            self.send_json(HTTPStatus.TOO_MANY_REQUESTS, {"error": "提问较频繁，请稍后再试。"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length <= 0 or length > MAX_BODY_BYTES:
            self.send_json(HTTPStatus.BAD_REQUEST, {"error": "请求内容无效。"})
            return
        try:
            body = json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_json(HTTPStatus.BAD_REQUEST, {"error": "请求格式无效。"})
            return
        message = str(body.get("message") or "").strip()
        if not message or len(message) > MAX_MESSAGE_LENGTH:
            self.send_json(HTTPStatus.BAD_REQUEST, {"error": "问题需控制在 600 字以内。"})
            return
        conversation_id = normalized_session(body.get("conversationId"))
        try:
            answer = ask_dora(message, conversation_id, body.get("context"))
        except Exception as error:
            print(f"Dora request failed: {error}", file=sys.stderr)
            self.send_json(
                HTTPStatus.BAD_GATEWAY,
                {"error": "Dora 暂时没有完成回答，请稍后重试。"},
            )
            return
        self.send_json(
            HTTPStatus.OK,
            {"answer": answer, "conversationId": conversation_id},
        )

    def log_message(self, fmt: str, *args: Any) -> None:
        print(f"[{self.log_date_time_string()}] {fmt % args}")


def main() -> None:
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8765"))
    ready, detail = dora_ready()
    status = f"Dora connected: {detail}" if ready else f"Dora not configured: {detail}"
    print(status)
    print(f"Portfolio: http://{host}:{port}/")
    ThreadingHTTPServer((host, port), PortfolioHandler).serve_forever()


if __name__ == "__main__":
    main()
