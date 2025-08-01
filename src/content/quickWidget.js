// Shadow DOM based widget without iframe
let settings = {
  tooltipEnabled: false,
  decimals: 2,
  dataMode: "decimal",
  language: "en",
};
let conversions = null;
let selectedValue = null;

const WIDGET_CSS_URL =
  typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL
    ? chrome.runtime.getURL("src/styles/widget.css")
    : "src/styles/widget.css";
const CONVERSIONS_URL =
  typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL
    ? chrome.runtime.getURL("src/utils/conversions.js")
    : "src/utils/conversions.js";

const DEFAULT_LANG = "en";
let currentLang = DEFAULT_LANG;
const translations = {};

async function loadLanguage(lang) {
  if (translations[lang]) return;
  try {
    const res = await fetch(chrome.runtime.getURL(`locales/${lang}.json`));
    translations[lang] = await res.json();
  } catch (e) {
    console.error("Failed to load language", lang, e);
    translations[lang] = {};
  }
}

async function setLanguage(lang) {
  await loadLanguage(DEFAULT_LANG);
  currentLang = lang;
  if (lang !== DEFAULT_LANG) {
    await loadLanguage(lang);
  }
}

function t(key) {
  return (
    translations[currentLang]?.[key] ||
    translations[DEFAULT_LANG]?.[key] ||
    key
  );
}

async function loadSettings() {
  const saved = await chrome.storage.sync.get([
    "tooltipEnabled",
    "decimals",
    "dataMode",
    "language",
  ]);
  settings.tooltipEnabled = saved.tooltipEnabled ?? false;
  settings.decimals = saved.decimals ?? settings.decimals;
  settings.dataMode = saved.dataMode ?? settings.dataMode;
  settings.language = saved.language || settings.language;
  await setLanguage(settings.language);
}

async function loadConversions() {
  if (!conversions) {
    conversions = await import(CONVERSIONS_URL);
  }
  return conversions;
}

function getSelectedText() {
  const sel = window.getSelection();
  return sel ? sel.toString().trim() : "";
}

function parseSelection(text) {
  const m = text
    .trim()
    .toLowerCase()
    .match(/(-?\d[\d\s\u202f,]*(?:[.,]\d+)?)(?:\s*)([a-z°$€£¥₹₿][a-z°$€£¥₹₿ _\/-]*)/i);
  if (!m) return null;
  const numStr = m[1].replace(/[\s\u202f]/g, "").replace(',', '.');
  const value = parseFloat(numStr);
  if (Number.isNaN(value)) return null;
  const rawUnit = m[2].trim().replace(/\s+/g, " ");
  return { value, rawUnit };
}

let widgetEl = null;
let fromSel = null;
let toSel = null;
let resultOut = null;

function detectTheme(startEl = document.body) {
  try {
    let el = startEl;
    while (el) {
      const bg = getComputedStyle(el).backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(bg);
        if (m) {
          const r = parseInt(m[1], 10);
          const g = parseInt(m[2], 10);
          const b = parseInt(m[3], 10);
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          return lum < 0.5 ? "dark" : "light";
        }
      }
      el = el.parentElement;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch (e) {
    // Some sites may prevent style inspection, fallback to light theme
    return "light";
  }
}

function applyTheme(el, refEl) {
  const theme = detectTheme(refEl);
  el.setAttribute("data-theme", theme);
  el.style.setProperty("--surface", theme === "dark" ? "#333" : "#eee");
}

function createWidget() {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.zIndex = "2147483647";
  container.style.top = "0";
  container.style.left = "0";
  const shadow = container.attachShadow({ mode: "open" });

  const widgetLink = document.createElement("link");
  widgetLink.rel = "stylesheet";
  widgetLink.href = WIDGET_CSS_URL;

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="swap-group">
      <select id="from"></select>
      <button id="swap" class="swap-btn">↔</button>
      <select id="to"></select>
    </div>
    <output id="result">0</output>
    <button id="copy">Copy</button>`;

  shadow.append(widgetLink, card);
  fromSel = card.querySelector("#from");
  toSel = card.querySelector("#to");
  resultOut = card.querySelector("#result");
  const swapBtn = card.querySelector("#swap");
  const copyBtn = card.querySelector("#copy");
  copyBtn.textContent = t("copyButton");

  // Manage focus styles for dropdowns
  ;[fromSel, toSel].forEach((sel) => {
    sel.addEventListener("focus", () => sel.classList.add("focused"));
    sel.addEventListener("blur", () => sel.classList.remove("focused"));
  });

  swapBtn.addEventListener("click", () => {
    [fromSel.value, toSel.value] = [toSel.value, fromSel.value];
    updateResult();
  });

  copyBtn.addEventListener("click", async () => {
    await navigator.clipboard.writeText(resultOut.textContent);
  });

  return container;
}

function removeWidget() {
  if (widgetEl && widgetEl.isConnected) {
    widgetEl.remove();
    widgetEl = null;
  }
}

async function updateResult() {
  if (!selectedValue || !fromSel || !toSel) return;
  const conv = await loadConversions();
  const cat = conv.unitToCategory[fromSel.value];
  if (!cat) return;
  let res
  try {
    if (cat === "currency") {
      if (!conv.currencyRates || Object.keys(conv.currencyRates).length === 0) {
        try {
          await conv.fetchRates(fromSel.value)
        } catch (e) {
          console.error("Failed to fetch currency rates", e)
          return
        }
      }
      res = conv.convertCurrency(selectedValue, fromSel.value, toSel.value)
    } else {
      res = conv.convertUnit(
        selectedValue,
        fromSel.value,
        toSel.value,
        cat,
        settings.dataMode
      )
    }
  } catch (e) {
    console.error(e)
    return
  }
  resultOut.textContent = res.toFixed(settings.decimals);
  resultOut.classList.remove("flip-anim");
  void resultOut.offsetWidth;
  resultOut.classList.add("flip-anim");
}

document.addEventListener("selectionchange", async () => {
  if (!settings.tooltipEnabled) return;
  const text = getSelectedText();
  if (!text) {
    removeWidget();
    return;
  }
  const parsed = parseSelection(text);
  if (!parsed) {
    removeWidget();
    return;
  }
  selectedValue = parsed.value;
  const conv = await loadConversions();
  const unitKey = conv.aliasToUnit[parsed.rawUnit.toLowerCase()];
  if (!unitKey) {
    removeWidget();
    return;
  }
  const cat = conv.unitToCategory[unitKey];
  if (!cat) {
    removeWidget();
    return;
  }
  if (!widgetEl) {
    widgetEl = createWidget();
  }
  const sel = window.getSelection();
  const anchor = sel && sel.anchorNode
    ? (sel.anchorNode.nodeType === Node.ELEMENT_NODE
        ? sel.anchorNode
        : sel.anchorNode.parentElement)
    : document.body;
  applyTheme(widgetEl, anchor);
  fromSel.innerHTML = "";
  toSel.innerHTML = "";
  if (cat === "currency" && (!conv.currencyRates || Object.keys(conv.currencyRates).length === 0)) {
    try {
      await conv.fetchRates(unitKey)
    } catch (e) {
      console.error("Failed to fetch currency rates", e)
    }
  }
  let units = []
  if (cat === "currency") {
    units = conv.currencyRates && Object.keys(conv.currencyRates).length > 0
      ? Object.keys(conv.currencyRates)
      : Object.keys(conv.currencyAliases)
  } else {
    units = Object.keys(conv.unitCategories[cat]);
  }
  units.forEach((u) => {
    const label = conv.unitAbbr[u] || u;
    fromSel.add(new Option(label, u));
    toSel.add(new Option(label, u));
  });
  fromSel.value = unitKey;
  const target = conv.defaultUnitTarget[unitKey] || units[0];
  toSel.value = target === unitKey && units.length > 1 ? units[1] : target;
  updateResult();

  if (!sel || sel.rangeCount === 0) return;
  const rect = sel.getRangeAt(0).getBoundingClientRect();
  document.body.appendChild(widgetEl);
  const top = rect.bottom + window.scrollY + 6;
  const left = rect.left + window.scrollX;
  widgetEl.style.top = `${Math.max(top, 0)}px`;
  widgetEl.style.left = `${Math.max(left, 0)}px`;
});

document.addEventListener("mousedown", (e) => {
  if (widgetEl && !widgetEl.contains(e.target)) removeWidget();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") removeWidget();
});

;(async () => {
  await loadSettings();
})();
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    if (changes.tooltipEnabled) {
      settings.tooltipEnabled = changes.tooltipEnabled.newValue;
    }
    if (changes.decimals) {
      settings.decimals = changes.decimals.newValue;
      updateResult();
    }
    if (changes.dataMode) {
      settings.dataMode = changes.dataMode.newValue;
      updateResult();
    }
    if (changes.language) {
      settings.language = changes.language.newValue;
      setLanguage(settings.language).then(() => {
        if (widgetEl && widgetEl.shadowRoot) {
          const copyBtn = widgetEl.shadowRoot.querySelector("#copy");
          if (copyBtn) copyBtn.textContent = t("copyButton");
        }
      });
    }
  }
});
