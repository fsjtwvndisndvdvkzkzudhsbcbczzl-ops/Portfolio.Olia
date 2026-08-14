# Interface Examples

Every example in this file follows the actual `fine_dora.py` output wrapper:

```json
{
  "success": true,
  "action": "<command>",
  "mode": "full",
  "data": {},
  "error": null,
  "meta": {}
}
```

For commands that already have a dedicated asset file under `assets/`, the response example below uses the same wording and field structure.

## `list-agents`

Request example:

```bash
python3 {baseDir}/scripts/fine_dora.py list-agents --output-mode full --refresh
```

Response example:

```json
{
  "success": true,
  "action": "list-agents",
  "mode": "full",
  "data": [
    {
      "id": "agent-1",
      "name": "Sales Analysis Agent",
      "type": "WRAPPED",
      "description": "Analyze sales trends and attribution.",
      "published": true,
      "agentStatus": "PUBLISHED",
      "lastPublishTime": 1775460244,
      "publishToWorkspace": true,
      "publishToStandaloneUrl": false,
      "skills": [
        {
          "id": "skill-template-data-query",
          "name": "Data Query Skill",
          "description": "Analyze revenue and attribution data.",
          "skillType": "GENERAL",
          "skillScenario": "DATA_QUERY"
        }
      ]
    }
  ],
  "error": null,
  "meta": {
    "action": "list-agents"
  }
}
```

## `list-skills`

Request example:

```bash
python3 {baseDir}/scripts/fine_dora.py list-skills --output-mode full --refresh
```

Response example:

```json
{
  "success": true,
  "action": "list-skills",
  "mode": "full",
  "data": [
    {
      "id": "skill-template-data-query",
      "name": "Data Query Skill",
      "description": "Analyze revenue and attribution data.",
      "skillType": "GENERAL",
      "skillScenario": "DATA_QUERY",
      "skillCategory": "DATA_QUERY_ANALYSIS",
      "skillStatus": "COMPLETED",
      "datasourceIds": null,
      "editable": false,
      "deletable": false
    }
  ],
  "error": null,
  "meta": {
    "action": "list-skills"
  }
}
```

## `list-llm-configs`

Request example:

```bash
python3 {baseDir}/scripts/fine_dora.py list-llm-configs --output-mode full --refresh
```

Response example:

```json
{
  "success": true,
  "action": "list-llm-configs",
  "mode": "full",
  "data": [
    {
      "id": "llm-config-1",
      "protocol": "OPENAI",
      "name": "GPT Friendly",
      "apiKey": "******",
      "endPoint": "https://llm.example.com/v1",
      "apiVersion": null
    }
  ],
  "error": null,
  "meta": {
    "action": "list-llm-configs"
  }
}
```

## `get-agent`

Request example:

```bash
python3 {baseDir}/scripts/fine_dora.py get-agent --published-agent-id "agent-1"
```

Response example:

```json
{
  "success": true,
  "action": "get-agent",
  "mode": "full",
  "data": {
    "id": "agent-1",
    "name": "Sales Analysis Agent",
    "type": "WRAPPED",
    "description": "Analyze sales trends and attribution.",
    "imageSrc": null,
    "welcomeWords": "Hello, I can help analyze sales data.",
    "published": true,
    "agentStatus": "PUBLISHED",
    "publishToWorkspace": true,
    "publishToStandaloneUrl": false,
    "lastPublishTime": 1775460244,
    "recommendQuestions": [],
    "skills": [
      {
        "id": "skill-template-data-query",
        "name": "Data Query Skill",
        "description": "Analyze revenue and attribution data.",
        "skillType": "GENERAL",
        "skillScenario": "DATA_QUERY"
      }
    ],
    "skillNames": ["Data Query Skill"],
    "readableSkills": [
      {
        "id": "skill-template-data-query",
        "name": "Data Query Skill",
        "description": "Analyze revenue and attribution data.",
        "skillType": "GENERAL",
        "status": "COMPLETED"
      }
    ]
  },
  "error": null,
  "meta": {
    "action": "get-agent",
    "published_agent_id": "agent-1"
  }
}
```

## `get-editable-agent`

Request example:

```bash
python3 {baseDir}/scripts/fine_dora.py get-editable-agent --agent-id "agent-1" --channel-type "feishu"
```

Response example:

```json
{
  "success": true,
  "action": "get-editable-agent",
  "mode": "full",
  "data": {
    "id": "agent-1",
    "name": "Sales Analysis Agent",
    "description": "Analyze sales trends and attribution.",
    "welcomeMessage": "Hello, I can help analyze sales data.",
    "skillConfigs": [
      {
        "id": "skill-template-data-query",
        "name": "Data Query Skill",
        "description": "Analyze revenue and attribution data.",
        "skillType": "GENERAL",
        "skillScenario": "DATA_QUERY"
      }
    ],
    "datasourceIds": ["datasource-1"],
    "knowledgeSpaceIds": ["knowledge-space-1"],
    "llmConfigId": "llm-config-1",
    "publishToWorkspace": true,
    "publishToStandaloneUrl": false,
    "llmConfigName": "GPT Friendly",
    "skillNames": ["Data Query Skill"],
    "readableSkills": [
      {
        "id": "skill-template-data-query",
        "name": "Data Query Skill",
        "description": "Analyze revenue and attribution data.",
        "skillType": "GENERAL",
        "status": "COMPLETED"
      }
    ]
  },
  "error": null,
  "meta": {
    "action": "get-editable-agent",
    "agent_id": "agent-1",
    "channel_type": "feishu"
  }
}
```

## `validate-config`

Request example:

```bash
python3 {baseDir}/scripts/fine_dora.py validate-config --config-file "assets/save-agent.template.json" --validation-mode save
```

Response example:

```json
{
  "success": true,
  "action": "validate-config",
  "mode": "full",
  "data": {
    "validationMode": "save",
    "valid": true,
    "removedKeys": [],
    "readonlyKeys": [],
    "sanitizedPayload": {
      "id": "agent-id",
      "name": "Sales Analysis Agent",
      "description": "Analyze sales trends and attribution.",
      "welcomeMessage": "Hello, I can help analyze sales data.",
      "systemPrompt": "You are a Dora sales analysis agent.",
      "skillConfigs": [
        {
          "id": "skill-template-data-query",
          "name": "Data Query Skill"
        }
      ],
      "datasourceIds": ["datasource-1"],
      "knowledgeSpaceIds": ["knowledge-space-1"],
      "llmConfigId": "llm-config-1",
      "publishToWorkspace": true,
      "publishToStandaloneUrl": false
    }
  },
  "error": null,
  "meta": {
    "action": "validate-config",
    "config_file": "assets/save-agent.template.json"
  }
}
```

## `create-agent`

Request example:

```bash
python3 {baseDir}/scripts/fine_dora.py create-agent --config-file "assets/create-agent.template.json" --channel-type "feishu" --user-confirmed --refresh
```

Response example:

```json
{
  "success": true,
  "action": "create-agent",
  "mode": "full",
  "data": {
    "id": "agent-1",
    "name": "Sales Analysis Agent",
    "description": "Analyze sales trends and attribution.",
    "welcomeMessage": "Hello, I can help analyze sales data.",
    "skillConfigs": [
      {
        "id": "skill-template-data-query",
        "name": "Data Query Skill"
      }
    ],
    "datasourceIds": ["datasource-1"],
    "knowledgeSpaceIds": ["knowledge-space-1"],
    "llmConfigId": "llm-config-1",
    "agentStatus": "DRAFT"
  },
  "error": null,
  "meta": {
    "action": "create-agent",
    "channel_type": "feishu",
    "config_file": "assets/create-agent.template.json"
  }
}
```

## `save-agent`

Request example:

```bash
python3 {baseDir}/scripts/fine_dora.py save-agent --config-file "assets/save-agent.template.json" --channel-type "feishu" --user-confirmed
```

Response example:

```json
{
  "success": true,
  "action": "save-agent",
  "mode": "full",
  "data": {
    "id": "agent-1",
    "name": "Sales Analysis Agent",
    "description": "Analyze sales trends and attribution.",
    "skillConfigs": [
      {
        "id": "skill-template-data-query",
        "name": "Data Query Skill"
      }
    ],
    "datasourceIds": ["datasource-1"],
    "knowledgeSpaceIds": ["knowledge-space-1"],
    "llmConfigId": "llm-config-1"
  },
  "error": null,
  "meta": {
    "action": "save-agent",
    "channel_type": "feishu",
    "config_file": "assets/save-agent.template.json"
  }
}
```

## `save-from-agent`

Request example:

```bash
python3 {baseDir}/scripts/fine_dora.py save-from-agent --agent-id "agent-1" --description "Analyze refreshed sales attribution." --channel-type "feishu" --user-confirmed
```

Response example:

```json
{
  "success": true,
  "action": "save-from-agent",
  "mode": "full",
  "data": {
    "id": "agent-1",
    "name": "Sales Analysis Agent",
    "description": "Analyze refreshed sales attribution.",
    "skillConfigs": [
      {
        "id": "skill-template-data-query",
        "name": "Data Query Skill"
      }
    ],
    "datasourceIds": ["datasource-1"],
    "knowledgeSpaceIds": ["knowledge-space-1"],
    "llmConfigId": "llm-config-1",
    "_removedKeys": [
      "agentStatus",
      "createdAt",
      "createdBy",
      "llmConfigName",
      "published",
      "publishedAt",
      "readableSkills",
      "skillNames",
      "updatedAt"
    ]
  },
  "error": null,
  "meta": {
    "action": "save-from-agent",
    "agent_id": "agent-1",
    "channel_type": "feishu"
  }
}
```

## `publish-agent`

Request example:

```bash
python3 {baseDir}/scripts/fine_dora.py publish-agent --agent-id "agent-1" --channel-type "feishu" --publish-to-workspace
```

Response example:

```json
{
  "success": true,
  "action": "publish-agent",
  "mode": "full",
  "data": {
    "id": "agent-1",
    "name": "Sales Analysis Agent",
    "type": "WRAPPED",
    "description": "Analyze sales trends and attribution.",
    "imageSrc": null,
    "welcomeWords": "Hello, I can help analyze sales data.",
    "lastPublishTime": 1775460244,
    "published": true,
    "publishToWorkspace": true,
    "publishToStandaloneUrl": false
  },
  "error": null,
  "meta": {
    "action": "publish-agent",
    "agent_id": "agent-1",
    "channel_type": "feishu"
  }
}
```

## `chat`

Request example:

```bash
python3 {baseDir}/scripts/fine_dora.py chat --published-agent-id "agent-1" --question "Summarize the latest sales trend." --channel-type "feishu" --locale "en-US"
```

`--locale` is optional. Supply it from the channel or client's user-language setting; omit it when that setting is unavailable. Do not infer it from the question text.

Response example:

```json
{
  "success": true,
  "action": "chat",
  "mode": "full",
  "data": {
    "externalSessionKey": "fine-dora-session-1",
    "queryId": "query-1",
    "status": "SUCCESS",
    "content": "Sales revenue grew 18% year over year, mainly driven by the East region.",
    "messages": [
      {
        "type": "STEP",
        "status": "PROCESSING",
        "content": "Collecting the latest sales metrics from Dora."
      },
      {
        "type": "RESULT",
        "status": "SUCCESS",
        "content": "Sales revenue grew 18% year over year, mainly driven by the East region."
      }
    ],
    "displayText": "Sales revenue grew 18% year over year, mainly driven by the East region.",
    "messageSummaries": [
      {
        "type": "STEP",
        "status": "PROCESSING",
        "content": "Collecting the latest sales metrics from Dora."
      },
      {
        "type": "RESULT",
        "status": "SUCCESS",
        "content": "Sales revenue grew 18% year over year, mainly driven by the East region."
      }
    ]
  },
  "error": null,
  "meta": {
    "action": "chat",
    "published_agent_id": "agent-1",
    "channel_type": "feishu",
    "externalSessionKey": "fine-dora-session-1",
    "queryId": "query-1",
    "status": "SUCCESS"
  }
}
```

## `chat-start`

Request example:

```bash
python3 {baseDir}/scripts/fine_dora.py chat-start --published-agent-id "agent-1" --question "Summarize the latest sales trend." --channel-type "feishu" --locale "en-US"
```

Response example:

```json
{
  "success": true,
  "action": "chat-start",
  "mode": "full",
  "data": {
    "jobId": "a6aa2f22-b408-49ff-bd58-5306a7fdbdc4",
    "status": "RUNNING",
    "publishedAgentId": "agent-1",
    "externalSessionKey": "fine-dora-session-1",
    "queryId": "query-1",
    "channelType": "feishu",
    "traceId": "trace-1"
  },
  "error": null,
  "meta": {
    "action": "chat-start",
    "published_agent_id": "agent-1",
    "channel_type": "feishu"
  }
}
```

## `chat-status`

Request example:

```bash
python3 {baseDir}/scripts/fine_dora.py chat-status --job-id "a6aa2f22-b408-49ff-bd58-5306a7fdbdc4"
```

Response example:

```json
{
  "success": true,
  "action": "chat-status",
  "mode": "full",
  "data": {
    "jobId": "a6aa2f22-b408-49ff-bd58-5306a7fdbdc4",
    "status": "RUNNING",
    "publishedAgentId": "agent-1",
    "externalSessionKey": "fine-dora-session-1",
    "queryId": "query-1",
    "channelType": "feishu",
    "traceId": "trace-1",
    "createdAt": 1775460240.12,
    "updatedAt": 1775460241.44,
    "completedAt": null,
    "error": null,
    "resultReady": false
  },
  "error": null,
  "meta": {
    "action": "chat-status"
  }
}
```

## `chat-result`

Request example:

```bash
python3 {baseDir}/scripts/fine_dora.py chat-result --job-id "a6aa2f22-b408-49ff-bd58-5306a7fdbdc4"
```

Response example:

```json
{
  "success": true,
  "action": "chat-result",
  "mode": "full",
  "data": {
    "jobId": "a6aa2f22-b408-49ff-bd58-5306a7fdbdc4",
    "status": "SUCCEEDED",
    "publishedAgentId": "agent-1",
    "externalSessionKey": "fine-dora-session-1",
    "queryId": "query-1",
    "completedAt": 1775460244.98,
    "error": null,
    "result": {
      "externalSessionKey": "fine-dora-session-1",
      "queryId": "query-1",
      "status": "SUCCESS",
      "content": "Sales revenue grew 18% year over year, mainly driven by the East region.",
      "messages": [
        {
          "type": "STEP",
          "status": "PROCESSING",
          "content": "Collecting the latest sales metrics from Dora."
        },
        {
          "type": "RESULT",
          "status": "SUCCESS",
          "content": "Sales revenue grew 18% year over year, mainly driven by the East region."
        }
      ],
      "displayText": "Sales revenue grew 18% year over year, mainly driven by the East region.",
      "messageSummaries": [
        {
          "type": "STEP",
          "status": "PROCESSING",
          "content": "Collecting the latest sales metrics from Dora."
        },
        {
          "type": "RESULT",
          "status": "SUCCESS",
          "content": "Sales revenue grew 18% year over year, mainly driven by the East region."
        }
      ]
    },
    "ready": true
  },
  "error": null,
  "meta": {
    "action": "chat-result"
  }
}
```

## `list-sessions`

Request example:

```bash
python3 {baseDir}/scripts/fine_dora.py list-sessions --channel-type "feishu"
```

Response example:

```json
{
  "success": true,
  "action": "list-sessions",
  "mode": "full",
  "data": [
    {
      "id": "fine-dora-session-1",
      "name": "Sales Analysis Session"
    }
  ],
  "error": null,
  "meta": {
    "action": "list-sessions",
    "channel_type": "feishu"
  }
}
```

## `history`

Request example:

```bash
python3 {baseDir}/scripts/fine_dora.py history --published-agent-id "agent-1" --external-session-key "fine-dora-session-1" --channel-type "feishu"
```

Response example:

```json
{
  "success": true,
  "action": "history",
  "mode": "full",
  "data": {
    "thread_id": "session-1",
    "turns": [
      {
        "queryId": "query-1",
        "query": "Summarize the latest sales trend.",
        "status": "SUCCESS",
        "answer": "Sales revenue grew 18% year over year, mainly driven by the East region.",
        "messageSummaries": [
          {
            "type": "RESULT",
            "status": "SUCCESS",
            "content": "Sales revenue grew 18% year over year, mainly driven by the East region."
          }
        ]
      }
    ]
  },
  "error": null,
  "meta": {
    "action": "history",
    "published_agent_id": "agent-1",
    "external_session_key": "fine-dora-session-1",
    "channel_type": "feishu"
  }
}
```
