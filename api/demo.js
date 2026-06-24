const scenes = [
  {
    id: "policy-service-call",
    label: { zh: "保全外呼", ja: "契約保全の架電" },
    agentName: { zh: "保全外呼 Agent", ja: "契約保全 Agent" },
    apiPrompt: {
      zh: "请模拟一次保险保全外呼，重点确认客户是否有地址、联系电话或受益人信息变更。",
      ja: "保険の契約保全架電を想定し、住所・電話番号・受取人情報の変更有無を丁寧に確認してください。",
    },
    exampleResponse: {
      zh: "您好，这里是 Dyna.AI 保险服务助手。为了确保您的保单信息保持最新，我们想简单确认一下您的联系方式和受益人信息是否需要更新。",
      ja: "Dyna.AI 保険サービスアシスタントです。ご契約情報を最新に保つため、連絡先と受取人情報に変更がないか簡単に確認します。",
    },
  },
  {
    id: "policy-faq",
    label: { zh: "保单 FAQ", ja: "契約 FAQ" },
    agentName: { zh: "FAQ Agent", ja: "FAQ Agent" },
    apiPrompt: {
      zh: "请作为保险 FAQ 助手，回答客户关于保单缴费方式和条款查询的常见问题。",
      ja: "保険 FAQ アシスタントとして、保険料の支払い方法と約款確認に関する一般的な質問へ答えてください。",
    },
    exampleResponse: {
      zh: "关于缴费方式，您可以通过指定账户、柜台或线上渠道办理。若您愿意，我可以进一步确认您目前对应的保单流程。",
      ja: "保険料のお支払い方法は、口座振替、窓口、オンラインのいずれかでご案内できます。必要であれば現在のご契約に合わせて詳しく確認します。",
    },
  },
  {
    id: "renewal-reminder",
    label: { zh: "续保提醒", ja: "更新リマインド" },
    agentName: { zh: "通知 Agent", ja: "通知 Agent" },
    apiPrompt: {
      zh: "请模拟一次保险续保提醒，语气专业但亲和，并在末尾引导客户确认下一步。",
      ja: "保険の更新リマインドを実演してください。丁寧で親しみのある口調で、最後に次のステップ確認へつなげてください。",
    },
    exampleResponse: {
      zh: "您好，这里是 Dyna.AI 保险提醒助手。您的保单将于近期进入更新窗口，是否方便确认一下后续办理方式？",
      ja: "Dyna.AI 保険リマインドアシスタントです。ご契約はまもなく更新時期を迎えます。お手続き方法を簡単に確認してもよろしいでしょうか。",
    },
  },
  {
    id: "claim-guidance",
    label: { zh: "理赔前置咨询", ja: "事故受付前の案内" },
    agentName: { zh: "理赔前置 Agent", ja: "事故受付前 Agent" },
    apiPrompt: {
      zh: "请模拟一次理赔前置咨询，先确认事故情况，再说明需要准备哪些资料。",
      ja: "事故受付前の案内を想定し、事故状況を確認したうえで必要書類を案内してください。",
    },
    exampleResponse: {
      zh: "请先简单说明事故发生的时间、地点和情况。确认后，我们会引导您准备必要材料，并判断是否需要人工协助。",
      ja: "まず事故の日時、場所、状況を簡単にお聞かせください。そのうえで必要書類をご案内し、必要に応じて担当者へおつなぎします。",
    },
  },
  {
    id: "handoff-flow",
    label: { zh: "人工转接", ja: "有人引継ぎ" },
    agentName: { zh: "接管 Agent", ja: "有人引継ぎ Agent" },
    apiPrompt: {
      zh: "请模拟一次需要人工接管的保险咨询，先礼貌说明原因，再引导转人工。",
      ja: "有人対応が必要な保険相談を想定し、理由を丁寧に説明したうえで担当者へ引き継いでください。",
    },
    exampleResponse: {
      zh: "为了更准确地帮助您，这个问题我将转给专员继续处理。接下来我会保留您的上下文，帮助您更快完成后续沟通。",
      ja: "より正確にご案内するため、この件は専門担当へ引き継ぎます。ここまでの内容は保持したまま、次のご案内へ進めます。",
    },
  },
];

function sceneText(sceneId, language) {
  const fallback = scenes[0];
  const scene = scenes.find((item) => item.id === sceneId) || fallback;
  return {
    scene,
    response: language === "ja" ? scene.exampleResponse.ja : scene.exampleResponse.zh,
    prompt: language === "ja" ? scene.apiPrompt.ja : scene.apiPrompt.zh,
  };
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  let body = "";
  await new Promise((resolve) => {
    req.on("data", (chunk) => (body += chunk));
    req.on("end", resolve);
  });

  let parsed = {};
  try {
    parsed = body ? JSON.parse(body) : {};
  } catch {}

  const language = parsed.language === "ja" ? "ja" : "zh";
  const { scene, response, prompt } = sceneText(parsed.sceneId, language);
  const baseUrl = (process.env.AGENT_DEMO_API_BASE_URL || "").trim();
  const apiKey = (process.env.AGENT_DEMO_API_KEY || "").trim();

  if (baseUrl) {
    try {
      const upstream = await fetch(`${baseUrl.replace(/\/$/, "")}/${scene.id}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          sceneId: scene.id,
          language,
          prompt: (parsed.prompt || prompt).trim(),
        }),
      });
      if (upstream.ok) {
        res.statusCode = upstream.status;
        res.setHeader("content-type", upstream.headers.get("content-type") || "application/json; charset=utf-8");
        res.end(await upstream.text());
        return;
      }
    } catch {}
  }

  res.statusCode = 200;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(
    JSON.stringify({
      sceneId: scene.id,
      sceneLabel: language === "ja" ? scene.label.ja : scene.label.zh,
      mode: baseUrl ? "fallback" : "mock",
      input: (parsed.prompt || prompt).trim(),
      result: {
        title: language === "ja" ? `${scene.agentName.ja} のデモ応答` : `${scene.agentName.zh} 的演示回复`,
        text: response,
        summary:
          language === "ja"
            ? "この応答は未接続時の表示用フォールバックです。実際の agent API を接続すると、ここが上書きされます。"
            : "当前为未接入时的展示兜底。接入真实 agent API 后，这里的内容会被实际返回覆盖。",
      },
    }),
  );
};
