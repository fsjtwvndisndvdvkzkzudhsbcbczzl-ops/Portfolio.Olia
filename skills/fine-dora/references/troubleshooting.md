# Troubleshooting

## `save-agent` Says JSON Parse Failed

Most likely Dora returned HTTP 200 with an empty body, a non-JSON body, or even an HTML page. This skill distinguishes these cases explicitly.

- Empty body: treated as a soft-success signal with a diagnosis message attached.
- HTML body: treated as a transport-format failure with a clear warning that the business write may already have succeeded.
- Other non-JSON body: treated the same way, but labeled as generic non-JSON success body.

If the body is HTML, assume Dora's save endpoint or gateway responded with a fallback page. The business write may or may not have succeeded. Always re-run `get-editable-agent` to verify the final state.

## Editable Payload Fails On Save

`get-editable-agent` may return fields that should not be sent back unchanged, such as:

- `agentStatus`
- `published`
- `publishedAt`
- `createdBy`
- `createdAt`
- `updatedAt`

Use `validate-config --validation-mode save` or prefer `save-from-agent`.

## Save File Does Not Use `skillConfigs`

`create-agent` and `save-agent` config files should use Dora-native `skillConfigs` as the write contract.

If your save file only contains `skills` or `skillIds`, rebuild the payload from `list-skills` or start from `get-editable-agent` before saving.

## Create Or Save File Misses `datasourceIds` / `knowledgeSpaceIds`

If the selected `skillConfigs` depend on data bindings, keep `datasourceIds` and `knowledgeSpaceIds` aligned with the intended business scope before publish.

## Discovery Looks Stale

Use `--refresh` on `list-agents`, `list-skills`, or `list-llm-configs`.

If readable helper fields such as `skillNames`, `readableSkills`, or `llmConfigName` look outdated or incomplete, refresh discovery first so the local cache can resolve the latest names.

## Dora Request Fails Entirely

Check:

- `DORA_API_BASE` includes `/webroot/decision`
- `DORA_API_KEY` is valid
- Dora exposes `/external/api/openclaw`

## Quick Safe Pattern For Existing Agents

1. `get-editable-agent`
2. `save-from-agent` for the minimal changed fields
3. `get-editable-agent` again to verify the result

## Readable Fields Versus Write-Back Fields

`get-editable-agent` may include display-only helper fields such as:

- `skillNames`
- `readableSkills`
- `llmConfigName`

These fields exist only to make the response easier to read. For write-back, keep using the authoritative Dora fields such as `id`, `skillConfigs`, `datasourceIds`, `knowledgeSpaceIds`, `skillIds`, and `llmConfigId`.

## `chat-start` Returns A `jobId` But `chat-status` Stays `RUNNING`

Check:

1. Whether Dora-side `/external/api/openclaw/sse/chat` is reachable;
2. Whether the local worker log file under the fine-dora job directory contains transport errors;
3. Whether the generated `externalSessionKey` / `queryId` are valid;
4. Whether the background worker exited unexpectedly before writing final state.

If needed, run `chat-result --job-id <job-id>` to inspect the stored `error` field.

Remember that `RUNNING` does not mean "stuck" by itself. It may simply mean the worker is still consuming `/sse/chat` or waiting for a recoverable `/history` completion path.

## `chat-result` Returns `ready=false`

This means the async worker has not yet written a terminal state.

Recommended handling:

1. Retry `chat-status` first;
2. If the job remains `RUNNING` for unexpectedly long, inspect the worker log;
3. Remember the worker recovery order: `/sse/chat` first, then `/history` only if partial stream exists but the final answer still cannot be converged from SSE itself;
4. Continue polling until terminal state, or use `chat-wait` if you want the skill to keep waiting on your behalf;
5. If the underlying Dora chat is no longer worth waiting for, stop polling and let OpenClaw decide whether to answer natively.

## Async Chat Stops Too Early

`chat-result` is a snapshot read, not a promise that the final result is ready on the first call.

Use one of these two patterns:

1. `chat-start` -> repeated `chat-status` / `chat-result` until terminal state
2. `chat-wait` when you want the skill itself to wait and return only after terminal state or timeout

## `chat-result` Returns `ready=true` But `status=FAILED`

This means the async flow finished, but no successful answer was recovered.

Recommended handling:

1. Inspect `error` first;
2. If the failure happened before any SSE content arrived, treat it as a Dora-side transport failure;
3. If the worker already attempted `/history` and still failed, decide whether OpenClaw should answer natively using the guidance in `fallback-guidance.md`.
