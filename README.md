# Dyna.Ai Insurance Agent Solution

Static bilingual landing page for Dyna.Ai insurance industry Agent demos.

## Pages

- `/` Landing Page
- `/agents/auto-renewal/`
- `/agents/insurance-consulting/`
- `/agents/policy-service/`
- `/agents/internal-support/`
- `/agents/store-reservation/`

## API

Agent pages call:

```http
POST /api/agent-chat
```

Request body:

```json
{
  "agentId": "auto-renewal",
  "message": "User message",
  "language": "zh"
}
```

By default, `/api/agent-chat` requires a real Agent API configuration. Set `AGENT_CHAT_ALLOW_MOCK=true` only when you intentionally want local mock replies.

Optional environment variables:

- `AGENT_CHAT_API_BASE_URL`
- `AGENT_CHAT_API_KEY`
- `AGENT_CHAT_AGENT_IDS`
- `AGENT_CHAT_AGENT_URLS`
- `AGENT_CHAT_ALLOW_MOCK`

Policy service AgentStudio Chatflow variables:

- `AGENT_CHAT_POLICY_SERVICE_ROBOT_KEY`
- `AGENT_CHAT_POLICY_SERVICE_ROBOT_TOKEN`
- `AGENT_CHAT_POLICY_SERVICE_USERNAME`
- `AGENT_CHAT_POLICY_SERVICE_FLOW_UUID` optional; omit it when the published Agent should start its default flow automatically
- `AGENT_CHAT_POLICY_SERVICE_WS_URL` defaults to `wss://agents.dyna.ai/openapi/v2/ws/dialog/`

Per-Agent direct URL variables:

- `AGENT_CHAT_AUTO_RENEWAL_URL`
- `AGENT_CHAT_INSURANCE_CONSULTING_URL`
- `AGENT_CHAT_POLICY_SERVICE_URL`
- `AGENT_CHAT_INTERNAL_SUPPORT_URL`
- `AGENT_CHAT_STORE_RESERVATION_URL`

`AGENT_CHAT_AGENT_URLS` example:

```json
{
  "auto-renewal": "https://example.com/agents/auto-renewal/chat",
  "insurance-consulting": "https://example.com/agents/insurance-consulting/chat",
  "policy-service": "https://example.com/agents/policy-service/chat",
  "internal-support": "https://example.com/agents/internal-support/chat",
  "store-reservation": "https://example.com/agents/store-reservation/chat"
}
```

The upstream response can return any of these common fields:

- `reply`
- `answer`
- `text`
- `message`
- `content`
- `output_text`

## API Documentation Rule

Every API integration must have its own README file under `docs/api/<clear-api-name>/README.md`.

Each API README should document:

- What page or feature uses the API
- The local route
- The upstream provider and endpoint
- Required and optional environment variables
- Whether mock mode is allowed
- Multi-turn or session rules
- Local preview command
- Verification checklist

Current API documents:

- `docs/api/policy-service-agentstudio-chatflow/README.md`

## Local Preview

Use the local preview server from the project root. It serves the static pages and the `/api/agent-chat` route together.

```bash
node local-preview-server.js
```

Then open `http://127.0.0.1:4173`.

## Deploy

Deploy the repository to Vercel as a static site with serverless API routes.
