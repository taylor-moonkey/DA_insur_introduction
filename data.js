window.DYNA_SITE = {
  defaultLanguage: "zh",
  languages: ["zh", "ja"],
  homePath: "/",
  nav: {
    zh: [
      { label: "核心技术", href: "#technology" },
      { label: "实际业务场景", href: "#scenarios" },
      { label: "Agent 体验", href: "#agents" },
    ],
    ja: [
      { label: "コア技術", href: "#technology" },
      { label: "業務シーン", href: "#scenarios" },
      { label: "Agent体験", href: "#agents" },
    ],
  },
  home: {
    zh: {
      brandSubtitle: "保险行业 Agent 解决方案",
      heroKicker: "Dyna.Ai Insurance Agent Solution",
      heroTitle: "面向保险行业的 AI Agent 解决方案",
      heroLead:
        "通过语音、文本与业务系统联动，帮助保险公司提升客户服务、业务办理和内部知识咨询效率。",
      primaryCta: "了解业务场景",
      secondaryCta: "体验 Agent Demo",
      brandLine: "Empower Work, Enrich Life",
      proofTitle: "从客户接触到内部支持，Agent可以覆盖保险业务中的高频环节。",
      proofLead:
        "保险行业的 AI Agent 不是单点问答工具，而是可以连接知识、流程和语音交互的业务入口。",
      valueCards: [
        [
          "提高客户服务效率",
          "覆盖客户咨询、续保提醒、保全办理等高频服务触点，提供 7×24 小时在线支持，有效缓解人工客服资源不足的问题。",
        ],
        [
          "承接业务流程",
          "承担身份核验、信息确认与资料修改等服务流程，并对办理过程进行全程记录与追踪，确保操作可查、流程可控",
        ],
        ["承接客户咨询", "承接客户咨询服务，快速响应常见问题，提升服务效率与客户体验"],
      ],
      technologyKicker: "Core Technology",
      technologyTitle: "让 Agent 能听懂、查得到、说得准，并能接入业务流程。",
      technologyLead:
        "Dyna.Ai 的保险行业方案由知识检索、语义理解、模型配置、语音能力和多形态交互共同支撑。",
      scenarioKicker: "Business Scenarios",
      scenarioTitle: "围绕保险客户最容易产生价值的场景展开。",
      scenarioLead:
        "围绕保险客户服务中的核心场景，覆盖主动触达、客户咨询、线上交互等多类服务入口，让 Agent 能力精准匹配真实业务需求。",
      agentsKicker: "Agent Demo",
      startAgent: "开始体验",
      apiReady: "API Ready",
      mockMode: "Mock Mode",
      apiError: "API Not Configured",
      footer: "Dyna.Ai Insurance Agent Solution",
    },
    ja: {
      brandSubtitle: "保険業界向け Agent ソリューション",
      heroKicker: "Dyna.Ai Insurance Agent Solution",
      heroTitle: "保険業界向けAI Agentソリューション",
      heroLead:
        "音声、テキスト、業務システムを連携し、保険会社の顧客対応、手続き案内、社内ナレッジ活用の効率化を支援します。",
      primaryCta: "業務シーンを見る",
      secondaryCta: "Agent Demoを体験",
      brandLine: "Empower Work, Enrich Life",
      proofTitle: "顧客接点から社内支援まで、Agentは保険業務の高頻度な接点をカバーできます。",
      proofLead:
        "保険業界のAI Agentは単なる FAQ ではありません。ナレッジ、業務フロー、音声対話をつなぐ新しい業務入口です。",
      valueCards: [
        [
          "顧客対応効率の向上",
          "顧客相談、更新リマインド、保全手続など高頻度のサービス接点をカバーし、24時間365日のオンライン対応でコールセンターの負荷を軽減します。",
        ],
        [
          "業務プロセスを支援",
          "本人確認、情報確認、資料変更などの手続きを担い、対応プロセスを記録・追跡することで、操作の可視化とフローの制御性を高めます。",
        ],
        ["顧客相談のサポート", "顧客相談を受け止め、よくある質問へ素早く回答し、対応効率と顧客体験を向上させます。"],
      ],
      technologyKicker: "Core Technology",
      technologyTitle: "聞き取れる、探せる、正確に答えられる、そして業務に接続できるAgent。",
      technologyLead:
        "Dyna.Ai の保険業界向けソリューションは、検索、意味理解、モデル設定、音声技術、多様な対話形式で構成されています。",
      scenarioKicker: "Business Scenarios",
      scenarioTitle: "保険会社にとって価値が出やすい業務シーンから提案します。",
      scenarioLead:
        "outbound、inbound、WebCall、テキスト入力まで、商談相手の検討テーマに合わせて説明しやすい構成です。",
      agentsKicker: "Agent Demo",
      startAgent: "体験を開始",
      apiReady: "API Ready",
      mockMode: "Mock Mode",
      apiError: "API Not Configured",
      footer: "Dyna.Ai Insurance Agent Solution",
    },
  },
  technology: [
    {
      id: "rag",
      zh: {
        title: "面向保险知识的 RAG 检索增强生成",
        body: "结合关键词检索与向量检索，在保险条款、业务规则、客户问答等复杂知识场景中提升召回率与答案准确性。",
      },
      ja: {
        title: "保険ナレッジ向け RAG 検索拡張生成",
        body: "キーワード検索とベクトル検索を組み合わせ、約款、業務ルール、問い合わせナレッジで回答精度を高めます。",
      },
    },
    {
      id: "embedding",
      zh: {
        title: "保险领域自研Embedding模型",
        body: "针对保险领域的专业术语、条款表达、业务流程进行优化，使 Agent 更准确理解客户问题和内部知识内容。",
      },
      ja: {
        title: "保険領域に最適化したEmbeddingモデル",
        body: "保険用語、約款表現、業務フローを踏まえて、顧客の質問と社内ナレッジをより正確に理解します。",
      },
    },
    {
      id: "llm",
      zh: {
        title: "支持多模型选择与配置",
        body: "可根据客户需求灵活选择和配置不同LLM模型，在成本、速度、稳定性和回答质量之间取得平衡。",
      },
      ja: {
        title: "複数 LLM の選択と設定に対応",
        body: "コスト、速度、安定性、回答品質のバランスに合わせて、最適なモデル構成を選択できます。",
      },
    },
    {
      id: "asr",
      zh: {
        title: "多家语音识别模型可选",
        body: "支持多家外采ASR模型配置，适配实时语音、电话交互等不同业务场景。",
      },
      ja: {
        title: "複数の音声認識モデルを選択可能",
        body: "リアルタイム音声、電話応対などの利用シーンに合わせ、外部ASRモデルを柔軟に設定できます。",
      },
    },
    {
      id: "tts",
      zh: {
        title: "自研 TTS 模型",
        body: "针对复杂数字、姓名、保险术语等高频表达进行优化，提升语音播报的自然度和准确性。",
      },
      ja: {
        title: "自社開発TTSモデル",
        body: "数字、氏名、保険用語などの読み上げを最適化し、自然で正確な音声案内を実現します。",
      },
    },
    {
      id: "voice",
      zh: {
        title: "可选音色与音色克隆服务",
        body: "当前提供两种基础音色。若客户提供偏好的音色数据，可进一步提供音色克隆服务。",
      },
      ja: {
        title: "音色選択と音色クローン",
        body: "基本音色に加え、顧客が希望する音声データをもとに音色クローンにも対応できます。",
      },
    },
    {
      id: "interaction",
      zh: {
        title: "多种 Agent 交互方式",
        body: "支持WebCall实时语音交互、文本交互及voice call交互形式",
      },
      ja: {
        title: "複数のAgent対話形式",
        body: "WebCall、テキスト対話、電話 inbound / outbound など、複数の接点で利用できます。",
      },
    },
  ],
  scenarios: [
    {
      id: "outbound",
      zh: {
        label: "Outbound 交互模式",
        title: "车险续保提醒",
        body: "在车险到期前，Agent 自动致电客户，提醒客户续保，并引导客户预约或前往线下门店办理续保业务。",
      },
      ja: {
        label: "Outbound 対話",
        title: "自動車保険の更新リマインド",
        body: "満期前に Agent が顧客へ架電し、更新手続きや来店予約につなげます。",
      },
    },
    {
      id: "inbound-internal",
      zh: {
        label: "Inbound 交互模式",
        title: "公司制度与手续咨询",
        body: "公司内部员工及各支店员工可随时致电 Agent，询问福利制度、内部规定、手续申请方式或负责人联系方式。",
      },
      ja: {
        label: "Inbound 対話",
        title: "社内制度と手続き相談",
        body: "本社や支店の社員が、福利厚生、社内規程、申請方法、担当者情報をいつでも確認できます。",
      },
    },
    {
      id: "inbound-customer",
      zh: {
        label: "Inbound 交互模式",
        title: "客户咨询与保全业务办理",
        body: "Agent 可回答客户保险相关咨询，并完成部分线上保全业务，实现从身份核验到信息变更的流程承接。",
      },
      ja: {
        label: "Inbound 対話",
        title: "顧客相談と保全手続き",
        body: "保険に関する問い合わせに回答し、本人確認から情報変更まで一部の契約保全業務を支援します。",
      },
    },
    {
      id: "webcall",
      zh: {
        label: "WebCall & 文本输入",
        title: "线上客户服务与保全办理",
        body: "客户可通过 WebCall 或文本输入咨询保险业务，并完成身份核验、信息确认、信息变更和后续引导。",
      },
      ja: {
        label: "WebCall / テキスト",
        title: "オンライン顧客対応と保全手続",
        body: "WebCall またはテキスト入力で、本人確認、情報確認、情報変更、次の手続き案内まで進めます。",
      },
    },
  ],
  agents: [
    {
      id: "auto-renewal",
      path: "/agents/auto-renewal/",
      mode: "outbound",
      zh: {
        name: "车险续保提醒 Agent",
        short: "到期前主动触达客户，确认续保意向并引导下一步。",
        intro: "适合展示 outbound 场景中，Agent 如何完成提醒、确认、预约引导和状态记录。",
        placeholder: "请输入客户可能会提出的问题，或让 Agent 模拟一次续保提醒。",
        opening: "您好，我是 Dyna.Ai 车险续保提醒 Agent。可以模拟续保提醒、预约引导和客户异议处理。",
        reply:
          "我会先说明保单即将到期，再确认客户是否方便办理续保。如果客户有兴趣，我会继续引导预约门店或确认后续联系方式。",
      },
      ja: {
        name: "自動車保険更新リマインド Agent",
        short: "満期前に顧客へ連絡し、更新意向と次の手続きを確認します。",
        intro: "outbound シーンで、案内、確認、予約誘導、ステータス記録まで進める流れを示します。",
        placeholder: "顧客からの質問、または更新リマインドのシミュレーション内容を入力してください。",
        opening: "Dyna.Ai 自動車保険更新リマインド Agent です。更新案内、予約誘導、異議対応をデモできます。",
        reply:
          "まず満期が近いことを丁寧にお伝えし、更新手続きのご意向を確認します。必要に応じて来店予約や次回連絡につなげます。",
      },
    },
    {
      id: "insurance-consulting",
      path: "/agents/insurance-consulting/",
      mode: "inbound",
      zh: {
        name: "保险业务咨询 Agent",
        short: "回答客户关于保险相关常见问题。",
        intro: "适合展示客户咨询场景中，Agent 如何结合知识库和统一口径完成高频问答。",
        placeholder: "请输入客户关于保单、缴费、条款或服务流程的问题。",
        opening: "您好，我是 Dyna.Ai 保险业务咨询 Agent。可以回答保单、条款、缴费和服务流程相关问题。",
        reply:
          "我会先识别问题类型，再基于知识库给出清晰答复。若问题涉及复杂判断或敏感信息，我会建议转人工继续处理。",
      },
      ja: {
        name: "保険業務相談 Agent",
        short: "契約、約款、保険料、手続きに関する質問に回答します。",
        intro: "顧客問い合わせで、ナレッジと統一された回答方針を使った FAQ 対応を示します。",
        placeholder: "契約、保険料、約款、手続きについて質問を入力してください。",
        opening: "Dyna.Ai 保険業務相談 Agent です。契約、約款、保険料、手続きに関する質問に回答できます。",
        reply:
          "質問の種類を確認し、ナレッジに基づいてわかりやすく回答します。複雑またはセンシティブな内容は担当者へ引き継ぎます。",
      },
    },
    {
      id: "policy-service",
      path: "/agents/policy-service/",
      mode: "inbound/webcall",
      zh: {
        name: "保全业务办理 Agent",
        short: "承接身份核验、信息确认、资料更新和后续办理引导。",
        intro: "适合展示从咨询到部分线上办理的流程型 Agent 能力。",
        placeholder: "请输入客户希望变更地址、电话、受益人等保全信息的需求。",
        opening: "您好，我是 Dyna.Ai 保全业务办理 Agent。可以协助演示身份核验、信息确认和变更引导。",
        reply:
          "我会先确认办理事项，再引导客户完成身份核验和必要信息确认。可以线上处理的部分会继续推进，必须线下办理的事项会给出明确指引。",
      },
      ja: {
        name: "保全手続き Agent",
        short: "本人確認、情報確認、変更受付、次の手続き案内を支援します。",
        intro: "問い合わせから一部オンライン手続きまで進める、フロー型 Agent の能力を示します。",
        placeholder: "住所、電話番号、受取人などの変更要望を入力してください。",
        opening: "Dyna.Ai 保全手続き Agent です。本人確認、情報確認、変更案内をデモできます。",
        reply:
          "まず手続き内容を確認し、本人確認と必要情報の確認へ進みます。オンライン対応が可能な場合はそのまま進め、来店が必要な場合は次の手順をご案内します。",
      },
    },
    {
      id: "internal-support",
      path: "/agents/internal-support/",
      mode: "inbound",
      zh: {
        name: "内部制度咨询 Agent",
        short: "为总部与支店员工提供制度、手续和负责人信息咨询。",
        intro: "适合展示企业内部知识问答和运营支持场景，减少人工重复答疑。",
        placeholder: "请输入员工关于公司制度、手续申请或负责人联系方式的问题。",
        opening: "您好，我是 Dyna.Ai 内部制度咨询 Agent。可以回答福利制度、内部规定和手续申请相关问题。",
        reply:
          "我会根据内部知识库确认制度口径，并给出申请路径、注意事项和负责人信息。若内容需要审批，我会提示员工进入对应流程。",
      },
      ja: {
        name: "社内制度相談 Agent",
        short: "本社と支店社員に、制度、手続き、担当者情報を案内します。",
        intro: "社内ナレッジ応答と運用支援のシーンを示し、繰り返しの問い合わせを削減します。",
        placeholder: "社内制度、申請手続き、担当者連絡先に関する質問を入力してください。",
        opening: "Dyna.Ai 社内制度相談 Agent です。福利厚生、社内規程、申請方法に関する質問に回答できます。",
        reply:
          "社内ナレッジに基づいて制度内容を確認し、申請経路、注意点、担当者情報をご案内します。承認が必要な場合は該当フローへ誘導します。",
      },
    },
    {
      id: "store-reservation",
      path: "/agents/store-reservation/",
      mode: "outbound",
      zh: {
        name: "门店预约引导 Agent",
        short: "在需要线下办理时，引导客户预约门店和准备材料。",
        intro: "适合展示 Agent 如何在无法线上闭环时，仍然给客户清晰的下一步。",
        placeholder: "请输入客户需要线下办理或预约门店的场景。",
        opening: "您好，我是 Dyna.Ai 门店预约引导 Agent。可以协助客户确认预约目的、门店和所需材料。",
        reply:
          "我会先确认客户要办理的业务，再说明是否需要线下办理。如果需要到店，我会引导选择门店、预约时间，并提醒准备材料。",
      },
      ja: {
        name: "来店予約案内 Agent",
        short: "来店が必要な場合に、予約と必要書類を案内します。",
        intro: "オンラインで完結しない場面でも、顧客に明確な次アクションを提示する流れを示します。",
        placeholder: "来店手続きや店舗予約が必要な場面を入力してください。",
        opening: "Dyna.Ai 来店予約案内 Agent です。予約目的、店舗、必要書類の確認をサポートします。",
        reply:
          "まず手続き内容を確認し、来店が必要かどうかをご案内します。必要な場合は店舗、予約時間、持参書類を順番に確認します。",
      },
    },
  ],
  agentPage: {
    zh: {
      back: "返回 Landing Page",
      statusLabel: "API 状态",
      conversation: "对话消息",
      inputLabel: "输入消息",
      send: "发送",
      voice: "WebCall",
      voiceStart: "开始 WebCall",
      voiceStop: "结束 WebCall",
      voiceListening: "正在聆听...",
      voiceSpeaking: "正在播报...",
      voiceUnsupported: "当前浏览器不支持网页语音识别。请使用 Chrome，并允许麦克风权限。",
      voicePermission: "麦克风权限未开启，无法使用 WebCall。请允许浏览器访问麦克风后再试。",
      fallbackTitle: "演示回复",
      empty: "输入一条消息，查看 Agent 如何回应。",
      unavailable: "API 调用失败，当前显示本地兜底回复。",
      apiNotConfigured: "真实 Agent API 尚未配置。请在 Vercel 环境变量中配置该 Agent 的接口地址后再试。",
      notFoundTitle: "未找到 Agent",
      notFoundBody: "请返回首页重新选择体验入口。",
      titleSuffix: "Dyna.Ai Agent Demo",
    },
    ja: {
      back: "Landing Page に戻る",
      statusLabel: "API 状態",
      conversation: "対話メッセージ",
      inputLabel: "メッセージ入力",
      send: "送信",
      voice: "WebCall",
      voiceStart: "WebCall開始",
      voiceStop: "WebCall終了",
      voiceListening: "音声入力中...",
      voiceSpeaking: "音声再生中...",
      voiceUnsupported: "このブラウザは音声認識に対応していません。Chromeでマイク権限を許可してください。",
      voicePermission: "マイク権限が許可されていないため、WebCallを利用できません。",
      fallbackTitle: "デモ応答",
      empty: "メッセージを入力すると、Agent の応答を確認できます。",
      unavailable: "API 呼び出しに失敗したため、ローカルのフォールバック応答を表示しています。",
      apiNotConfigured: "実 Agent API がまだ設定されていません。Vercel の環境変数に対象 Agent の接続先を設定してください。",
      notFoundTitle: "Agent が見つかりません",
      notFoundBody: "トップページに戻って体験入口を選択してください。",
      titleSuffix: "Dyna.Ai Agent Demo",
    },
  },
};
