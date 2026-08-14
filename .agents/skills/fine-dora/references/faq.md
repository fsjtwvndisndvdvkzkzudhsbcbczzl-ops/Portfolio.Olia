# FAQ

## Why does `chat` need `--published-agent-id`?

Because OpenClaw, not `fine-dora`, is responsible for choosing the correct Dora agent.

## Why does `create-agent` require `--user-confirmed`?

Because modifying Dora-side agent state must only happen after OpenClaw has obtained explicit user confirmation.

The same confirmation rule also applies to `save-agent` and `save-from-agent`.

## When should I call `list-llm-configs`?

Before creating a `WRAPPED` agent when OpenClaw needs to choose an LLM explicitly.

## Why do discovery commands support `--refresh`?

To bypass the 30-minute local cache when the user asks for fresh discovery data.

## Why should OpenClaw prefer `chat-start` instead of direct `chat`?

Because `chat-start` lets OpenClaw observe in-progress work through `chat-status` and collect the final normalized answer through `chat-result`, instead of waiting on one long blocking command.

## Does OpenClaw need to implement SSE parsing by itself?

No. The worker inside `fine-dora` consumes Dora `/sse/chat` directly. OpenClaw only needs to use `chat-start`, `chat-status`, and `chat-result`.

## What happens if `/sse/chat` returns zero usable events?

That chat is treated as failed.

## Can OpenClaw invent missing Dora facts to make an answer look complete?

No. Any answer, summary, routing decision, fallback explanation, or follow-up that claims to use Dora data must be grounded in the real API response returned by `fine-dora`. Never fabricate, infer, or fill in missing business data as if Dora had returned it.
