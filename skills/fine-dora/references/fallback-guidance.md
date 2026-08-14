# Fallback Guidance

Use this file when OpenClaw needs to decide whether to trust `fine-dora`, retry through a safer Dora path, or stop using Dora and answer natively.

## When To Fallback

Fallback to OpenClaw-native answering only when one of the following is true:

- the script returns `success=false`
- the async chat job ends `FAILED`
- the Dora answer is obviously inconsistent with the active conversation context, even though execution technically succeeded
- the worker exhausted its built-in recovery order and still failed

## Built-in Recovery Order

Before OpenClaw falls back to native answering, `fine-dora` already performs these recovery steps internally:

1. `/external/api/openclaw/sse/chat`
2. `/external/api/openclaw/history` if partial SSE output was already received

OpenClaw should not manually re-run these transport-level fallbacks unless there is evidence that the worker itself failed before completing its own recovery order.

## How To Fallback

1. Preserve the current OpenClaw context.
2. Answer from OpenClaw’s own context and reasoning.
3. Add a footnote telling the user that `fine-dora` failed and the answer comes from OpenClaw itself.

Strict constraint: when explaining why Dora failed, what Dora returned, or how Dora influenced the decision, use only the real API response returned by this skill. Never fabricate missing Dora facts, intermediate results, or business conclusions.

Use the wording pattern in `../assets/fallback-footnote-example.md`.

## What To Inspect Before Falling Back

- `error`
- `data.status`
- `data.resultReady` or `data.ready`
- `data.externalSessionKey`
- `data.queryId`

For async chat specifically:

1. If `chat-status` still shows `RUNNING`, keep polling instead of falling back immediately.
2. If `chat-result` still shows `ready=false`, keep polling or use `chat-wait` instead of falling back immediately.
3. If `chat-result` shows `ready=true` with `status=FAILED`, inspect the stored `error`.
4. If the worker reached a terminal state without a good answer, then decide whether to fallback natively.

If the failure is caused by stale discovery, rerun the needed discovery action with `--refresh` before giving up.
