const data = window.SITE_DATA;
const scenes = window.SCENES;
let language = "zh";
let activeSceneId = scenes[0].id;
let techExpanded = true;

const nav = document.getElementById("nav");
const stats = document.getElementById("stats");
const panelItems = document.getElementById("panelItems");
const capabilitySection = document.getElementById("capabilities");
const techGrid = document.getElementById("techGrid");
const techToggle = document.getElementById("techToggle");
const sceneList = document.getElementById("sceneList");
const sceneDetail = document.getElementById("sceneDetail");
const demoPrompt = document.getElementById("demoPrompt");
const demoButton = document.getElementById("runDemo");
const outputTitle = document.getElementById("outputTitle");
const outputBadge = document.getElementById("outputBadge");
const sampleResponse = document.getElementById("sampleResponse");
const outputNote = document.getElementById("outputNote");
const outputResult = document.getElementById("outputResult");
const langButtons = Array.from(document.querySelectorAll(".lang-btn"));

function t(key) {
  return data[language][key];
}

function sceneText(scene, key) {
  return scene[key][language];
}

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function setLanguage(nextLanguage) {
  language = nextLanguage;
  document.documentElement.lang = language;
  langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === language);
  });
  renderAll();
}

function renderNav() {
  nav.innerHTML = "";
  t("nav").forEach((item, index) => {
    const link = document.createElement("a");
    link.href = ["#overview", "#capabilities", "#technology", "#scenes", "#demo"][index];
    link.textContent = item;
    nav.appendChild(link);
  });
}

function renderStats() {
  stats.innerHTML = "";
  t("stats").forEach(([value, label]) => {
    const card = el("article", "stat");
    card.appendChild(el("div", "value", value));
    card.appendChild(el("div", "label", label));
    stats.appendChild(card);
  });
}

function renderPanel() {
  panelItems.innerHTML = "";
  t("panelItems").forEach(([title, body]) => {
    const card = el("article", "mini-card");
    card.appendChild(el("h3", "", title));
    card.appendChild(el("p", "", body));
    panelItems.appendChild(card);
  });
}

function renderCapabilities() {
  capabilitySection.innerHTML = "";
  t("capabilities").forEach(([title, body]) => {
    const card = el("article", "cap-card");
    card.appendChild(el("h3", "", title));
    card.appendChild(el("p", "", body));
    capabilitySection.appendChild(card);
  });
}

function renderTech() {
  techGrid.innerHTML = "";
  techGrid.classList.toggle("tech-collapsed", !techExpanded);
  t("techItems").forEach(([title, body]) => {
    const card = el("article", "tech-card");
    card.appendChild(el("h3", "", title));
    card.appendChild(el("p", "", body));
    techGrid.appendChild(card);
  });
  techToggle.textContent = techExpanded ? t("techToggleOpen") : t("techToggleClose");
}

function renderScenes() {
  sceneList.innerHTML = "";
  scenes.forEach((scene) => {
    const btn = el("button", `scene-btn${scene.id === activeSceneId ? " is-active" : ""}`);
    btn.type = "button";
    btn.innerHTML = `
      <span class="scene-flag">${scene.eyebrow[language]}</span>
      <h3>${scene.label[language]}</h3>
      <p>${scene.summary[language]}</p>
    `;
    btn.addEventListener("click", () => {
      activeSceneId = scene.id;
      renderScenes();
      renderSceneDetail();
      demoPrompt.value = scene.apiPrompt[language];
      outputTitle.textContent = scene.label[language];
      outputBadge.textContent = scene.agentId;
      sampleResponse.innerHTML = `<div class="sample-label">${language === "ja" ? "サンプル応答" : "示例回复"}</div><p>${scene.exampleResponse[language]}</p>`;
      outputNote.innerHTML = `<div class="note-label">${language === "ja" ? "説明" : "说明"}</div><p>${language === "ja" ? "右の出力欄に、選択したシーンの応答が表示されます。API が未接続の間は、商談用のフォールバック応答が使われます。" : "右侧输出区会显示所选场景的回复。API 尚未接入时，会使用适合拜访演示的兜底回复。"}</p>`;
      outputResult.innerHTML = "";
    });
    sceneList.appendChild(btn);
  });
}

function renderSceneDetail() {
  const scene = scenes.find((item) => item.id === activeSceneId) || scenes[0];
  sceneDetail.innerHTML = "";
  const wrap = el("div", "scene-detail-inner");
  wrap.innerHTML = `
    <div>
      <div class="section-kicker">${scene.eyebrow[language]}</div>
      <h2>${scene.label[language]}</h2>
      <p>${scene.summary[language]}</p>
    </div>
    <div class="bullet-box">
      <h3>${scene.bullets.title[language]}</h3>
      <ul class="bullet-list">
        ${scene.bullets.items
          .map((item) => `<li><span class="dot"></span><span>${item[language]}</span></li>`)
          .join("")}
      </ul>
    </div>
    <div class="meta-box">
      <div class="meta-row"><span>${language === "ja" ? "Agent 名" : "Agent 名称"}</span><strong>${scene.agentName[language]}</strong></div>
      <div class="meta-row"><span>${language === "ja" ? "Agent ID" : "Agent 标识"}</span><strong class="code">${scene.agentId}</strong></div>
      <div class="meta-row"><span>${language === "ja" ? "接続先" : "接口入口"}</span><strong class="code">${scene.endpointHint}</strong></div>
    </div>
    <p>${scene.detail[language]}</p>
  `;
  sceneDetail.appendChild(wrap);
  demoPrompt.value = scene.apiPrompt[language];
  outputTitle.textContent = scene.label[language];
  outputBadge.textContent = scene.agentId;
  sampleResponse.innerHTML = `<div class="sample-label">${language === "ja" ? "サンプル応答" : "示例回复"}</div><p>${scene.exampleResponse[language]}</p>`;
  outputNote.innerHTML = `<div class="note-label">${language === "ja" ? "説明" : "说明"}</div><p>${language === "ja" ? "右の出力欄に、選択したシーンの応答が表示されます。API が未接続の間は、商談用のフォールバック応答が使われます。" : "右侧输出区会显示所选场景的回复。API 尚未接入时，会使用适合拜访演示的兜底回复。"}</p>`;
  outputResult.innerHTML = "";
}

function renderAll() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (Object.prototype.hasOwnProperty.call(data[language], key)) {
      node.textContent = data[language][key];
    }
  });
  renderNav();
  renderStats();
  renderPanel();
  renderCapabilities();
  renderTech();
  renderScenes();
  renderSceneDetail();
  techToggle.textContent = techExpanded ? t("techToggleOpen") : t("techToggleClose");
  demoButton.textContent = t("demoButton");
}

async function runDemo() {
  const scene = scenes.find((item) => item.id === activeSceneId) || scenes[0];
  demoButton.disabled = true;
  const label = language === "ja" ? "応答を取得中..." : "正在获取回复...";
  demoButton.textContent = label;
  outputResult.innerHTML = "";
  try {
    const response = await fetch("/api/demo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sceneId: scene.id, language, prompt: demoPrompt.value }),
    });
    const result = await response.json();
    outputResult.innerHTML = `
      <div class="result-label">${result.mode === "mock" ? (language === "ja" ? "フォールバック応答" : "兜底回复") : (language === "ja" ? "API 応答" : "API 回复")}</div>
      <p><strong>${result.result.title}</strong></p>
      <p>${result.result.text}</p>
    `;
  } catch (error) {
    outputResult.innerHTML = `<div class="result-label">${language === "ja" ? "エラー" : "错误"}</div><p>${language === "ja" ? "API の呼び出しに失敗しました。後で再試行するか、エンドポイント設定を確認してください。" : "API 调用失败。请稍后重试，或检查接口配置。"}</p>`;
  } finally {
    demoButton.disabled = false;
    demoButton.textContent = t("demoButton");
  }
}

langButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

techToggle.addEventListener("click", () => {
  techExpanded = !techExpanded;
  renderTech();
});

demoButton.addEventListener("click", runDemo);

setLanguage(language);
