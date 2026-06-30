# Policy Service AgentStudio Chatflow API

This document records how the policy-service demo page connects to the real AgentStudio agent.

## Scope

- Frontend page: `/agents/policy-service/`
- Local API route: `POST /api/agent-chat`
- Agent id in this website: `policy-service`
- Upstream provider: AgentStudio Chatflow WebSocket
- Default WebSocket URL: `wss://agents.dyna.ai/openapi/v2/ws/dialog/`

## Required Environment Variables

Do not commit real tokens or keys to this repository.

- `AGENT_CHAT_POLICY_SERVICE_ROBOT_KEY`
- `AGENT_CHAT_POLICY_SERVICE_ROBOT_TOKEN`
- `AGENT_CHAT_POLICY_SERVICE_USERNAME`

## Optional Environment Variables

- `AGENT_CHAT_POLICY_SERVICE_WS_URL`
- `AGENT_CHAT_POLICY_SERVICE_TIMEOUT_MS`
- `AGENT_CHAT_POLICY_SERVICE_DEBUG`
- `AGENT_CHAT_POLICY_SERVICE_TRACE`
- `AGENT_CHAT_POLICY_SERVICE_FLOW_UUID`

## Important Behavior

`AGENT_CHAT_POLICY_SERVICE_FLOW_UUID` is intentionally optional.

Use no `AGENT_CHAT_POLICY_SERVICE_FLOW_UUID` when the website should behave like clicking `Use` in AgentStudio and let the published agent start its default flow.

Set `AGENT_CHAT_POLICY_SERVICE_FLOW_UUID` only when the website must force the conversation into one specific Chatflow by sending:

```json
{
  "open_flow_trigger": "direct",
  "open_flow_uuid": "FLOW_UUID",
  "open_flow_node_uuid": "",
  "open_flow_node_inputs": {}
}
```

## Request From The Website

The agent page sends requests to the local route:

```http
POST /api/agent-chat
Content-Type: application/json
```

Example body:

```json
{
  "agentId": "policy-service",
  "language": "ja",
  "message": "住所変更をしたいです",
  "username": "web-demo-user",
  "conversationId": "policy-service-session-id"
}
```

## Upstream AgentStudio Payload

The backend sends the following fields to AgentStudio:

```json
{
  "question": "User message",
  "username": "Configured username",
  "user_code": "Configured username",
  "cybertron-robot-key": "Robot key from env",
  "cybertron-robot-token": "Robot token from env",
  "cybertron_robot_key": "Robot key from env",
  "cybertron_robot_token": "Robot token from env",
  "segment_code": "conversationId",
  "open_flow_debug": 0
}
```

## Multi-Turn Conversation Rule

AgentStudio Chatflow expects follow-up user input to continue on the same WebSocket connection after `node_waiting_input`.

The backend therefore keeps a WebSocket session by:

- `username`
- `conversationId`

Do not open a new AgentStudio WebSocket for every user message in the same website conversation.

## Mock Policy

For demos with real AgentStudio integration, set:

```bash
AGENT_CHAT_ALLOW_MOCK=false
```

Mock mode should only be used for local layout testing when the real upstream API is unavailable.

## Local Preview Example

Run the preview server with the AgentStudio default-entry behavior:

```bash
AGENT_CHAT_POLICY_SERVICE_ROBOT_KEY="your-robot-key" \
AGENT_CHAT_POLICY_SERVICE_ROBOT_TOKEN="your-robot-token" \
AGENT_CHAT_POLICY_SERVICE_USERNAME="demo-user@example.com" \
AGENT_CHAT_ALLOW_MOCK=false \
PORT=4175 \
node local-preview-server.js
```

Open:

```text
http://127.0.0.1:4175/agents/policy-service/?lang=ja
```

## Verification Checklist

- The first agent response should come from AgentStudio, not the local mock reply.
- The response body from `/api/agent-chat` should include `"mode": "api"`.
- The response body should include `"provider": "agentstudio-chatflow"`.
- A second user message in the same page should continue the same AgentStudio conversation.
- Do not configure `AGENT_CHAT_POLICY_SERVICE_FLOW_UUID` unless the desired behavior is direct flow entry.

