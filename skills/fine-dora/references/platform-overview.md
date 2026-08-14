# Platform Overview

`fine-dora` is a Python skill wrapper around Dora’s external OpenClaw API surface.

## Runtime Assumptions

- `python3` and `pip3` are available.
- `DORA_API_BASE` points to the actual Dora API base reachable in the current environment.
- `DORA_API_KEY` uses the actual complete key available in the current environment. Format: `sk-` followed by 32 base62 characters.
- `DORA_CHANNEL_TYPE` is optional but recommended.

## Discovery Behavior

- Agent, skill, and LLM discovery are cached locally for 30 minutes.
- `--refresh` forces the script to bypass cache and re-read Dora in real time.

## Ownership Boundary

- Dora provides discovery, execution, editable config read/save, publish, and session mapping.
- OpenClaw decides which agent or skill to use, when to ask for confirmation, when to refresh, and when to fallback.

## Chat Execution Detail

- `fine-dora` exposes two chat modes over the same Dora SSE facade:
  1. direct `chat` command
  2. async job flow `chat-start` -> `chat-status` / `chat-result`
- The async job model exists to prevent OpenClaw from treating one long blocking Dora conversation as a timeout.
- Both modes consume Dora `/external/api/openclaw/sse/chat` as the chat execution endpoint.
- The worker parses SSE packets directly, converges the final answer from stream events, and only uses `/external/api/openclaw/history` when SSE has started but the final answer still cannot be stably recovered from the stream.
- If SSE produces no usable event at all, the chat is treated as failed.
- `fine-dora` still exposes normalized `displayText` and `messageSummaries` so OpenClaw can render the final Dora answer naturally and retain structured execution context.
