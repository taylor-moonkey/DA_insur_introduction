const site = window.DYNA_SITE;
const languageButtons = Array.from(document.querySelectorAll("[data-lang]"));
const nav = document.querySelector(".site-nav");
const menuToggle = document.querySelector(".menu-toggle");
const headerActions = document.querySelector(".header-actions");
const valueGrid = document.getElementById("valueGrid");
const technologyGrid = document.getElementById("technologyGrid");
const scenarioList = document.getElementById("scenarioList");
const agentGrid = document.getElementById("agentGrid");

function getLanguage() {
  const urlLanguage = new URLSearchParams(window.location.search).get("lang");
  const stored = window.localStorage.getItem("dyna-language");
  if (site.languages.includes(urlLanguage)) return urlLanguage;
  return site.languages.includes(stored) ? stored : site.defaultLanguage;
}

function setLanguage(language) {
  window.localStorage.setItem("dyna-language", language);
  document.documentElement.lang = language === "ja" ? "ja" : "zh";
  render(language);
}

function t(language, key) {
  return site.home[language][key] || "";
}

function translated(item, language) {
  return item[language] || item.zh;
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderStaticText(language) {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(language, element.dataset.i18n);
  });
}

function renderNav(language) {
  nav.innerHTML = "";
  site.nav[language].forEach((item) => {
    const link = createElement("a", "", item.label);
    link.href = item.href;
    link.addEventListener("click", () => {
      headerActions.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
    nav.appendChild(link);
  });
}

function renderValues(language) {
  valueGrid.innerHTML = "";
  t(language, "valueCards").forEach(([title, body], index) => {
    const card = createElement("article", "value-card");
    card.appendChild(createElement("span", "card-index", `0${index + 1}`));
    card.appendChild(createElement("h3", "", title));
    card.appendChild(createElement("p", "", body));
    valueGrid.appendChild(card);
  });
}

function renderTechnology(language) {
  technologyGrid.innerHTML = "";
  site.technology.forEach((item) => {
    const text = translated(item, language);
    const card = createElement("article", "technology-card");
    card.appendChild(createElement("span", "tech-id", item.id.toUpperCase()));
    card.appendChild(createElement("h3", "", text.title));
    card.appendChild(createElement("p", "", text.body));
    technologyGrid.appendChild(card);
  });
}

function renderScenarios(language) {
  scenarioList.innerHTML = "";
  site.scenarios.forEach((item) => {
    const text = translated(item, language);
    const card = createElement("article", "scenario-item");
    card.appendChild(createElement("span", "scenario-label", text.label));
    card.appendChild(createElement("h3", "", text.title));
    card.appendChild(createElement("p", "", text.body));
    scenarioList.appendChild(card);
  });
}

function renderAgents(language) {
  agentGrid.innerHTML = "";
  site.agents.forEach((agent) => {
    const text = translated(agent, language);
    const link = createElement("a", "agent-card");
    link.href = `${agent.path}?lang=${language}`;
    link.appendChild(createElement("span", "agent-mode", agent.mode));
    link.appendChild(createElement("h3", "", text.name));
    link.appendChild(createElement("p", "", text.short));
    const cta = createElement("span", "agent-cta", t(language, "startAgent"));
    link.appendChild(cta);
    agentGrid.appendChild(link);
  });
}

function renderLanguage(language) {
  languageButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === language);
  });
}

function render(language) {
  renderStaticText(language);
  renderNav(language);
  renderValues(language);
  renderTechnology(language);
  renderScenarios(language);
  renderAgents(language);
  renderLanguage(language);
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

menuToggle.addEventListener("click", () => {
  const isOpen = headerActions.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

render(getLanguage());
