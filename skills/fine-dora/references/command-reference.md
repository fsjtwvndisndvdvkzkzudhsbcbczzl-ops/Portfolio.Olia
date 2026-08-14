# Command Reference

All commands run through `python3 {baseDir}/scripts/fine_dora.py`.

## Discovery

- `list-agents`
  - Optional: `--output-mode <full|compact>`, `--refresh`
  - Output note: compact mode prefers `name`, `description`, `published`, `agentStatus`, `skillNames`, and resolved skill summaries before raw IDs

- `list-skills`
  - Optional: `--output-mode <full|compact>`, `--refresh`
  - Output note: compact mode prefers `name`, `description`, and capability metadata before raw IDs
  - Contract note: this endpoint returns available skill templates and capability metadata

- `list-llm-configs`
  - Optional: `--output-mode <full|compact>`, `--refresh`

## Chat And Sessions

- `chat`
  - Required: `--published-agent-id`, `--question`
  - Optional: `--channel-type`, `--external-session-key`, `--query-id`, `--trace-id`, `--locale <BCP-47-tag>`
  - Note: if `--channel-type` is omitted, the script must obtain it from `DORA_CHANNEL_TYPE`
  - Runtime order: consume `/sse/chat` directly, parse SSE events into the final answer, and fail if the stream produces no usable event

- `chat-start`
  - Required: `--published-agent-id`, `--question`
  - Optional: `--channel-type`, `--external-session-key`, `--query-id`, `--trace-id`, `--locale <BCP-47-tag>`
  - Purpose: create a local async chat job record and start a background worker that prefers Dora `/external/api/openclaw/sse/chat`
  - Runtime order: `/sse/chat` first, parse SSE events into the final answer, and use `/history` only if partial SSE was already received but the final answer still cannot be stably converged from stream events
  - Note: if `--channel-type` is omitted, the script must obtain it from `DORA_CHANNEL_TYPE`

- `chat-wait`
  - Required: `--published-agent-id`, `--question`
  - Optional: `--channel-type`, `--external-session-key`, `--query-id`, `--trace-id`, `--locale <BCP-47-tag>`, `--timeout-seconds`, `--poll-interval-seconds`
  - Purpose: start an async chat job, then continue polling until terminal state and return the same payload shape as `chat-result`
  - Polling rule: this is the convenience command for callers that want the skill itself to keep waiting instead of manually looping on `chat-status` / `chat-result`
  - Terminal rule: timeout raises an explicit error; terminal success/failure still require inspecting `status`, `ready`, and `error`
  - Note: if `--channel-type` is omitted, the script must obtain it from `DORA_CHANNEL_TYPE`

Locale rules for all chat entry points:

- `--locale` is optional and affects only the current chat request.
- The channel or client must supply the end user's configured, well-formed BCP 47 tag with a specific language subtag other than `und`, such as `zh-CN`, `en-US`, or `ja-JP`; the model must not guess it from message text.
- If omitted, Dora resolves language from the API-key user's preference, then HTTP `Accept-Language`, then simplified Chinese.
- Invalid non-empty tags are rejected by Dora instead of silently falling back.

- `chat-status`
  - Required: `--job-id`
  - Purpose: inspect whether the local async chat job is still running, succeeded, or failed
  - Important: `resultReady=true` only means the worker reached a terminal state and wrote a result payload; callers still need to inspect `status` and `error`

- `chat-result`
  - Required: `--job-id`
  - Purpose: fetch the current result snapshot of an async chat job
  - Important: one `chat-result` call does not guarantee a final result; if `ready=false`, callers must continue polling or switch to `chat-wait`

- `get-agent`
  - Required: `--published-agent-id`
  - Output note: returns published detail fields plus readable helpers such as `skillNames` and `readableSkills`, together with publish-state summary fields such as `published`, `agentStatus`, and publish target flags

- `get-editable-agent`
  - Required: `--agent-id`
  - Optional: `--trace-id`
  - Note: if `--channel-type` is omitted, the script must obtain it from `DORA_CHANNEL_TYPE`
  - Output note: keeps raw write-back IDs such as `skillIds` and `llmConfigId`, while adding display-only helpers such as `skillNames`, `readableSkills`, and `llmConfigName`; sensitive write-noise such as `apiToken` should not appear in this façade response
  - Dependency note: editable/save flows continue to rely on `skillConfigs` from this endpoint, not on `list-skills` binding metadata

- `list-sessions`
  - Optional: `--published-agent-id`, `--output-mode <full|compact>`
  - Note: `channelType` is required by Dora; if `--channel-type` is omitted, the script must obtain it from `DORA_CHANNEL_TYPE`

- `history`
  - Required: `--published-agent-id`, `--external-session-key`
  - Optional: `--channel-type`, `--output-mode <full|compact>`
  - Note: if `--channel-type` is omitted, the script must obtain it from `DORA_CHANNEL_TYPE`
  - Output note: history returns `thread_id` plus ordered `turns`

## Agent Edit Flow

- `validate-config`
  - Required: `--config-file`
  - Optional: `--validation-mode <create|save>`
  - Purpose: strip Dora read-only fields and reveal removed keys before mutating Dora

- `save-from-agent`
  - Required: `--agent-id`, `--user-confirmed`
  - Optional: `--name`, `--description`, `--channel-type`, `--trace-id`
  - Purpose: fetch editable config first, patch a few fields, sanitize, then save
  - Note: if `--channel-type` is omitted, the script must obtain it from `DORA_CHANNEL_TYPE`

- `save-agent`
  - Required: `--config-file`, `--user-confirmed`
  - Optional: `--channel-type`, `--trace-id`
  - Purpose: save a local config file after sanitization
  - Config note: file-based save flows should use Dora-native `skillConfigs`
  - Note: if `--channel-type` is omitted, the script must obtain it from `DORA_CHANNEL_TYPE`

- `create-agent`
  - Required: `--user-confirmed`, plus `--config-file` or enough inline fields to build a valid draft
  - Optional: `--name`, `--description`, `--avatar`, `--welcome-message`, `--system-prompt`, `--skill-ids`, `--llm-config-id`, `--agent-type`, `--publish-to-workspace`, `--publish-to-standalone-url`, `--vendor`, `--api-url`, `--api-token`, `--bot-id`, `--channel-type`, `--trace-id`, `--refresh`
  - Config note: config files should use Dora-native `skillConfigs`; `--skill-ids` is only the explicit inline CLI shortcut when you intentionally want ID-based binding
  - Enum note: `--agent-type` and config-file `agentType` should use Dora enum values such as `WRAPPED` or `INTEGRATION`
  - Note: if `--channel-type` is omitted, the script must obtain it from `DORA_CHANNEL_TYPE`

- `publish-agent`
  - Required: `--agent-id`
  - Optional: `--publish-to-workspace`, `--publish-to-standalone-url`, `--channel-type`, `--trace-id`
  - Note: if `--channel-type` is omitted, the script must obtain it from `DORA_CHANNEL_TYPE`
  - Output note: returns a minimal publish outcome summary rather than editable config

## Output Contract

Every command returns one outer schema:

- `success`
- `action`
- `mode`
- `data`
- `error`
- `meta`

For save-related actions, sanitized removals may appear in `data._removedKeys`.

For discovery and detail reads:

- Prefer readable helper fields first: `name`, `description`, `skillNames`, `readableSkills`, `llmConfigName`
- For agent list/detail reads, also inspect `published`, `agentStatus`, `publishToWorkspace`, and `publishToStandaloneUrl` before deciding whether to chat, edit, or publish
- Treat `id`, `skillIds`, and `llmConfigId` as operational follow-up fields, not the primary display text
- `get-editable-agent` readable helpers are display-only; keep the raw write-back fields unchanged when saving
- Strict constraint: every answer, summary, routing decision, follow-up suggestion, or fallback explanation that uses Dora data must be grounded in the real API response returned by this skill. Never fabricate, infer, or fill in missing business data as if it were returned by Dora.

For async chat actions:

- `chat-start` returns a `jobId` plus the generated `externalSessionKey` / `queryId`
- `chat-status` returns job lifecycle fields such as `status`, `createdAt`, `updatedAt`, `completedAt`, and `resultReady`
- `chat-result` returns `ready`, `status`, `error`, and `result`
- Async callers should continue polling `chat-status` or `chat-result` until terminal state (`ready=true` or terminal job status), unless their own timeout/cancel policy says otherwise
- `chat-result.data.result` reuses the same normalized chat display shape as sync `chat`, including `displayText` and `messageSummaries`
