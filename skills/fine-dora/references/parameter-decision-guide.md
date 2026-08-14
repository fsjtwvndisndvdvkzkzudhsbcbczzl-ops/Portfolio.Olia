# Parameter Decision Guide

This file explains which parameters OpenClaw must decide by itself, where those values come from, and how to choose them.

## Agent Routing Parameters

- `publishedAgentId`
  - Source: `list-agents`
  - Decision rule: choose it in OpenClaw by matching the user’s task against the returned agent `name`, `description`, `skillNames`, `readableSkills`, and each bound skill’s `datasourceMetadata` / `knowledgeBaseMetadata`. Only route chat to agents where `published=true`. Use raw IDs only after the routing decision is clear.

- `agentId`
  - Source: `list-agents`
  - Decision rule: use the summary list `id` as the follow-up key for `get-editable-agent`, `save-from-agent`, and `publish-agent`. Draft agents may be valid edit/publish targets even when they are not valid chat targets.

- `refresh`
  - Source: user request in the active conversation
  - Decision rule: set it only when the user explicitly asks to refresh, rediscover, resync, or when stale cached discovery is likely to cause wrong routing.

## Conversation Parameters

- `externalSessionKey`
  - Source: OpenClaw conversation state
  - Decision rule: reuse the same key for continuous follow-up so Dora session mapping stays stable; generate a new one only for a new conversation thread.

- `queryId`
  - Source: OpenClaw execution state
  - Decision rule: reuse when continuing the same pending interaction; otherwise allow the script to generate one.

- `traceId`
  - Source: OpenClaw tracing context
  - Decision rule: pass one when you need cross-system troubleshooting or auditing.

- `channelType`
  - Source: caller context or `DORA_CHANNEL_TYPE`
  - Decision rule: keep it aligned with the actual IM/runtime channel.

- `locale`
  - Source: the channel or client's end-user language setting
  - Decision rule: pass the configured BCP 47 tag only when the source is reliable and the tag contains a specific language subtag other than `und`. Never infer or guess it from message text. If unavailable, omit it so Dora falls back to the API-key user's language preference, HTTP `Accept-Language`, and finally simplified Chinese.

## Agent Create / Update Parameters

- `skillConfigs`
  - Source: `list-skills`, `get-editable-agent`
  - Decision rule: prefer full Dora-readable skill configs, especially when the skill needs datasource or knowledge bindings.
  - Write rule: `create-agent` and `save-agent` should both send `skillConfigs` as the primary write contract.
  - Important: `list-skills` provides available skill capabilities/templates. For already-bound skill context, trust `get-editable-agent` or `/agents` instead.

- `datasourceIds`
  - Source: selected skills plus Dora editable config
  - Decision rule: keep them synchronized with the chosen `skillConfigs`, especially for data-query skills that depend on data binding completeness.

- `knowledgeSpaceIds`
  - Source: Dora editable Agent config
  - Decision rule: manage knowledge bindings only at Agent level; never add this field to `skillConfigs`.

- `llmConfigId`
  - Source: `list-llm-configs`
  - Decision rule: let OpenClaw choose it when it has enough context, but prefer the readable LLM name during display or reasoning. If omitted for a `WRAPPED` agent, Dora will choose the first available LLM.

- `agentType`
  - Source: user intent or edit context
  - Decision rule: keep it aligned with Dora enum values such as `WRAPPED` or `INTEGRATION`; lowercase free-form values should not be used.

- `publishToWorkspace` / `publishToStandaloneUrl`
  - Source: user intent
  - Decision rule: only enable the publish target the user explicitly wants.

- `userConfirmed`
  - Source: explicit user confirmation in OpenClaw
  - Decision rule: `create-agent`, `save-agent`, and `save-from-agent` must not run until the user has clearly agreed to modify Dora-side agent state.

## Follow-up Evaluation

- If the Dora result is successful and context-consistent, continue using Dora.
- If the Dora result fails or is clearly inconsistent with the active conversation context, fallback to OpenClaw-native answering and append the footnote pattern from `../assets/fallback-footnote-example.md`.
