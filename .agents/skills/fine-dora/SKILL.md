---
name: fine-dora
description: Dora discovery, chat, session inspection, and Dora-side agent create/update/publish through one Python skill. Use when OpenClaw needs to route to Dora agents, inspect Dora sessions/history, or safely create, edit, validate, save, and publish Dora agents. This skill sanitizes editable payloads, distinguishes empty/HTML/non-JSON 2xx responses, and provides validation helpers for safer Dora agent updates.
---

# Fine Dora

Use this skill for Dora-backed discovery, conversation, session inspection, and Dora-side agent management.

## Minimal Flow

1. Run discovery first when routing is unclear: `list-agents`, `list-skills`, `list-llm-configs`.
2. Prefer async chat job flow: `chat-start` -> repeated `chat-status` / `chat-result` until terminal state, or directly use `chat-wait`. The worker consumes Dora `/sse/chat`, parses SSE events into the final normalized answer, and only uses `history` as a fallback when SSE was received but the final answer still cannot be stably converged from the stream itself.
3. Use `get-editable-agent` before modifying an existing agent.
4. Use `save-from-agent` for small edits on existing agents.
5. Use `validate-config` before `save-agent` when the config file did not come directly from this skill.
6. Use `save-agent` for fully managed local config files.
7. Fallback to OpenClaw-native answering only when Dora truly fails or returns context-breaking output.

## What To Read

- Read `references/command-reference.md` for exact command choices.
- Read `references/interface-examples.md` for request/response examples of every command.
- Read `references/fallback-guidance.md` for the exact fallback order and when OpenClaw should stop trusting Dora output.
- Read `references/parameter-decision-guide.md` for routing and edit decisions.
- Read `references/troubleshooting.md` for save failures, malformed bodies, and cache issues.

## Runtime Setup

- `DORA_API_BASE` should point to the actual Dora API base reachable in the current environment, for example `http://localhost:8075/webroot/decision`.
- `DORA_API_KEY` should be the actual complete key available in the current environment. Format: `sk-` followed by 32 base62 characters.
- `fine-dora` tries to auto-load a `.env` file only from its fixed workspace path. It does not scan arbitrary directories and does not automatically inherit private `.env` loading behavior from other xclaw products.
- If the current xclaw product does not expose the required variables to the `fine_dora.py` process, pass them explicitly when running the script.
- Example:
  `DORA_API_BASE="http://localhost:8075/webroot/decision" DORA_API_KEY="<your-dora-api-key>" DORA_CHANNEL_TYPE="feishu" python3 {baseDir}/scripts/fine_dora.py list-agents --output-mode compact --refresh`

## What To Run

- If `--channel-type` is omitted for a channel-dependent command, the script must obtain it from `DORA_CHANNEL_TYPE`.
- For `chat`, `chat-start`, and `chat-wait`, pass `--locale "<BCP-47-tag>"` only when the channel or client provides the end user's configured locale. The tag must contain a specific language subtag other than `und`. Do not infer it from the message text. If no reliable locale is available, omit the flag so Dora can use the API-key user's language preference and HTTP fallback.
- Discovery: `python3 {baseDir}/scripts/fine_dora.py list-agents --output-mode compact --refresh`
- Agent detail: `python3 {baseDir}/scripts/fine_dora.py get-agent --published-agent-id "<agent-id>"`
- Start async chat job: `python3 {baseDir}/scripts/fine_dora.py chat-start --published-agent-id "<agent-id>" --question "<user request>" --channel-type "<channel>"`
- Start and wait for async chat result: `python3 {baseDir}/scripts/fine_dora.py chat-wait --published-agent-id "<agent-id>" --question "<user request>" --channel-type "<channel>"`
- Check async chat job: `python3 {baseDir}/scripts/fine_dora.py chat-status --job-id "<job-id>"`
- Read async chat result: `python3 {baseDir}/scripts/fine_dora.py chat-result --job-id "<job-id>"`
- Direct chat via SSE facade: `python3 {baseDir}/scripts/fine_dora.py chat --published-agent-id "<agent-id>" --question "<user request>" --channel-type "<channel>"`
- Session inspection: `python3 {baseDir}/scripts/fine_dora.py list-sessions --channel-type "<channel>"`
- Session history: `python3 {baseDir}/scripts/fine_dora.py history --published-agent-id "<agent-id>" --external-session-key "<session-key>" --channel-type "<channel>"`
- Editable read: `python3 {baseDir}/scripts/fine_dora.py get-editable-agent --agent-id "<agent-id>" --channel-type "<channel>"`
- Safe config check: `python3 {baseDir}/scripts/fine_dora.py validate-config --config-file "<file>" --validation-mode save`
- Small edit on existing agent: `python3 {baseDir}/scripts/fine_dora.py save-from-agent --agent-id "<agent-id>" --description "<text>" --channel-type "<channel>" --user-confirmed`
- Full save from file: `python3 {baseDir}/scripts/fine_dora.py save-agent --config-file "<file>" --channel-type "<channel>" --user-confirmed`
- Create: `python3 {baseDir}/scripts/fine_dora.py create-agent --config-file "<file>" --channel-type "<channel>" --user-confirmed --refresh`
- Publish: `python3 {baseDir}/scripts/fine_dora.py publish-agent --agent-id "<agent-id>" --channel-type "<channel>"`

## Rule Of Thumb

- Strict constraint: every answer, summary, routing decision, or follow-up suggestion that uses Dora data must be grounded in the real API response returned by this skill. Never fabricate, infer, or fill in missing business data as if it were returned by Dora.
- Use `save-from-agent` for one-off edits like name, description, or prompt tweaks.
- Prefer `chat-start` + repeated `chat-status`/`chat-result`, or use `chat-wait`, for OpenClaw-facing conversations so the caller can observe in-progress work without waiting on one long blocking `chat` command; this path already contains SSE-first execution, stream-side answer convergence, and `history` fallback when the stream itself is insufficient.
- Treat `chat-result.ready=true` as "terminal", not "successful"; always inspect both `status` and `error`.
- For async chat, one `chat-result` call is only a snapshot. If `ready=false` or `status=RUNNING`, continue polling until terminal state, or use `chat-wait`.
- Use `save-agent` only when you intentionally manage the full sanitized config file; keep the file Dora-native with `skillConfigs`, keep `datasourceIds` aligned with those skills, and manage `knowledgeSpaceIds` only at Agent level.
- Treat `list-skills` as the source of skill templates and capability metadata. Use `/agents` or `get-editable-agent` when you need bound skill context for a specific agent.
- Discovery and detail reads prefer human-readable helper fields such as `name`, `description`, `skillNames`, `readableSkills`, and `llmConfigName`; also use `published`, `agentStatus`, `publishToWorkspace`, and `publishToStandaloneUrl` to decide whether the next action is chat, edit, or publish. Treat raw IDs as secondary operational values.
- Treat `get-agent` as published detail, `get-editable-agent` as the only write-safe edit model, and `publish-agent` as a minimal publish outcome readback rather than a config fetch.
- Treat `history` as a thread-based conversation read with `thread_id`, `turns`, `answer`, and `messageSummaries`.
- Use `validate-config` whenever the save file may contain Dora read-only fields.
- Keep `agentType` aligned with Dora enum values such as `WRAPPED` or `INTEGRATION`.
- `chat`, `get-editable-agent`, `list-sessions`, `history`, `create-agent`, `save-from-agent`, `save-agent`, and `publish-agent` all depend on `channelType`; when the CLI flag is omitted, `DORA_CHANNEL_TYPE` must be available.
- `--locale` is optional for chat commands and affects only that chat request. Use a well-formed BCP 47 tag with a specific language subtag other than `und`, such as `zh-CN`, `en-US`, or `ja-JP`; never let the model guess the value from user content.
- Never assume Dora always returns valid JSON even on HTTP 200.
- Treat HTML or other non-JSON 2xx responses as diagnosable transport-format failures: the write may already have happened, so re-read the resource before deciding whether to retry.

## Asset Examples

- `assets/sample-output-chat-start.json` shows the initial async job payload.
- `assets/sample-output-chat-status-running.json` shows an in-progress async job.
- `assets/sample-output-chat-result-success.json` shows a completed async result with normalized `displayText` and `messageSummaries`.
- `assets/sample-output-error.json` shows a failed command response.
- `assets/create-agent.template.json` and `assets/save-agent.template.json` show minimal `skillConfigs`-based payload templates.
- `assets/fallback-footnote-example.md` shows the wording pattern for OpenClaw-native fallback answers.

## Readability Notes

- Prefer human-readable helper fields first when reading skill output. In discovery and detail responses, start from `name`, `description`, `skillNames`, `readableSkills`, and `llmConfigName`; for agent summaries also inspect `published`, `agentStatus`, `publishToWorkspace`, and `publishToStandaloneUrl` before choosing the next action.
- Raw IDs such as `id`, `skillIds`, and `llmConfigId` remain available for follow-up commands and write-back flows, but they are not the primary display surface.
- When an agent only exposes `skillIds`, this skill resolves them through the embedded `skills` payload first and then through cached `list-skills` discovery data.
- `get-editable-agent` keeps write-safe raw fields intact. The added readable helper fields are display-only and must not replace the authoritative write-back fields.
