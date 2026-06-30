const crypto = require("crypto");
const tls = require("tls");

const agents = {
  "auto-renewal": {
    zh: "我会先说明车险保单即将到期，再确认客户是否方便办理续保。如果客户愿意继续，我会引导预约门店或确认后续联系方式。",
    ja: "自動車保険の満期が近いことを丁寧にお伝えし、更新手続きのご意向を確認します。必要に応じて来店予約や次回連絡につなげます。",
  },
  "insurance-consulting": {
    zh: "我会先识别客户问题属于保单、条款、缴费还是服务流程，再基于知识库给出统一口径的答复。",
    ja: "質問が契約、約款、保険料、手続きのどれに該当するかを確認し、ナレッジに基づいて統一された回答を行います。",
  },
  "policy-service": {
    zh: "我会先确认客户要办理的保全事项，再引导完成身份核验、信息确认和下一步办理说明。",
    ja: "契約保全の内容を確認し、本人確認、情報確認、次の手続き案内へ進みます。",
  },
  "internal-support": {
    zh: "我会根据内部知识库确认制度口径，并给出申请路径、注意事项和相关负责人信息。",
    ja: "社内ナレッジに基づき、制度内容、申請経路、注意点、担当者情報をご案内します。",
  },
  "store-reservation": {
    zh: "我会先确认客户需要办理的业务，再说明是否需要线下办理，并引导选择门店、预约时间和准备材料。",
    ja: "手続き内容を確認し、来店が必要な場合は店舗、予約時間、持参書類を順番にご案内します。",
  },
};

const agentEnvKeys = {
  "auto-renewal": "AUTO_RENEWAL",
  "insurance-consulting": "INSURANCE_CONSULTING",
  "policy-service": "POLICY_SERVICE",
  "internal-support": "INTERNAL_SUPPORT",
  "store-reservation": "STORE_RESERVATION",
};

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
  });
}

function parseJsonEnv(name) {
  const raw = (process.env[name] || "").trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function envValue(...names) {
  for (const name of names) {
    const value = (process.env[name] || "").trim();
    if (value) return value;
  }
  return "";
}

function resolvePolicyServiceConfig() {
  const robotKey = envValue(
    "AGENT_CHAT_POLICY_SERVICE_ROBOT_KEY",
    "AGENTSTUDIO_POLICY_SERVICE_ROBOT_KEY",
  );
  const robotToken = envValue(
    "AGENT_CHAT_POLICY_SERVICE_ROBOT_TOKEN",
    "AGENTSTUDIO_POLICY_SERVICE_ROBOT_TOKEN",
  );
  const flowUuid = envValue(
    "AGENT_CHAT_POLICY_SERVICE_FLOW_UUID",
    "AGENTSTUDIO_POLICY_SERVICE_FLOW_UUID",
  );

  if (!robotKey || !robotToken) return null;

  return {
    robotKey,
    robotToken,
    flowUuid,
    websocketUrl:
      envValue("AGENT_CHAT_POLICY_SERVICE_WS_URL", "AGENTSTUDIO_WS_URL") ||
      "wss://agents.dyna.ai/openapi/v2/ws/dialog/",
    username: envValue("AGENT_CHAT_POLICY_SERVICE_USERNAME", "AGENTSTUDIO_POLICY_SERVICE_USERNAME"),
    timeoutMs: Number(envValue("AGENT_CHAT_POLICY_SERVICE_TIMEOUT_MS")) || 45000,
    debug: envValue("AGENT_CHAT_POLICY_SERVICE_DEBUG") === "1",
  };
}

function resolveAgentUrl(agentId) {
  const key = agentEnvKeys[agentId];
  const directUrl = key ? (process.env[`AGENT_CHAT_${key}_URL`] || "").trim() : "";
  if (directUrl) return directUrl;

  const urls = parseJsonEnv("AGENT_CHAT_AGENT_URLS");
  if (typeof urls[agentId] === "string" && urls[agentId].trim()) {
    return urls[agentId].trim();
  }

  const baseUrl = (process.env.AGENT_CHAT_API_BASE_URL || "").trim().replace(/\/$/, "");
  if (!baseUrl) return "";

  const ids = parseJsonEnv("AGENT_CHAT_AGENT_IDS");
  const upstreamId = typeof ids[agentId] === "string" && ids[agentId].trim() ? ids[agentId].trim() : agentId;
  return `${baseUrl}/${upstreamId}`;
}

function resolveAgentReply(payload) {
  if (!payload) return "";
  if (typeof payload === "string") return payload;
  if (typeof payload.reply === "string") return payload.reply;
  if (typeof payload.answer === "string") return payload.answer;
  if (typeof payload.text === "string") return payload.text;
  if (typeof payload.message === "string") return payload.message;
  if (typeof payload.content === "string") return payload.content;
  if (typeof payload.output_text === "string") return payload.output_text;
  if (payload.data) {
    return resolveAgentReply(payload.data);
  }
  if (Array.isArray(payload.choices) && payload.choices[0]) {
    return resolveAgentReply(payload.choices[0].message || payload.choices[0]);
  }
  if (Array.isArray(payload.output) && payload.output[0]) {
    const output = payload.output[0];
    if (Array.isArray(output.content) && output.content[0]) {
      return resolveAgentReply(output.content[0]);
    }
    return resolveAgentReply(output);
  }
  return "";
}

function shouldUseMock() {
  return (process.env.AGENT_CHAT_ALLOW_MOCK || "").trim().toLowerCase() === "true";
}

function websocketFrame(opcode, payload = Buffer.alloc(0)) {
  const data = Buffer.isBuffer(payload) ? payload : Buffer.from(String(payload));
  const mask = crypto.randomBytes(4);
  let header;

  if (data.length < 126) {
    header = Buffer.alloc(2);
    header[1] = 0x80 | data.length;
  } else if (data.length < 65536) {
    header = Buffer.alloc(4);
    header[1] = 0x80 | 126;
    header.writeUInt16BE(data.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[1] = 0x80 | 127;
    header.writeBigUInt64BE(BigInt(data.length), 2);
  }

  header[0] = 0x80 | opcode;
  const masked = Buffer.alloc(data.length);
  for (let index = 0; index < data.length; index += 1) {
    masked[index] = data[index] ^ mask[index % 4];
  }

  return Buffer.concat([header, mask, masked]);
}

function parseWebsocketFrames(buffer) {
  const frames = [];
  let offset = 0;

  while (buffer.length - offset >= 2) {
    const firstByte = buffer[offset];
    const secondByte = buffer[offset + 1];
    const opcode = firstByte & 0x0f;
    const fin = (firstByte & 0x80) === 0x80;
    const masked = (secondByte & 0x80) === 0x80;
    let payloadLength = secondByte & 0x7f;
    let headerLength = 2;

    if (payloadLength === 126) {
      if (buffer.length - offset < 4) break;
      payloadLength = buffer.readUInt16BE(offset + 2);
      headerLength = 4;
    } else if (payloadLength === 127) {
      if (buffer.length - offset < 10) break;
      payloadLength = Number(buffer.readBigUInt64BE(offset + 2));
      headerLength = 10;
    }

    const maskLength = masked ? 4 : 0;
    const frameLength = headerLength + maskLength + payloadLength;
    if (buffer.length - offset < frameLength) break;

    const mask = masked ? buffer.subarray(offset + headerLength, offset + headerLength + 4) : null;
    const payloadStart = offset + headerLength + maskLength;
    const payload = Buffer.from(buffer.subarray(payloadStart, payloadStart + payloadLength));

    if (mask) {
      for (let index = 0; index < payload.length; index += 1) {
        payload[index] ^= mask[index % 4];
      }
    }

    frames.push({ opcode, fin, payload });
    offset += frameLength;
  }

  return { frames, remaining: buffer.subarray(offset) };
}

const policyServiceSessions = new Map();
const POLICY_SERVICE_SESSION_IDLE_MS = 10 * 60 * 1000;

function createAgentStudioSession(config, sessionKey) {
  const target = new URL(config.websocketUrl);
  const host = target.hostname;
  const port = Number(target.port) || 443;
  const path = `${target.pathname || "/"}${target.search || ""}`;
  const key = crypto.randomBytes(16).toString("base64");
  let buffer = Buffer.alloc(0);
  let handshakeDone = false;
  let closed = false;
  let fragmentBuffer = "";
  let currentTurn = null;
  let heartbeatTimer = null;
  let sessionIdleTimer = null;
  let queue = Promise.resolve();
  let turnCount = 0;
  let resolveReady;
  let rejectReady;

  const socket = tls.connect({ host, port, servername: host });
  const ready = new Promise((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });

  function sendFrame(opcode, data) {
    socket.write(websocketFrame(opcode, data));
  }

  function removeSession() {
    const existing = policyServiceSessions.get(sessionKey);
    if (existing === session) {
      policyServiceSessions.delete(sessionKey);
    }
  }

  function clearTurnTimers(turn) {
    if (!turn) return;
    clearTimeout(turn.timeout);
    clearTimeout(turn.idleTimer);
  }

  function scheduleSessionExpiry() {
    clearTimeout(sessionIdleTimer);
    sessionIdleTimer = setTimeout(() => {
      closeSession(new Error("AgentStudio session expired after being idle"));
    }, POLICY_SERVICE_SESSION_IDLE_MS);
  }

  function finishTurn(turn) {
    if (!turn || currentTurn !== turn) return;
    clearTurnTimers(turn);
    currentTurn = null;
    scheduleSessionExpiry();
    turn.resolve(turn.messages);
  }

  function failTurn(turn, error) {
    if (!turn || currentTurn !== turn) return;
    clearTurnTimers(turn);
    currentTurn = null;
    turn.reject(error);
  }

  function scheduleTurnFinish(turn) {
    clearTimeout(turn.idleTimer);
    turn.idleTimer = setTimeout(() => finishTurn(turn), 900);
  }

  function closeSession(error) {
    if (closed) return;
    closed = true;
    clearInterval(heartbeatTimer);
    clearTimeout(sessionIdleTimer);

    const turn = currentTurn;
    currentTurn = null;
    if (turn) {
      clearTurnTimers(turn);
      if (turn.messages.length) {
        turn.resolve(turn.messages);
      } else {
        turn.reject(error || new Error("AgentStudio websocket closed"));
      }
    }

    if (!handshakeDone) {
      rejectReady(error || new Error("AgentStudio websocket closed before it was ready"));
    }

    socket.removeAllListeners();
    if (!socket.destroyed) socket.destroy();
    removeSession();
  }

  function failSession(error) {
    closeSession(error);
  }

  function handleText(text) {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return;
    }

    if (process.env.AGENT_CHAT_POLICY_SERVICE_TRACE === "1") {
      console.log("[policy-service] event:", JSON.stringify(parsed).slice(0, 1200));
    }

    const turn = currentTurn;
    if (!turn) return;

    turn.messages.push(parsed);
    const data = parsed && parsed.data && typeof parsed.data === "object" ? parsed.data : {};
    const code = data.code || parsed.code;

    if (parsed.type === "json" && parsed.finish === "y") {
      scheduleTurnFinish(turn);
    }

    if (parsed.type === "flow" && ["002004", "002005", "002001"].includes(code)) {
      scheduleTurnFinish(turn);
    }
  }

  function handleFrames() {
    const parsed = parseWebsocketFrames(buffer);
    buffer = parsed.remaining;

    parsed.frames.forEach((frame) => {
      if (frame.opcode === 0x1) {
        if (frame.fin) {
          handleText(frame.payload.toString("utf8"));
        } else {
          fragmentBuffer = frame.payload.toString("utf8");
        }
      } else if (frame.opcode === 0x0) {
        fragmentBuffer += frame.payload.toString("utf8");
        if (frame.fin) {
          handleText(fragmentBuffer);
          fragmentBuffer = "";
        }
      } else if (frame.opcode === 0x8) {
        closeSession(new Error("AgentStudio websocket closed"));
      } else if (frame.opcode === 0x9) {
        sendFrame(0x0a, frame.payload);
      }
    });
  }

  async function runTurn(payload) {
    await ready;
    if (closed) throw new Error("AgentStudio websocket is closed");

    clearTimeout(sessionIdleTimer);
    return new Promise((resolve, reject) => {
      const turn = {
        messages: [],
        resolve,
        reject,
        idleTimer: null,
        timeout: null,
      };

      currentTurn = turn;
      turn.timeout = setTimeout(() => {
        if (turn.messages.length) {
          finishTurn(turn);
          return;
        }

        failTurn(turn, new Error("AgentStudio websocket timed out before receiving messages"));
        closeSession(new Error("AgentStudio websocket timed out before receiving messages"));
      }, config.timeoutMs);

      sendFrame(0x1, JSON.stringify(payload));
    });
  }

  socket.once("secureConnect", () => {
    socket.write(
      [
        `GET ${path} HTTP/1.1`,
        `Host: ${host}`,
        "Upgrade: websocket",
        "Connection: Upgrade",
        `Sec-WebSocket-Key: ${key}`,
        "Sec-WebSocket-Version: 13",
        "User-Agent: dyna-ai-agent-demo",
        "",
        "",
      ].join("\r\n"),
    );
  });

  socket.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    if (!handshakeDone) {
      const headerEnd = buffer.indexOf("\r\n\r\n");
      if (headerEnd === -1) return;

      const header = buffer.subarray(0, headerEnd).toString("utf8");
      if (!header.startsWith("HTTP/1.1 101") && !header.startsWith("HTTP/1.0 101")) {
        failSession(new Error(`AgentStudio websocket handshake failed: ${header.split("\r\n")[0]}`));
        return;
      }

      handshakeDone = true;
      buffer = buffer.subarray(headerEnd + 4);
      resolveReady();
      heartbeatTimer = setInterval(() => {
        sendFrame(0x1, JSON.stringify({ type: "heartbeat", data: "ping" }));
      }, 1000);
    }

    handleFrames();
  });

  socket.once("error", failSession);
  socket.once("end", () => closeSession(new Error("AgentStudio websocket ended")));
  socket.once("close", () => closeSession(new Error("AgentStudio websocket closed")));

  const session = {
    get turnCount() {
      return turnCount;
    },
    get closed() {
      return closed;
    },
    send(payload) {
      queue = queue
        .catch(() => {})
        .then(async () => {
          const events = await runTurn(payload);
          turnCount += 1;
          return events;
        });
      return queue;
    },
    close() {
      closeSession();
    },
  };

  return session;
}

function getPolicyServiceSession(config, sessionKey) {
  const existing = policyServiceSessions.get(sessionKey);
  if (existing && !existing.closed) {
    if (process.env.AGENT_CHAT_POLICY_SERVICE_TRACE === "1") {
      console.log(`[policy-service] reuse session ${sessionKey} turnCount=${existing.turnCount}`);
    }
    return existing;
  }

  const session = createAgentStudioSession(config, sessionKey);
  policyServiceSessions.set(sessionKey, session);
  if (process.env.AGENT_CHAT_POLICY_SERVICE_TRACE === "1") {
    console.log(`[policy-service] create session ${sessionKey}`);
  }
  return session;
}

function sendWebsocketJson(websocketUrl, payload, timeoutMs) {
  return new Promise((resolve, reject) => {
    const target = new URL(websocketUrl);
    const host = target.hostname;
    const port = Number(target.port) || 443;
    const path = `${target.pathname || "/"}${target.search || ""}`;
    const key = crypto.randomBytes(16).toString("base64");
    const messages = [];
    let buffer = Buffer.alloc(0);
    let handshakeDone = false;
    let finished = false;
    let fragmentBuffer = "";
    let idleTimer = null;
    let heartbeatTimer = null;

    const socket = tls.connect({ host, port, servername: host });

    function cleanup() {
      clearTimeout(timeout);
      clearTimeout(idleTimer);
      clearInterval(heartbeatTimer);
      socket.removeAllListeners();
      if (!socket.destroyed) socket.destroy();
    }

    function finish() {
      if (finished) return;
      finished = true;
      cleanup();
      resolve(messages);
    }

    function fail(error) {
      if (finished) return;
      finished = true;
      cleanup();
      reject(error);
    }

    function scheduleIdleFinish() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(finish, 900);
    }

    function sendFrame(opcode, data) {
      socket.write(websocketFrame(opcode, data));
    }

    function handleText(text) {
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        return;
      }

      messages.push(parsed);
      if (process.env.AGENT_CHAT_POLICY_SERVICE_TRACE === "1") {
        console.log("[policy-service] event:", JSON.stringify(parsed).slice(0, 1200));
      }
      const data = parsed && parsed.data && typeof parsed.data === "object" ? parsed.data : {};
      const code = data.code || parsed.code;

      if (parsed.type === "json" && parsed.finish === "y") {
        scheduleIdleFinish();
      }

      if (parsed.type === "flow" && ["002004", "002005", "002001"].includes(code)) {
        scheduleIdleFinish();
      }
    }

    function handleFrames() {
      const parsed = parseWebsocketFrames(buffer);
      buffer = parsed.remaining;

      parsed.frames.forEach((frame) => {
        if (frame.opcode === 0x1) {
          if (frame.fin) {
            handleText(frame.payload.toString("utf8"));
          } else {
            fragmentBuffer = frame.payload.toString("utf8");
          }
        } else if (frame.opcode === 0x0) {
          fragmentBuffer += frame.payload.toString("utf8");
          if (frame.fin) {
            handleText(fragmentBuffer);
            fragmentBuffer = "";
          }
        } else if (frame.opcode === 0x8) {
          finish();
        } else if (frame.opcode === 0x9) {
          sendFrame(0x0a, frame.payload);
        }
      });
    }

    const timeout = setTimeout(() => {
      if (messages.length) {
        finish();
        return;
      }
      fail(new Error("AgentStudio websocket timed out before receiving messages"));
    }, timeoutMs);

    socket.once("secureConnect", () => {
      socket.write(
        [
          `GET ${path} HTTP/1.1`,
          `Host: ${host}`,
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Key: ${key}`,
          "Sec-WebSocket-Version: 13",
          "User-Agent: dyna-ai-agent-demo",
          "",
          "",
        ].join("\r\n"),
      );
    });

    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      if (!handshakeDone) {
        const headerEnd = buffer.indexOf("\r\n\r\n");
        if (headerEnd === -1) return;

        const header = buffer.subarray(0, headerEnd).toString("utf8");
        if (!header.startsWith("HTTP/1.1 101") && !header.startsWith("HTTP/1.0 101")) {
          fail(new Error(`AgentStudio websocket handshake failed: ${header.split("\r\n")[0]}`));
          return;
        }

        handshakeDone = true;
        buffer = buffer.subarray(headerEnd + 4);
        sendFrame(0x1, JSON.stringify(payload));
        heartbeatTimer = setInterval(() => {
          sendFrame(0x1, JSON.stringify({ type: "heartbeat", data: "ping" }));
        }, 1000);
      }

      handleFrames();
    });

    socket.once("error", fail);
    socket.once("end", finish);
    socket.once("close", finish);
  });
}

function isInternalFlowAnswer(answer) {
  return (
    !answer ||
    answer === "flow_enter" ||
    answer === "flow_exit" ||
    answer === "flow_jump" ||
    answer === "node_waiting_input" ||
    answer === "current_communication_complete" ||
    answer.startsWith("flow_jump::") ||
    answer.startsWith("node_id:")
  );
}

function normalizeReplyCandidate(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    return value.map(normalizeReplyCandidate).filter(Boolean).join("\n").trim();
  }
  if (typeof value === "object") {
    return resolveAgentReply(value).trim();
  }
  return "";
}

function extractFlowAnswer(data) {
  const output = data.output && typeof data.output === "object" ? data.output : {};
  const candidates = [
    data.answer,
    data.Answer,
    data.reply,
    data.message,
    data.content,
    output.robot_user_replying,
    output.robot_user_asking,
    output.robot_user_reply,
    output.robot_reply,
    output.answer,
    output.reply,
    output.text,
    output.content,
  ];

  for (const candidate of candidates) {
    const answer = normalizeReplyCandidate(candidate);
    if (!isInternalFlowAnswer(answer)) return answer;
  }

  return "";
}

function parseFlowJump(text) {
  const value = typeof text === "string" ? text : "";
  if (!value.includes("flow_jump")) return "";

  const match = value.match(/jump_flow_uuid:([^,\s]+)/);
  return match ? match[1].trim() : "";
}

function appendStreamAnswer(current, next) {
  if (!current) return next;
  if (next.startsWith(current)) return next;
  return `${current}${next}`;
}

function collapseRepeatedReply(reply) {
  const text = reply.trim();
  if (text.length < 2 || text.length % 2 !== 0) return text;

  const middle = text.length / 2;
  const first = text.slice(0, middle);
  const second = text.slice(middle);
  return first === second ? first : text;
}

function collectChatflowReply(events) {
  const replies = [];
  let stream = "";
  let taskId = "";
  let dialogId = "";
  let flowStage = "";
  let jumpFlowUuid = "";
  let waitingInput = false;

  events.forEach((event) => {
    if (event && event.data && event.index === -2 && event.data.task_id) {
      taskId = String(event.data.task_id);
    }
    if (event && event.data && event.index === -1 && event.data.dialog_id) {
      dialogId = String(event.data.dialog_id);
    }

    if (event.type === "string" && typeof event.data === "string") {
      jumpFlowUuid = parseFlowJump(event.data) || jumpFlowUuid;
      if (isInternalFlowAnswer(event.data.trim())) return;

      stream = appendStreamAnswer(stream, event.data);
      if (event.finish === "y" && stream.trim()) {
        replies.push(stream.trim());
        stream = "";
      }
      return;
    }

    if (event.type === "json") {
      const reply = resolveAgentReply(event.data);
      if (reply) replies.push(reply);
      return;
    }

    if (event.type !== "flow" || !event.data || typeof event.data !== "object") return;

    const data = event.data;
    const code = data.code;
    const answer = extractFlowAnswer(data);
    flowStage = data.flow_stage || flowStage;
    jumpFlowUuid = parseFlowJump(data.answer) || parseFlowJump(data.Answer) || jumpFlowUuid;

    if (answer && data.node_stream === 1) {
      stream = appendStreamAnswer(stream, answer);
      if (data.node_answer_finish === "y" && stream.trim()) {
        replies.push(stream.trim());
        stream = "";
      }
    } else if (answer) {
      replies.push(answer);
    }

    if (code === "002004") {
      waitingInput = true;
    }
  });

  if (stream.trim()) replies.push(stream.trim());

  const normalizedReplies = replies.map(collapseRepeatedReply).filter(Boolean);
  const uniqueReplies = normalizedReplies.filter((reply, index) => reply && reply !== normalizedReplies[index - 1]);
  return {
    reply: uniqueReplies.join("\n\n"),
    taskId,
    dialogId,
    flowStage,
    jumpFlowUuid,
    waitingInput,
  };
}

async function callPolicyServiceChatflow(payload) {
  const config = resolvePolicyServiceConfig();
  if (!config) return null;

  const conversationId =
    typeof payload.conversationId === "string" && payload.conversationId.trim()
      ? payload.conversationId.trim()
      : `policy-service-${Date.now()}`;
  const payloadUsername =
    typeof payload.username === "string" && payload.username.trim() ? payload.username.trim() : "";
  const username = config.username || payloadUsername || "web-demo-user";
  const question = typeof payload.message === "string" ? payload.message.trim() : "";
  const sessionKey = `${username}:${conversationId}`;
  const session = getPolicyServiceSession(config, sessionKey);
  const isFirstTurn = session.turnCount === 0;

  if (process.env.AGENT_CHAT_POLICY_SERVICE_TRACE === "1") {
    console.log(
      `[policy-service] request conversationId=${conversationId} username=${username} question=${JSON.stringify(question)} firstTurn=${isFirstTurn} turnCount=${session.turnCount}`,
    );
  }

  const requestBody = {
    question,
    username,
    user_code: username,
    "cybertron-robot-key": config.robotKey,
    "cybertron-robot-token": config.robotToken,
    cybertron_robot_key: config.robotKey,
    cybertron_robot_token: config.robotToken,
    segment_code: conversationId,
    open_flow_debug: config.debug ? 1 : 0,
  };

  if (config.flowUuid && isFirstTurn) {
    requestBody.open_flow_trigger = "direct";
    requestBody.open_flow_uuid = config.flowUuid;
    requestBody.open_flow_node_uuid = "";
    requestBody.open_flow_node_inputs = {};
  }

  const events = await session.send(requestBody);
  let result = {
    conversationId,
    username,
    ...collectChatflowReply(events),
  };

  if (!result.reply && result.jumpFlowUuid) {
    const jumpRequestBody = {
      ...requestBody,
      question,
      open_flow_trigger: "direct",
      open_flow_uuid: result.jumpFlowUuid,
      open_flow_node_uuid: "",
      open_flow_node_inputs: {},
    };
    const jumpEvents = await session.send(jumpRequestBody);
    result = {
      conversationId,
      username,
      ...collectChatflowReply(jumpEvents),
    };
  }

  return result;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method Not Allowed" });
    return;
  }

  let payload = {};
  try {
    const body = await readBody(req);
    payload = body ? JSON.parse(body) : {};
  } catch {
    sendJson(res, 400, { error: "Invalid JSON" });
    return;
  }

  const agentId = typeof payload.agentId === "string" ? payload.agentId : "";
  const language = payload.language === "ja" ? "ja" : "zh";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const agent = agents[agentId];

  if (!agent) {
    sendJson(res, 404, { error: "Unknown agentId" });
    return;
  }

  const agentUrl = resolveAgentUrl(agentId);
  const apiKey = (process.env.AGENT_CHAT_API_KEY || "").trim();

  if (agentId === "policy-service" && !agentUrl) {
    try {
      const chatflow = await callPolicyServiceChatflow({ ...payload, message });

      if (chatflow) {
        sendJson(res, 200, {
          mode: "api",
          provider: "agentstudio-chatflow",
          agentId,
          language,
          conversationId: chatflow.conversationId,
          username: chatflow.username,
          dialogId: chatflow.dialogId,
          taskId: chatflow.taskId,
          waitingInput: chatflow.waitingInput,
          flowStage: chatflow.flowStage,
          reply: chatflow.reply,
        });
        return;
      }
    } catch (error) {
      console.error("[policy-service] AgentStudio Chatflow request failed:", error.message);
      sendJson(res, 502, {
        mode: "error",
        agentId,
        language,
        error: "AgentStudio Chatflow request failed",
      });
      return;
    }
  }

  if (agentUrl) {
    try {
      const upstream = await fetch(agentUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          agentId,
          language,
          message,
          messages: Array.isArray(payload.messages) ? payload.messages : undefined,
          conversationId: typeof payload.conversationId === "string" ? payload.conversationId : undefined,
        }),
      });

      if (upstream.ok) {
        const upstreamText = await upstream.text();
        const upstreamPayload = upstreamText ? JSON.parse(upstreamText) : {};
        const reply = resolveAgentReply(upstreamPayload);
        sendJson(res, upstream.status, {
          mode: "api",
          agentId,
          language,
          reply: reply || agent[language],
          raw: reply ? undefined : upstreamPayload,
        });
        return;
      }

      sendJson(res, upstream.status, {
        mode: "error",
        agentId,
        language,
        error: "Agent API request failed",
      });
      return;
    } catch (error) {
      sendJson(res, 502, {
        mode: "error",
        agentId,
        language,
        error: "Agent API proxy failed",
      });
      return;
    }
  }

  if (!shouldUseMock()) {
    sendJson(res, 503, {
      mode: "unconfigured",
      agentId,
      language,
      error: "Agent API is not configured",
    });
    return;
  }

  sendJson(res, 200, {
    mode: "mock",
    agentId,
    language,
    input: message,
    reply: agent[language],
  });
};
