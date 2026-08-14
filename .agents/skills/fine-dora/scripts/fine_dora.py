#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

CACHE_TTL_SECONDS = 30 * 60
JOB_TTL_SECONDS = 24 * 60 * 60
WORKSPACE_ENV_PATH = Path(__file__).resolve().parents[3] / ".env"

CREATE_ALLOWED_KEYS = {
    "name",
    "description",
    "avatar",
    "welcomeMessage",
    "systemPrompt",
    "agentType",
    "llmConfigId",
    "vendor",
    "apiUrl",
    "apiToken",
    "botId",
    "skills",
    "skillIds",
    "skillConfigs",
    "datasourceIds",
    "knowledgeSpaceIds",
    "publishToWorkspace",
    "publishToStandaloneUrl",
    "sessionExperienceConfig",
}
SAVE_ALLOWED_KEYS = {
    "id",
    "name",
    "description",
    "avatar",
    "welcomeMessage",
    "systemPrompt",
    "agentType",
    "llmConfigId",
    "vendor",
    "apiUrl",
    "apiToken",
    "botId",
    "skills",
    "skillIds",
    "skillConfigs",
    "datasourceIds",
    "knowledgeSpaceIds",
    "publishToWorkspace",
    "publishToStandaloneUrl",
    "sessionExperienceConfig",
}
READONLY_AGENT_KEYS = {
    "agentStatus",
    "published",
    "publishedAt",
    "createdBy",
    "createdAt",
    "updatedAt",
    "skills",
    "skillNames",
    "readableSkills",
    "llmConfigName",
}


def load_workspace_env():
    if not WORKSPACE_ENV_PATH.exists():
        return
    for raw_line in WORKSPACE_ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if key:
            os.environ[key] = value


load_workspace_env()


def ensure(value, name):
    if not value:
        raise ValueError(f"{name} is required")
    return value


def api_base():
    return ensure(os.environ.get("DORA_API_BASE"), "DORA_API_BASE").rstrip("/")


def api_key():
    return ensure(os.environ.get("DORA_API_KEY"), "DORA_API_KEY")


def default_channel(value):
    return value or ensure(os.environ.get("DORA_CHANNEL_TYPE"), "channel_type")


def decode_body(body_bytes):
    if body_bytes is None:
        return ""
    if isinstance(body_bytes, bytes):
        return body_bytes.decode("utf-8", errors="replace").strip()
    return str(body_bytes).strip()


def safe_json_loads(text):
    stripped = (text or "").strip()
    if not stripped:
        return None
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        return None


def looks_like_html(text):
    stripped = (text or "").lstrip().lower()
    return stripped.startswith("<!doctype html") or stripped.startswith("<html")


def summarize_non_json_2xx(status, raw_text):
    snippet = (raw_text[:500] if raw_text else "<empty>").strip()
    if not raw_text:
        return {
            "kind": "empty-body",
            "message": f"Dora returned HTTP {status} with empty body. The operation may have succeeded, but the response body is missing. Re-read the resource to verify final state.",
        }
    if looks_like_html(raw_text):
        return {
            "kind": "html-body",
            "message": f"Dora returned HTTP {status} with an HTML body instead of JSON. The business operation may have succeeded, but the response format is not trustworthy. Re-read the resource to verify final state. Body snippet: {snippet}",
        }
    return {
        "kind": "non-json-body",
        "message": f"Dora returned HTTP {status} with a non-JSON success body. The business operation may have succeeded, but the response format is not trustworthy. Re-read the resource to verify final state. Body snippet: {snippet}",
    }


def request_json(method, path, payload=None, query=None):
    url = api_base() + path
    if query:
        url = url + "?" + urllib.parse.urlencode(query)
    request = urllib.request.Request(
        url,
        data=None if payload is None else json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key()}",
        },
        method=method,
    )
    with urllib.request.urlopen(request, timeout=600) as response:
        raw_text = decode_body(response.read())
        parsed = safe_json_loads(raw_text)
        if parsed is not None:
            return parsed
        if response.status in (200, 201, 202, 204):
            diagnosis = summarize_non_json_2xx(response.status, raw_text)
            if diagnosis["kind"] == "empty-body":
                return {
                    "data": {
                        "status": response.status,
                        "emptyBody": True,
                        "diagnosis": diagnosis["message"],
                    }
                }
            raise RuntimeError(diagnosis["message"])
        raise RuntimeError(
            f"Invalid Dora JSON response (HTTP {response.status}): {raw_text[:500] or '<empty>'}"
        )


class StreamExecutionError(RuntimeError):
    def __init__(self, message, received_any=False):
        super().__init__(message)
        self.received_any = received_any


def request_sse(method, path, payload=None, query=None):
    url = api_base() + path
    if query:
        url = url + "?" + urllib.parse.urlencode(query)
    request = urllib.request.Request(
        url,
        data=None if payload is None else json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
            "Authorization": f"Bearer {api_key()}",
        },
        method=method,
    )
    with urllib.request.urlopen(request, timeout=600) as response:
        event_name = None
        event_id = None
        data_lines = []
        for raw_line in response:
            line = decode_body(raw_line)
            if line == "":
                if data_lines:
                    payload_text = "\n".join(data_lines)
                    parsed = safe_json_loads(payload_text)
                    if parsed is None:
                        raise RuntimeError(
                            f"Invalid SSE data payload: {payload_text[:500]}"
                        )
                    yield {"event": event_name, "id": event_id, "data": parsed}
                    data_lines = []
                    event_name = None
                    event_id = None
                continue
            if line.startswith(":"):
                continue
            if line.startswith("event:"):
                event_name = line[6:].lstrip()
                continue
            if line.startswith("id:"):
                event_id = line[3:].lstrip()
                continue
            if line.startswith("data:"):
                data_lines.append(line[5:].lstrip())
        if data_lines:
            payload_text = "\n".join(data_lines)
            parsed = safe_json_loads(payload_text)
            if parsed is None:
                raise RuntimeError(
                    f"Invalid trailing SSE data payload: {payload_text[:500]}"
                )
            yield {"event": event_name, "id": event_id, "data": parsed}


def cache_dir():
    namespace = hashlib.sha256(f"{api_base()}|{api_key()}".encode("utf-8")).hexdigest()[
        :16
    ]
    path = os.path.join(tempfile.gettempdir(), "fine_dora_cache", namespace)
    os.makedirs(path, exist_ok=True)
    return path


def jobs_dir():
    namespace = hashlib.sha256(f"{api_base()}|{api_key()}".encode("utf-8")).hexdigest()[
        :16
    ]
    path = os.path.join(tempfile.gettempdir(), "fine_dora_jobs", namespace)
    os.makedirs(path, exist_ok=True)
    return path


def job_file(job_id):
    return os.path.join(jobs_dir(), f"{job_id}.json")


def job_log_file(job_id):
    return os.path.join(jobs_dir(), f"{job_id}.log")


def write_json_file(path, data):
    temp_path = f"{path}.{uuid.uuid4().hex}.tmp"
    with open(temp_path, "w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False)
    os.replace(temp_path, path)


def save_job(job_id, data):
    write_json_file(job_file(job_id), data)


def load_job(job_id):
    path = job_file(ensure(job_id, "job_id"))
    if not os.path.exists(path):
        raise ValueError(f"job_id not found: {job_id}")
    with open(path, "r", encoding="utf-8") as handle:
        payload = json.load(handle)
    return payload


def cleanup_old_jobs():
    root = jobs_dir()
    now = time.time()
    for entry in os.listdir(root):
        if not entry.endswith(".json"):
            continue
        path = os.path.join(root, entry)
        try:
            if now - os.path.getmtime(path) > JOB_TTL_SECONDS:
                os.remove(path)
        except OSError:
            continue


def is_process_alive(pid):
    if not pid:
        return False
    try:
        os.kill(int(pid), 0)
        return True
    except OSError:
        return False


def cache_file(action):
    return os.path.join(cache_dir(), f"{action}.json")


def load_cache(action):
    path = cache_file(action)
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as handle:
        payload = json.load(handle)
    cached_at = payload.get("cachedAt")
    if cached_at is None or time.time() - cached_at > CACHE_TTL_SECONDS:
        return None
    return payload.get("data")


def save_cache(action, data):
    with open(cache_file(action), "w", encoding="utf-8") as handle:
        json.dump({"cachedAt": time.time(), "data": data}, handle, ensure_ascii=False)


def with_cache(action, refresh, loader):
    if not refresh:
        cached = load_cache(action)
        if cached is not None:
            return cached
    data = loader()
    save_cache(action, data)
    return data


def parse_response(response):
    if not isinstance(response, dict):
        raise RuntimeError("Invalid Dora response")
    if "data" in response:
        return response["data"]
    raise RuntimeError(
        response.get("msg") or response.get("message") or "Unknown Dora response"
    )


def output_mode(args):
    return getattr(args, "output_mode", "full") or "full"


def compact_agents(data):
    return [format_agent_summary(item) for item in data]


def compact_skills(data):
    return [format_skill_summary(item) for item in data]


def compact_llm_configs(data):
    return [
        {
            "name": item.get("name"),
            "protocol": item.get("protocol"),
            "id": item.get("id"),
        }
        for item in data
    ]


def compact_sessions(data):
    return [
        {
            "id": item.get("id"),
            "name": item.get("name"),
        }
        for item in data
    ]


def compact_history(data):
    turns = data.get("turns") if isinstance(data, dict) else []
    result = []
    for item in turns or []:
        result.append(
            {
                "query": item.get("query"),
                "status": item.get("status"),
                "summary": item.get("answer") or "",
                "queryId": item.get("queryId"),
            }
        )
    return result


def build_skill_index(skills):
    index = {}
    for item in skills or []:
        if not isinstance(item, dict):
            continue
        skill_id = item.get("id")
        if skill_id:
            index[skill_id] = item
    return index


def get_skill_index(refresh=False):
    skills = list_skills(refresh)
    if not isinstance(skills, list):
        return {}
    return build_skill_index(skills)


def get_llm_config_index(refresh=False):
    llm_configs = list_llm_configs(refresh)
    if not isinstance(llm_configs, list):
        return {}
    index = {}
    for item in llm_configs:
        if not isinstance(item, dict):
            continue
        llm_id = item.get("id")
        if llm_id:
            index[llm_id] = item
    return index


def resolve_skill_refs(skill_ids, embedded_skills=None, refresh=False):
    resolved = []
    seen = set()
    skill_index = get_skill_index(refresh)
    embedded_index = build_skill_index(embedded_skills)
    for skill_id in skill_ids or []:
        if not skill_id or skill_id in seen:
            continue
        seen.add(skill_id)
        skill = embedded_index.get(skill_id) or skill_index.get(skill_id) or {}
        resolved.append(
            {
                "id": skill_id,
                "name": skill.get("name") or skill_id,
                "description": skill.get("description"),
                "skillType": skill.get("skillType"),
                "status": skill.get("skillStatus") or skill.get("status"),
            }
        )
    return resolved


def extract_skill_names(resolved_skills):
    return [
        item.get("name")
        for item in resolved_skills
        if isinstance(item, dict) and item.get("name")
    ]


def format_skill_summary(skill, include_id=True):
    if not isinstance(skill, dict):
        return skill
    summary = {
        "name": skill.get("name") or skill.get("id"),
        "description": skill.get("description"),
        "skillType": skill.get("skillType"),
        "status": skill.get("skillStatus") or skill.get("status"),
        "datasourceMetadata": skill.get("datasourceMetadata"),
        "knowledgeBaseMetadata": skill.get("knowledgeBaseMetadata"),
    }
    if include_id:
        summary["id"] = skill.get("id")
    return summary


def format_agent_summary(agent):
    if not isinstance(agent, dict):
        return agent
    resolved_skills = resolve_skill_refs(agent.get("skillIds"), agent.get("skills"))
    return {
        "name": agent.get("name") or agent.get("id"),
        "description": agent.get("description"),
        "published": agent.get("published"),
        "agentStatus": agent.get("agentStatus"),
        "lastPublishTime": agent.get("lastPublishTime"),
        "publishToWorkspace": agent.get("publishToWorkspace"),
        "publishToStandaloneUrl": agent.get("publishToStandaloneUrl"),
        "skillNames": extract_skill_names(resolved_skills),
        "skills": [
            format_skill_summary(skill, include_id=False)
            for skill in (agent.get("skills") or [])
            if isinstance(skill, dict)
        ],
        "id": agent.get("id"),
        "skillIds": agent.get("skillIds"),
    }


def enrich_agent_detail(data):
    if not isinstance(data, dict):
        return data
    normalized = dict(data)
    resolved_skills = resolve_skill_refs(
        normalized.get("skillIds"), normalized.get("skills")
    )
    if resolved_skills:
        normalized["skillNames"] = extract_skill_names(resolved_skills)
        normalized["readableSkills"] = resolved_skills
    return normalized


def enrich_editable_agent(data):
    if not isinstance(data, dict):
        return data
    normalized = dict(data)
    skill_configs = normalized.get("skillConfigs") or []
    resolved_skills = resolve_skill_refs(normalized.get("skillIds"), skill_configs)
    if resolved_skills:
        normalized["skillNames"] = extract_skill_names(resolved_skills)
        normalized["readableSkills"] = resolved_skills
    llm_id = normalized.get("llmConfigId")
    if llm_id:
        llm_config = get_llm_config_index(False).get(llm_id)
        if llm_config and llm_config.get("name"):
            normalized["llmConfigName"] = llm_config.get("name")
    return normalized


def build_chat_display(data):
    if not isinstance(data, dict):
        return data
    normalized = dict(data)
    messages = normalized.get("messages") or []
    message_summaries = []
    for item in messages:
        if not isinstance(item, dict):
            continue
        content = item.get("content")
        if not content:
            continue
        message_summaries.append(
            {
                "type": item.get("type"),
                "status": item.get("status"),
                "content": content,
            }
        )
    display_text = normalized.get("content")
    if not display_text and message_summaries:
        display_text = "\n\n".join(
            summary.get("content")
            for summary in message_summaries
            if summary.get("content")
        )
    normalized["displayText"] = display_text or ""
    if message_summaries:
        normalized["messageSummaries"] = message_summaries
    return normalized


def format_data(action, mode, data):
    if action == "chat":
        data = build_chat_display(data)
    if action == "get-agent":
        data = enrich_agent_detail(data)
    if action == "get-editable-agent":
        data = enrich_editable_agent(data)
    if mode != "compact":
        return data
    if action == "list-agents":
        return compact_agents(data)
    if action == "list-skills":
        return compact_skills(data)
    if action == "list-llm-configs":
        return compact_llm_configs(data)
    if action == "list-sessions":
        return compact_sessions(data)
    if action == "history":
        return compact_history(data)
    return data


def build_meta(action, args, data):
    meta = {"action": action}
    for key in [
        "published_agent_id",
        "external_session_key",
        "channel_type",
        "query_id",
        "agent_id",
        "config_file",
    ]:
        value = getattr(args, key, None)
        if value:
            meta[key] = value
    if action == "chat" and isinstance(data, dict):
        for key in ["externalSessionKey", "queryId", "status"]:
            if data.get(key) is not None:
                meta[key] = data.get(key)
    return meta


def render_success(action, args, data):
    mode = output_mode(args)
    return {
        "success": True,
        "action": action,
        "mode": mode,
        "data": format_data(action, mode, data),
        "error": None,
        "meta": build_meta(action, args, data),
    }


def render_error(action, args, message):
    return {
        "success": False,
        "action": action,
        "mode": output_mode(args),
        "data": None,
        "error": message,
        "meta": build_meta(action, args, {}),
    }


def list_agents(refresh=False):
    return with_cache(
        "agents",
        refresh,
        lambda: parse_response(request_json("GET", "/external/api/openclaw/agents")),
    )


def list_llm_configs(refresh=False):
    return with_cache(
        "llm_configs",
        refresh,
        lambda: parse_response(
            request_json("GET", "/external/api/openclaw/llm/configs")
        ),
    )


def list_skills(refresh=False):
    return with_cache(
        "skills",
        refresh,
        lambda: parse_response(request_json("GET", "/external/api/openclaw/skills")),
    )


def build_chat_payload(args, published_agent_id):
    payload = {
        "publishedAgentId": ensure(published_agent_id, "published_agent_id"),
        "externalSessionKey": args.external_session_key or f"fine-dora-{uuid.uuid4()}",
        "queryId": args.query_id or str(uuid.uuid4()),
        "userMessage": args.question,
        "channelType": default_channel(args.channel_type),
        "traceId": args.trace_id or str(uuid.uuid4()),
    }
    if getattr(args, "locale", None):
        payload["locale"] = args.locale
    return payload


def read_json_file(path):
    with open(ensure(path, "config_file"), "r", encoding="utf-8") as handle:
        return json.load(handle)


def split_csv_list(value):
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item and item.strip()]


def set_if_present(payload, key, value):
    if value is not None:
        payload[key] = value


def normalize_agent_type(value):
    if value is None:
        return None
    if not isinstance(value, str):
        return value
    normalized = value.strip()
    if not normalized:
        return None
    return normalized.upper()


def choose_default_llm_id(payload, refresh=False):
    agent_type = (payload.get("agentType") or "WRAPPED").upper()
    if agent_type != "WRAPPED":
        return payload
    if payload.get("llmConfigId"):
        return payload
    llm_configs = list_llm_configs(refresh)
    if isinstance(llm_configs, list) and llm_configs:
        first = llm_configs[0]
        if isinstance(first, dict) and first.get("id"):
            payload["llmConfigId"] = first.get("id")
    return payload


def sanitize_agent_payload(payload, mode):
    if not isinstance(payload, dict):
        raise ValueError("config_file must contain a JSON object")
    normalized = dict(payload)
    if "agentType" in normalized:
        normalized["agentType"] = normalize_agent_type(normalized.get("agentType"))
    allowed_keys = SAVE_ALLOWED_KEYS if mode == "save" else CREATE_ALLOWED_KEYS
    sanitized = {key: value for key, value in normalized.items() if key in allowed_keys}
    removed_keys = sorted(key for key in normalized.keys() if key not in allowed_keys)
    if mode == "save" and not sanitized.get("id"):
        raise ValueError("config_file must contain id for save-agent")
    if not sanitized.get("name") or not sanitized.get("description"):
        raise ValueError("config_file must contain name and description")
    return sanitized, removed_keys


def build_create_agent_payload(args):
    if not args.user_confirmed:
        raise ValueError("user_confirmed is required before create-agent")
    payload = read_json_file(args.config_file) if args.config_file else {}
    if not payload:
        payload["name"] = ensure(args.name, "name")
        payload["description"] = ensure(args.description, "description")
    set_if_present(payload, "name", args.name)
    set_if_present(payload, "description", args.description)
    set_if_present(payload, "avatar", args.avatar)
    set_if_present(payload, "welcomeMessage", args.welcome_message)
    set_if_present(payload, "systemPrompt", args.system_prompt)
    set_if_present(payload, "agentType", normalize_agent_type(args.agent_type))
    set_if_present(payload, "llmConfigId", args.llm_config_id)
    set_if_present(payload, "vendor", args.vendor)
    set_if_present(payload, "apiUrl", args.api_url)
    set_if_present(payload, "apiToken", args.api_token)
    set_if_present(payload, "botId", args.bot_id)
    if args.skill_ids:
        payload["skillIds"] = split_csv_list(args.skill_ids)
    if args.publish_to_workspace:
        payload["publishToWorkspace"] = True
    if args.publish_to_standalone_url:
        payload["publishToStandaloneUrl"] = True
    payload, _ = sanitize_agent_payload(payload, "create")
    payload["userConfirmed"] = args.user_confirmed
    payload["channelType"] = default_channel(args.channel_type)
    payload["traceId"] = args.trace_id or str(uuid.uuid4())
    payload = choose_default_llm_id(payload, getattr(args, "refresh", False))
    return payload


def build_save_agent_payload(args):
    if not args.user_confirmed:
        raise ValueError("user_confirmed is required before save-agent")
    payload = read_json_file(args.config_file)
    payload, removed_keys = sanitize_agent_payload(payload, "save")
    payload["userConfirmed"] = args.user_confirmed
    payload["channelType"] = default_channel(args.channel_type)
    payload["traceId"] = args.trace_id or str(uuid.uuid4())
    payload = choose_default_llm_id(payload, False)
    return payload, removed_keys


def execute_chat(args, payload=None):
    chat_payload = payload or build_chat_payload(
        args, ensure(args.published_agent_id, "published_agent_id")
    )
    return execute_sse_chat(args, chat_payload)


def extract_bridge_text(content):
    if content is None:
        return ""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
                continue
            if not isinstance(item, dict):
                continue
            if item.get("type") == "text" and item.get("text"):
                parts.append(item.get("text"))
                continue
            if item.get("content"):
                parts.append(str(item.get("content")))
        return "".join(parts)
    if isinstance(content, dict):
        if content.get("text"):
            return str(content.get("text"))
        if content.get("content"):
            return str(content.get("content"))
    return str(content)


def find_last_human_message_id(messages):
    for item in reversed(messages or []):
        if isinstance(item, dict) and item.get("type") == "human" and item.get("id"):
            return item.get("id")
    return None


def slice_current_turn_messages(messages, current_human_message_id):
    if not isinstance(messages, list) or not messages:
        return []
    human_message_id = current_human_message_id or find_last_human_message_id(messages)
    if not human_message_id:
        return []
    current_turn = []
    in_current_turn = False
    for item in messages:
        if not isinstance(item, dict):
            continue
        if not in_current_turn:
            if item.get("id") == human_message_id:
                in_current_turn = True
            else:
                continue
        elif item.get("type") == "human" and item.get("id") != human_message_id:
            break
        current_turn.append(item)
    return current_turn


def summarize_turn_messages(turn_messages, partial_answer):
    summaries = []
    seen_tools = set()
    final_answer = ""
    human_message_id = None
    for item in turn_messages or []:
        if not isinstance(item, dict):
            continue
        item_type = item.get("type")
        if item_type == "human" and item.get("id"):
            human_message_id = item.get("id")
        if item_type == "ai":
            content = extract_bridge_text(item.get("content"))
            if content:
                final_answer = content
            tool_calls = item.get("tool_calls") or []
            for tool_call in tool_calls:
                if not isinstance(tool_call, dict):
                    continue
                tool_name = tool_call.get("name")
                if not tool_name or tool_name in seen_tools:
                    continue
                seen_tools.add(tool_name)
                summaries.append(
                    {
                        "type": "STEP",
                        "status": "PROCESSING",
                        "content": f"Calling tool: {tool_name}",
                    }
                )
        if item_type == "tool":
            tool_name = item.get("name") or item.get("tool_name") or "tool"
            marker = f"tool:{tool_name}"
            if marker not in seen_tools:
                seen_tools.add(marker)
                summaries.append(
                    {
                        "type": "STEP",
                        "status": "PROCESSING",
                        "content": f"Tool responded: {tool_name}",
                    }
                )
    if not final_answer and partial_answer:
        final_answer = partial_answer
    if final_answer:
        summaries.append(
            {
                "type": "RESULT",
                "status": "SUCCESS",
                "content": final_answer,
            }
        )
    return human_message_id, final_answer, summaries


def build_chat_result_from_sse(payload, state):
    turn_messages = state.get("turnMessages") or []
    human_message_id, final_answer, summaries = summarize_turn_messages(
        turn_messages, state.get("partialAnswer")
    )
    if not summaries and not final_answer:
        return None
    return {
        "externalSessionKey": payload.get("externalSessionKey"),
        "queryId": human_message_id or state.get("queryId") or payload.get("queryId"),
        "status": "SUCCESS" if final_answer else "UNKNOWN",
        "content": final_answer,
        "messages": summaries,
    }


def apply_sse_packet(state, packet):
    if not isinstance(packet, dict):
        return
    event_name = packet.get("event")
    data = packet.get("data")
    if event_name == "metadata" and isinstance(data, dict) and data.get("run_id"):
        state["runId"] = data.get("run_id")
        return
    if event_name == "messages" and isinstance(data, list):
        if data and isinstance(data[0], dict) and data[0].get("type") == "AIMessageChunk":
            state["partialAnswer"] = (state.get("partialAnswer") or "") + extract_bridge_text(
                data[0].get("content")
            )
        return
    if event_name in ("values", "custom", "end") and isinstance(data, dict):
        messages = data.get("messages")
        turn_messages = slice_current_turn_messages(messages, state.get("queryId"))
        if turn_messages:
            state["turnMessages"] = turn_messages
            state["queryId"] = state.get("queryId") or find_last_human_message_id(
                turn_messages
            )
        return


def is_terminal_message(item):
    if not isinstance(item, dict):
        return False
    return item.get("type") == "RESULT" and item.get("status") in (
        "SUCCESS",
        "FAIL",
        "INTERRUPT",
    )


def execute_sse_chat(args, payload):
    received_any = False
    state = {"partialAnswer": "", "turnMessages": [], "queryId": None, "runId": None}
    try:
        for item in request_sse(
            "POST", "/external/api/openclaw/sse/chat", payload=payload
        ):
            received_any = True
            apply_sse_packet(state, item)
            if item.get("event") == "end":
                result = build_chat_result_from_sse(payload, state)
                if result is not None:
                    return result
        result = build_chat_result_from_sse(payload, state)
        if result is not None:
            return result
        raise StreamExecutionError(
            "SSE stream ended unexpectedly before terminal result",
            received_any=received_any,
        )
    except Exception as error:
        if isinstance(error, StreamExecutionError):
            raise
        raise StreamExecutionError(str(error), received_any=received_any)


def poll_chat_history_result(payload, max_wait_seconds=30):
    deadline = time.time() + max_wait_seconds
    while time.time() < deadline:
        history = parse_response(
            request_json(
                "POST",
                "/external/api/openclaw/history",
                payload={
                    "publishedAgentId": payload["publishedAgentId"],
                    "externalSessionKey": payload["externalSessionKey"],
                    "channelType": payload["channelType"],
                },
            )
        )
        turns = history.get("turns") if isinstance(history, dict) else []
        for item in turns or []:
            if item.get("queryId") != payload["queryId"]:
                continue
            answer = item.get("answer")
            status = item.get("status")
            if answer and status == "SUCCESS":
                return build_chat_result_from_history_turn(payload, item)
        time.sleep(0.5)
    raise RuntimeError(
        "Unable to recover terminal result from history after SSE interruption"
    )


def build_chat_result_from_history_turn(payload, turn):
    summaries = turn.get("messageSummaries") or []
    result_messages = []
    for item in summaries:
        if not isinstance(item, dict):
            continue
        result_messages.append(
            {
                "type": item.get("type"),
                "status": item.get("status"),
                "content": item.get("content"),
            }
        )
    if not result_messages and turn.get("answer"):
        result_messages.append(
            {
                "type": "RESULT",
                "status": turn.get("status") or "SUCCESS",
                "content": turn.get("answer"),
            }
        )
    return {
        "externalSessionKey": payload.get("externalSessionKey"),
        "queryId": turn.get("queryId") or payload.get("queryId"),
        "status": turn.get("status") or "UNKNOWN",
        "content": turn.get("answer") or "",
        "messages": result_messages,
    }


def cmd_chat(args):
    return execute_chat(args)


def build_chat_job_state(payload, job_id, status):
    now = time.time()
    return {
        "jobId": job_id,
        "jobType": "chat",
        "status": status,
        "createdAt": now,
        "updatedAt": now,
        "completedAt": None,
        "publishedAgentId": payload.get("publishedAgentId"),
        "externalSessionKey": payload.get("externalSessionKey"),
        "queryId": payload.get("queryId"),
        "channelType": payload.get("channelType"),
        "traceId": payload.get("traceId"),
        "result": None,
        "error": None,
        "logPath": job_log_file(job_id),
    }


def build_worker_command(args, job_id, payload):
    command = [
        sys.executable,
        str(Path(__file__).resolve()),
        "__chat-worker",
        "--job-id",
        job_id,
        "--published-agent-id",
        payload["publishedAgentId"],
        "--question",
        payload["userMessage"],
        "--external-session-key",
        payload["externalSessionKey"],
        "--query-id",
        payload["queryId"],
        "--channel-type",
        payload["channelType"],
        "--trace-id",
        payload["traceId"],
    ]
    if payload.get("locale"):
        command.extend(["--locale", payload["locale"]])
    return command


def spawn_chat_worker(args, job_id, payload):
    log_path = job_log_file(job_id)
    command = build_worker_command(args, job_id, payload)
    with open(log_path, "a", encoding="utf-8") as handle:
        process = subprocess.Popen(
            command,
            stdout=handle,
            stderr=handle,
            start_new_session=True,
        )
    return process.pid


def cmd_chat_start(args):
    cleanup_old_jobs()
    payload = build_chat_payload(
        args, ensure(args.published_agent_id, "published_agent_id")
    )
    job_id = str(uuid.uuid4())
    job_state = build_chat_job_state(payload, job_id, "RUNNING")
    save_job(job_id, job_state)
    try:
        pid = spawn_chat_worker(args, job_id, payload)
        job_state["pid"] = pid
        save_job(job_id, job_state)
    except Exception as error:
        now = time.time()
        job_state["status"] = "FAILED"
        job_state["updatedAt"] = now
        job_state["completedAt"] = now
        job_state["error"] = str(error)
        save_job(job_id, job_state)
        raise
    return {
        "jobId": job_id,
        "status": "RUNNING",
        "publishedAgentId": job_state["publishedAgentId"],
        "externalSessionKey": job_state["externalSessionKey"],
        "queryId": job_state["queryId"],
        "channelType": job_state["channelType"],
        "traceId": job_state["traceId"],
    }


def cmd_chat_status(args):
    job = load_job(args.job_id)
    if job.get("status") == "RUNNING" and not is_process_alive(job.get("pid")):
        now = time.time()
        job["status"] = "FAILED"
        job["updatedAt"] = now
        job["completedAt"] = now
        job["error"] = job.get("error") or "chat worker exited unexpectedly"
        save_job(args.job_id, job)
    return {
        "jobId": job.get("jobId"),
        "status": job.get("status"),
        "publishedAgentId": job.get("publishedAgentId"),
        "externalSessionKey": job.get("externalSessionKey"),
        "queryId": job.get("queryId"),
        "channelType": job.get("channelType"),
        "traceId": job.get("traceId"),
        "createdAt": job.get("createdAt"),
        "updatedAt": job.get("updatedAt"),
        "completedAt": job.get("completedAt"),
        "error": job.get("error"),
        "resultReady": job.get("result") is not None,
    }


def cmd_chat_result(args):
    job = load_job(args.job_id)
    if job.get("status") == "RUNNING" and not is_process_alive(job.get("pid")):
        now = time.time()
        job["status"] = "FAILED"
        job["updatedAt"] = now
        job["completedAt"] = now
        job["error"] = job.get("error") or "chat worker exited unexpectedly"
        save_job(args.job_id, job)
    result = job.get("result")
    if isinstance(result, dict):
        result = build_chat_display(result)
    return {
        "jobId": job.get("jobId"),
        "status": job.get("status"),
        "publishedAgentId": job.get("publishedAgentId"),
        "externalSessionKey": job.get("externalSessionKey"),
        "queryId": job.get("queryId"),
        "completedAt": job.get("completedAt"),
        "error": job.get("error"),
        "result": result,
        "ready": job.get("status") in ("SUCCEEDED", "FAILED"),
    }


def build_chat_wait_timeout_message(job_id, timeout_seconds):
    return (
        f"chat-wait timed out after {timeout_seconds} seconds, "
        f"jobId={job_id}. Use chat-status or chat-result to continue polling."
    )


def wait_for_chat_job(job_id, timeout_seconds, poll_interval_seconds):
    if timeout_seconds <= 0:
        raise ValueError("timeout_seconds must be greater than 0")
    if poll_interval_seconds <= 0:
        raise ValueError("poll_interval_seconds must be greater than 0")
    deadline = time.time() + timeout_seconds
    result_args = argparse.Namespace(job_id=job_id)
    result = cmd_chat_result(result_args)
    while not result.get("ready"):
        if time.time() >= deadline:
            raise RuntimeError(build_chat_wait_timeout_message(job_id, timeout_seconds))
        time.sleep(poll_interval_seconds)
        result = cmd_chat_result(result_args)
    return result


def cmd_chat_wait(args):
    start_result = cmd_chat_start(args)
    job_id = start_result["jobId"]
    timeout_seconds = getattr(args, "timeout_seconds", 300)
    poll_interval_seconds = getattr(args, "poll_interval_seconds", 3)
    return wait_for_chat_job(job_id, timeout_seconds, poll_interval_seconds)


def cmd_chat_worker(args):
    job = load_job(args.job_id)
    try:
        payload = build_chat_payload(
            args, ensure(args.published_agent_id, "published_agent_id")
        )
        payload["externalSessionKey"] = ensure(
            args.external_session_key, "external_session_key"
        )
        payload["queryId"] = ensure(args.query_id, "query_id")
        payload["traceId"] = ensure(args.trace_id, "trace_id")
        payload["channelType"] = default_channel(args.channel_type)
        try:
            result = execute_sse_chat(args, payload)
        except StreamExecutionError as error:
            if error.received_any:
                result = poll_chat_history_result(payload)
            else:
                raise
        now = time.time()
        job["status"] = "SUCCEEDED"
        job["updatedAt"] = now
        job["completedAt"] = now
        job["result"] = result
        job["error"] = None
        save_job(args.job_id, job)
    except Exception as error:
        now = time.time()
        job["status"] = "FAILED"
        job["updatedAt"] = now
        job["completedAt"] = now
        job["result"] = None
        job["error"] = str(error)
        save_job(args.job_id, job)


def cmd_list_agents(args):
    return list_agents(getattr(args, "refresh", False))


def cmd_get_agent(args):
    return parse_response(
        request_json(
            "GET",
            f"/external/api/openclaw/agents/{ensure(args.published_agent_id, 'published_agent_id')}",
        )
    )


def cmd_get_editable_agent(args):
    query = {"channelType": default_channel(args.channel_type)}
    if args.trace_id:
        query["traceId"] = args.trace_id
    return parse_response(
        request_json(
            "GET",
            f"/external/api/openclaw/agents/{ensure(args.agent_id, 'agent_id')}/editable",
            query=query,
        )
    )


def cmd_list_skills(args):
    return with_cache(
        "skills",
        getattr(args, "refresh", False),
        lambda: parse_response(request_json("GET", "/external/api/openclaw/skills")),
    )


def cmd_list_llm_configs(args):
    return list_llm_configs(getattr(args, "refresh", False))


def cmd_list_sessions(args):
    query = {"channelType": default_channel(args.channel_type)}
    if args.published_agent_id:
        query["publishedAgentId"] = args.published_agent_id
    return parse_response(
        request_json("GET", "/external/api/openclaw/sessions", query=query)
    )


def cmd_history(args):
    payload = {
        "publishedAgentId": ensure(args.published_agent_id, "published_agent_id"),
        "externalSessionKey": ensure(args.external_session_key, "external_session_key"),
        "channelType": default_channel(args.channel_type),
    }
    return parse_response(
        request_json("POST", "/external/api/openclaw/history", payload=payload)
    )


def cmd_create_agent(args):
    return parse_response(
        request_json(
            "POST",
            "/external/api/openclaw/agents/create",
            payload=build_create_agent_payload(args),
        )
    )


def cmd_save_agent(args):
    payload, removed_keys = build_save_agent_payload(args)
    result = parse_response(
        request_json("POST", "/external/api/openclaw/agents/save", payload=payload)
    )
    if isinstance(result, dict) and removed_keys:
        result["_removedKeys"] = removed_keys
    return result


def cmd_save_from_agent(args):
    editable = cmd_get_editable_agent(args)
    if not isinstance(editable, dict):
        raise RuntimeError("editable agent payload is not an object")
    if args.description:
        editable["description"] = args.description
    if args.name:
        editable["name"] = args.name
    payload, removed_keys = sanitize_agent_payload(editable, "save")
    payload["userConfirmed"] = args.user_confirmed
    payload["channelType"] = default_channel(args.channel_type)
    payload["traceId"] = args.trace_id or str(uuid.uuid4())
    payload = choose_default_llm_id(payload, False)
    result = parse_response(
        request_json("POST", "/external/api/openclaw/agents/save", payload=payload)
    )
    if isinstance(result, dict) and removed_keys:
        result["_removedKeys"] = removed_keys
    return result


def cmd_publish_agent(args):
    publish_to_workspace = (
        args.publish_to_workspace or not args.publish_to_standalone_url
    )
    payload = {
        "publishToWorkspace": publish_to_workspace,
        "publishToStandaloneUrl": args.publish_to_standalone_url,
        "channelType": default_channel(args.channel_type),
        "traceId": args.trace_id or str(uuid.uuid4()),
    }
    return parse_response(
        request_json(
            "POST",
            f"/external/api/openclaw/agents/{ensure(args.agent_id, 'agent_id')}/publish",
            payload=payload,
        )
    )


def cmd_validate_config(args):
    payload = read_json_file(args.config_file)
    sanitized, removed_keys = sanitize_agent_payload(payload, args.validation_mode)
    sanitized = choose_default_llm_id(sanitized, False)
    return {
        "validationMode": args.validation_mode,
        "valid": True,
        "removedKeys": removed_keys,
        "readonlyKeys": sorted(
            key for key in removed_keys if key in READONLY_AGENT_KEYS
        ),
        "sanitizedPayload": sanitized,
    }


def build_parser():
    parser = argparse.ArgumentParser(description="Unified Dora skill for OpenClaw")
    subparsers = parser.add_subparsers(dest="mode", required=True)

    def add_question_mode(name):
        sub = subparsers.add_parser(name)
        sub.add_argument("--question", required=True)
        sub.add_argument("--published-agent-id", required=True)
        sub.add_argument("--external-session-key")
        sub.add_argument("--query-id")
        sub.add_argument("--channel-type")
        sub.add_argument("--trace-id")
        sub.add_argument("--locale")
        return sub

    add_question_mode("chat")
    add_question_mode("chat-start")
    chat_wait = add_question_mode("chat-wait")
    chat_wait.add_argument("--timeout-seconds", type=int, default=300)
    chat_wait.add_argument("--poll-interval-seconds", type=int, default=3)
    chat_status = subparsers.add_parser("chat-status")
    chat_status.add_argument("--job-id", required=True)

    chat_result = subparsers.add_parser("chat-result")
    chat_result.add_argument("--job-id", required=True)

    chat_worker = subparsers.add_parser("__chat-worker", help=argparse.SUPPRESS)
    chat_worker.add_argument("--job-id", required=True)
    chat_worker.add_argument("--question", required=True)
    chat_worker.add_argument("--published-agent-id", required=True)
    chat_worker.add_argument("--external-session-key", required=True)
    chat_worker.add_argument("--query-id", required=True)
    chat_worker.add_argument("--channel-type")
    chat_worker.add_argument("--trace-id", required=True)
    chat_worker.add_argument("--locale")

    get_agent = subparsers.add_parser("get-agent")
    get_agent.add_argument("--published-agent-id", required=True)

    get_editable_agent = subparsers.add_parser("get-editable-agent")
    get_editable_agent.add_argument("--agent-id", required=True)
    get_editable_agent.add_argument("--channel-type")
    get_editable_agent.add_argument("--trace-id")

    list_sessions = subparsers.add_parser("list-sessions")
    list_sessions.add_argument("--channel-type")
    list_sessions.add_argument("--published-agent-id")
    list_sessions.add_argument(
        "--output-mode", choices=["full", "compact"], default="full"
    )

    history = subparsers.add_parser("history")
    history.add_argument("--published-agent-id", required=True)
    history.add_argument("--external-session-key", required=True)
    history.add_argument("--channel-type")
    history.add_argument("--output-mode", choices=["full", "compact"], default="full")

    list_agents_parser = subparsers.add_parser("list-agents")
    list_agents_parser.add_argument(
        "--output-mode", choices=["full", "compact"], default="full"
    )
    list_agents_parser.add_argument("--refresh", action="store_true")

    list_skills_parser = subparsers.add_parser("list-skills")
    list_skills_parser.add_argument(
        "--output-mode", choices=["full", "compact"], default="full"
    )
    list_skills_parser.add_argument("--refresh", action="store_true")

    list_llm_configs_parser = subparsers.add_parser("list-llm-configs")
    list_llm_configs_parser.add_argument(
        "--output-mode", choices=["full", "compact"], default="full"
    )
    list_llm_configs_parser.add_argument("--refresh", action="store_true")

    create_agent = subparsers.add_parser("create-agent")
    create_agent.add_argument("--name")
    create_agent.add_argument("--description")
    create_agent.add_argument("--avatar")
    create_agent.add_argument("--welcome-message")
    create_agent.add_argument("--system-prompt")
    create_agent.add_argument("--skill-ids")
    create_agent.add_argument("--llm-config-id")
    create_agent.add_argument("--agent-type")
    create_agent.add_argument("--config-file")
    create_agent.add_argument("--publish-to-workspace", action="store_true")
    create_agent.add_argument("--publish-to-standalone-url", action="store_true")
    create_agent.add_argument("--vendor")
    create_agent.add_argument("--api-url")
    create_agent.add_argument("--api-token")
    create_agent.add_argument("--bot-id")
    create_agent.add_argument("--channel-type")
    create_agent.add_argument("--trace-id")
    create_agent.add_argument("--refresh", action="store_true")
    create_agent.add_argument("--user-confirmed", action="store_true")

    save_agent = subparsers.add_parser("save-agent")
    save_agent.add_argument("--config-file", required=True)
    save_agent.add_argument("--channel-type")
    save_agent.add_argument("--trace-id")
    save_agent.add_argument("--user-confirmed", action="store_true")

    save_from_agent = subparsers.add_parser("save-from-agent")
    save_from_agent.add_argument("--agent-id", required=True)
    save_from_agent.add_argument("--name")
    save_from_agent.add_argument("--description")
    save_from_agent.add_argument("--channel-type")
    save_from_agent.add_argument("--trace-id")
    save_from_agent.add_argument("--user-confirmed", action="store_true")

    publish_agent = subparsers.add_parser("publish-agent")
    publish_agent.add_argument("--agent-id", required=True)
    publish_agent.add_argument("--publish-to-workspace", action="store_true")
    publish_agent.add_argument("--publish-to-standalone-url", action="store_true")
    publish_agent.add_argument("--channel-type")
    publish_agent.add_argument("--trace-id")

    validate_config = subparsers.add_parser("validate-config")
    validate_config.add_argument("--config-file", required=True)
    validate_config.add_argument(
        "--validation-mode", choices=["create", "save"], default="save"
    )

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()
    handlers = {
        "chat": cmd_chat,
        "chat-start": cmd_chat_start,
        "chat-wait": cmd_chat_wait,
        "chat-status": cmd_chat_status,
        "chat-result": cmd_chat_result,
        "__chat-worker": cmd_chat_worker,
        "list-agents": cmd_list_agents,
        "get-agent": cmd_get_agent,
        "get-editable-agent": cmd_get_editable_agent,
        "list-skills": cmd_list_skills,
        "list-llm-configs": cmd_list_llm_configs,
        "list-sessions": cmd_list_sessions,
        "history": cmd_history,
        "create-agent": cmd_create_agent,
        "save-agent": cmd_save_agent,
        "save-from-agent": cmd_save_from_agent,
        "publish-agent": cmd_publish_agent,
        "validate-config": cmd_validate_config,
    }
    try:
        result = handlers[args.mode](args)
        if args.mode == "__chat-worker":
            return
        print(
            json.dumps(
                render_success(args.mode, args, result), ensure_ascii=False, indent=2
            )
        )
    except urllib.error.HTTPError as error:
        body = decode_body(error.read())
        print(
            json.dumps(
                render_error(
                    args.mode, args, f"HTTP {error.code}: {body or '<empty>'}"
                ),
                ensure_ascii=False,
                indent=2,
            ),
            file=sys.stderr,
        )
        sys.exit(1)
    except urllib.error.URLError as error:
        print(
            json.dumps(
                render_error(args.mode, args, f"Request failed: {error}"),
                ensure_ascii=False,
                indent=2,
            ),
            file=sys.stderr,
        )
        sys.exit(1)
    except Exception as error:
        print(
            json.dumps(
                render_error(args.mode, args, str(error)), ensure_ascii=False, indent=2
            ),
            file=sys.stderr,
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
