// Import des modules
import { unitCategories, convertUnit, fetchRates, convertCurrency, currencyRates, setCurrencyRates, extraUnits } from "./conversions.js"
import { supportedCryptos } from "./supportedCryptos.js"
import { setLanguage, t, initLanguage } from "./i18n.js"
import { getDefaultSettings, debounce } from "./utils.js"
import { ExtensionCache } from "./cache.js"


const defaultUnitsByNorm = {
  fr: {
    distance: { from: "kilometer", to: "mile" },
    weight: { from: "kilogram", to: "pound" },
    volume: { from: "liter", to: "gallon" },
    temperature: { from: "celsius", to: "fahrenheit" },
    currency: { from: "eur", to: "usd" },
    cryptocurrency: { from: "btc", to: "eth" },
    time: { from: "hour", to: "minute" },
    speed: { from: "kilometer_per_hour", to: "mile_per_hour" },
    area: { from: "square_meter", to: "square_kilometer" },
    energy: { from: "joule", to: "kilojoule" },
    pressure: { from: "pascal", to: "kilopascal" },
    data: { from: "byte", to: "kilobyte" },
  },
  us: {
    distance: { from: "mile", to: "kilometer" },
    weight: { from: "pound", to: "kilogram" },
    volume: { from: "gallon", to: "liter" },
    temperature: { from: "fahrenheit", to: "celsius" },
    currency: { from: "usd", to: "eur" },
    cryptocurrency: { from: "btc", to: "eth" },
    time: { from: "hour", to: "minute" },
    speed: { from: "mile_per_hour", to: "kilometer_per_hour" },
    area: { from: "acre", to: "square_meter" },
    energy: { from: "kilowatt_hour", to: "joule" },
    pressure: { from: "psi", to: "pascal" },
    data: { from: "byte", to: "kilobyte" },
  },
  uk: {
    distance: { from: "mile", to: "kilometer" },
    weight: { from: "pound", to: "kilogram" },
    volume: { from: "pint", to: "liter" },
    temperature: { from: "celsius", to: "fahrenheit" },
    currency: { from: "gbp", to: "eur" },
    cryptocurrency: { from: "btc", to: "eth" },
    time: { from: "hour", to: "minute" },
    speed: { from: "mile_per_hour", to: "kilometer_per_hour" },
    area: { from: "acre", to: "square_meter" },
    energy: { from: "kilowatt_hour", to: "joule" },
    pressure: { from: "bar", to: "pascal" },
    data: { from: "byte", to: "kilobyte" },
  },
}


const settings = {
  norm: "us",
  normEnabled: true,
  decimals: 4,
  base: "usd",
  historyEnabled: false,
  historyMax: 10,
  dataMode: "decimal",
}

let lastConversionRecord = null

function loadCategories() {
  const category = document.getElementById("category")
  category.innerHTML = ""
  ;[
    "distance",
    "weight",
    "volume",
    "temperature",
    "currency",
    "cryptocurrency",
    "time",
    "speed",
    "area",
    "energy",
    "pressure",
    "data",
  ].forEach((key) => {
    const label = t(`category_${key}`)
    category.appendChild(new Option(label, key))
  })
}

function loadUnits(cat, elt) {
  elt.innerHTML = ""
  if (cat === "currency") {
    elt.disabled = true
    elt.add(new Option("…", ""))
    return
  }
  if (cat === "cryptocurrency") {
    elt.disabled = false
    Object.keys(supportedCryptos).forEach((key) => {
      elt.add(new Option(key.toUpperCase(), key))
    })
    return
  }
  elt.disabled = false
  let units = Object.keys(unitCategories[cat])
  if (extraUnits[cat]) {
    units = units.concat(Object.keys(extraUnits[cat]))
  }
  units.forEach((u) => {
    const sourceCat = unitCategories[cat][u] !== undefined ? cat : extraUnits[cat][u]
    const label = t(`unit_${sourceCat}_${u}`)
    elt.add(new Option(label, u))
  })
}


async function loadSettings() {
  const defaults = getDefaultSettings()
  const saved = await window.chrome.storage.sync.get([
    "norm",
    "normEnabled",
    "decimals",
    "base",
    "historyEnabled",
    "historyMax",
    "dataMode",
    "quickconvert_theme",
    "category",
    "language",
  ])

  settings.norm = saved.norm ?? defaults.norm
  settings.normEnabled = saved.normEnabled !== false
  settings.decimals = saved.decimals ?? 4
  settings.base = saved.base ?? defaults.base
  settings.historyEnabled = saved.historyEnabled ?? false
  settings.historyMax = saved.historyMax ?? 10
  settings.dataMode = saved.dataMode ?? "decimal"
  return saved
}


async function saveHistory(record) {
  if (!settings.historyEnabled) return
  const { history = [] } = await window.chrome.storage.sync.get("history")
  history.unshift({ ...record, time: Date.now() })
  history.splice(settings.historyMax)
  await window.chrome.storage.sync.set({ history })
}

function setDefaultUnitsForCategory(cat) {
  const norm = settings.norm || getDefaultSettings().norm
  const def = (defaultUnitsByNorm[norm] && defaultUnitsByNorm[norm][cat]) || {}
  const from = document.getElementById("from")
  const to = document.getElementById("to")
  if (def.from && from.querySelector(`[value="${def.from}"]`)) {
    from.value = def.from
  } else if (from.options.length) {
    from.selectedIndex = 0
  }
  if (def.to && to.querySelector(`[value="${def.to}"]`)) {
    to.value = def.to
  } else if (to.options.length > 1) {
    to.selectedIndex = from.options.length > 1 ? 1 : 0
    if (to.value === from.value && to.options.length > 1) {
      to.selectedIndex = to.selectedIndex === 0 ? 1 : 0
    }
  }
}

// Fonction principale d'initialisation
document.addEventListener("DOMContentLoaded", async () => {
  // Initialiser la langue en premier
  await initLanguage()

  const saved = await loadSettings()

  const urlParams = new URLSearchParams(window.location.search)
  const compactMode = urlParams.get("compact") === "1"

  // Détection d'Opera pour appliquer des styles spécifiques si besoin
  if (navigator.userAgent.includes("OPR")) {
    document.documentElement.classList.add("opera")
  }

  const $ = (id) => document.getElementById(id)
  const historyField = document.querySelector(".history-field")
  const historySelect = $("history")
  const exportBtn = $("exportBtn")
  const category = $("category")
  const from = $("from")
  const to = $("to")
  const valueIn = $("value")
  const resultOut = $("result")
  const copyBtn = $("copy")
  const swapBtn = $("swap")
  const loader = $("loader")
  const themeToggle = $("themeToggle")
  const themeIcon = themeToggle.querySelector(".theme-icon")

  // Manage focus styles for dropdowns
  document.querySelectorAll("select").forEach((sel) => {
    sel.addEventListener("focus", () => sel.classList.add("focused"))
    sel.addEventListener("blur", () => sel.classList.remove("focused"))
  })

  let cryptoInterval = null
  const isCryptoActive = () =>
    category.value === "cryptocurrency" && valueIn.value.trim() !== ""

  function startCryptoInterval() {
    if (!cryptoInterval) {
      cryptoInterval = setInterval(doConvert, 5000)
    }
  }

  function stopCryptoInterval() {
    if (cryptoInterval) {
      clearInterval(cryptoInterval)
      cryptoInterval = null
    }
  }

  function checkCryptoAuto() {
    if (isCryptoActive()) {
      doConvert()
      startCryptoInterval()
    } else {
      stopCryptoInterval()
    }
  }

  if (compactMode) {
    document.documentElement.classList.add("compact-mode")
  }


  // SETTINGS BOUTON
  const settingsBtn = document.getElementById("settingsBtn")
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      if (window.chrome.runtime.openOptionsPage) {
        window.chrome.runtime.openOptionsPage()
      } else {
        window.open(window.chrome.runtime.getURL("options.html"))
      }
    })
  }
  const supportBtn = document.getElementById("supportBtn")
  const kofiModal = document.getElementById("kofiModal")
  const kofiModalClose = document.getElementById("kofiModalClose")
  if (supportBtn) {
    supportBtn.addEventListener("click", () => {
      if (kofiModal) {
        showKofiModal()
      } else {
        window.open("https://ko-fi.com/p1p4ss", "_blank")
      }
    })
  }
  if (kofiModalClose) kofiModalClose.onclick = () => hideKofiModal()
  window.addEventListener("click", (e) => {
    if (kofiModal && e.target === kofiModal) hideKofiModal()
  })
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (kofiModal && kofiModal.classList.contains("visible")) hideKofiModal()
      if (cryptoModal && cryptoModal.classList.contains("visible")) hideCryptoModal()
    }
  })
  // Tooltips
  ;[...document.querySelectorAll("button[aria-label],button[title]")].forEach((btn) => {
    btn.addEventListener("mouseenter", function () {
      const tip = document.createElement("div")
      tip.className = "tooltip"
      tip.textContent = this.getAttribute("aria-label") || this.getAttribute("title") || ""
      document.body.appendChild(tip)
      const rect = this.getBoundingClientRect()

      let left = rect.left + rect.width / 2 - tip.offsetWidth / 2
      const margin = 4
      const maxLeft = window.innerWidth - tip.offsetWidth - margin
      if (left < margin) left = margin
      if (left > maxLeft) left = maxLeft

      let top = rect.top - tip.offsetHeight - 12
      if (top < margin) top = rect.bottom + 12

      tip.style.left = left + "px"
      tip.style.top = top + "px"
      this._tooltip = tip
    })
    btn.addEventListener("mouseleave", function () {
      if (this._tooltip) {
        document.body.removeChild(this._tooltip)
        this._tooltip = null
      }
    })
  })

  // Modale crypto
  const btcBtn = $("btcBtn")
  const cryptoModal = $("cryptoModal")
  const cryptoModalClose = $("cryptoModalClose")
  const cryptoAddress = $("cryptoAddress")
  const cryptoQRCode = $("cryptoQRCode")
  const cryptoCopied = $("cryptoCopied")

  function showCryptoModal(address, imgSrc, colorClass = "") {
    if (cryptoModal) {
      cryptoModal.classList.remove("crypto-modal-btc")
      if (colorClass) cryptoModal.classList.add(colorClass)
      cryptoAddress.textContent = address
      cryptoQRCode.src = imgSrc
      cryptoModal.style.display = "flex"
      setTimeout(() => cryptoModal.classList.add("visible"), 5)
    }
  }

  function hideCryptoModal() {
    if (cryptoModal) {
      cryptoModal.classList.remove("visible", "crypto-modal-btc")
      setTimeout(() => {
        cryptoModal.style.display = "none"
      }, 220)
    }
  }

  function showKofiModal() {
    if (kofiModal) {
      const kofiFrame = document.getElementById("kofiframe")
      if (kofiFrame && !kofiFrame.src) {
        kofiFrame.src = kofiFrame.dataset.src
      }
      kofiModal.style.display = "flex"
      setTimeout(() => kofiModal.classList.add("visible"), 5)
    }
  }

  function hideKofiModal() {
    if (kofiModal) {
      kofiModal.classList.remove("visible")
      setTimeout(() => {
        kofiModal.style.display = "none"
      }, 220)
    }
  }

  if (btcBtn)
    btcBtn.onclick = () =>
      showCryptoModal("bc1qhw870cksg6pw52d32mn0s3y4xcwtalg7m0xrlk", "btc-qr.png", "crypto-modal-btc")
  if (cryptoModalClose) cryptoModalClose.onclick = hideCryptoModal
  window.addEventListener("click", (e) => {
    if (cryptoModal && e.target === cryptoModal) hideCryptoModal()
  })

  // Copy address
  if (cryptoAddress) {
    cryptoAddress.onclick = async () => {
      await navigator.clipboard.writeText(cryptoAddress.textContent)
      cryptoAddress.classList.add("copied")
      if (cryptoCopied) {
        cryptoCopied.style.display = ""
        setTimeout(() => {
          cryptoCopied.style.display = "none"
          cryptoAddress.classList.remove("copied")
        }, 1300)
      }
    }
  }

  // Swap button
  swapBtn.addEventListener("click", () => {
    swapBtn.classList.add("rotating")
    // Ajouter un léger délai pour une meilleure perception
    setTimeout(() => {
      ;[from.value, to.value] = [to.value, from.value]
      window.chrome.storage.sync.set({ from: from.value, to: to.value })
      updateResult()
    }, 150)
    setTimeout(() => swapBtn.classList.remove("rotating"), 500)
  })

  // Theme
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme)
    themeIcon.textContent = theme === "dark" ? "☀️" : "🌙"
    window.chrome.storage.sync.set({ quickconvert_theme: theme })
  }

  async function initTheme() {
    const { quickconvert_theme } = await window.chrome.storage.sync.get("quickconvert_theme")
    let theme = quickconvert_theme
    if (!theme) {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    setTheme(theme)
  }

  themeToggle.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || "light"
    setTheme(cur === "light" ? "dark" : "light")
  })

  await initTheme()

  // History
  function showHistory() {
    if (settings.historyEnabled) {
      historyField.style.display = ""
      window.chrome.storage.sync.get("history").then(({ history = [] }) => {
        historySelect.innerHTML = ""
        history
          .filter(
            (rec) =>
              rec.input !== undefined &&
              rec.input !== null &&
              (Number.parseFloat(rec.input) !== 0 || (rec.category === "temperature" && rec.input === 0)) &&
              ("" + rec.input).trim() !== "",
          )
          .slice(0, settings.historyMax)
          .forEach((rec) => {
            const label = `${rec.input} ${rec.from?.toUpperCase()} → ${
              rec.output?.toFixed(settings.decimals) ?? ""
            } ${rec.to?.toUpperCase()}`
            historySelect.add(new Option(label, rec.time))
          })
      })
    } else {
      historyField.style.display = "none"
    }
  }

  // Load categories and units
  loadCategories()
  if (saved.category) category.value = saved.category
  loadUnits(category.value, from)
  loadUnits(category.value, to)

  const { from: storedFrom, to: storedTo } = await window.chrome.storage.sync.get(["from", "to"])
  if (settings.normEnabled && (!storedFrom || !from.querySelector(`[value="${storedFrom}"]`))) {
    setDefaultUnitsForCategory(category.value)
    await window.chrome.storage.sync.set({ from: from.value, to: to.value })
  } else {
    from.value = storedFrom
    if (storedTo && to.querySelector(`[value="${storedTo}"]`)) {
      to.value = storedTo
    }
  }

  // Currency initialization avec cache
  async function initCurrency(forceReset = false) {
    loader.style.display = "inline-block"
    from.disabled = to.disabled = true

    try {
      const { base } = await window.chrome.storage.sync.get(["base"])
      settings.base = base ?? getDefaultSettings().base

      // Essayer d'abord le cache
      let cachedRates = null
      if (!forceReset) {
        cachedRates = await ExtensionCache.getRates(settings.base)
      }

      if (cachedRates) {
        // Utiliser les données en cache
        setCurrencyRates(cachedRates)
        console.log(`Using cached currency rates for ${settings.base}`)
      } else {
        // Récupérer de l'API et mettre en cache
        console.log(`Fetching fresh currency rates for ${settings.base}`)
        await fetchRates(settings.base)

        // Sauvegarder en cache
        if (currencyRates && Object.keys(currencyRates).length > 0) {
          await ExtensionCache.setRates(settings.base, currencyRates)
        }
      }

      // Remplir les selects
      from.innerHTML = to.innerHTML = ""
      Object.keys(currencyRates).forEach((code) => {
        from.add(new Option(code.toUpperCase(), code))
        to.add(new Option(code.toUpperCase(), code))
      })

      // Restaurer les sélections
      const fromToSaved = await window.chrome.storage.sync.get(["from", "to"])
      let forceBase = false
      if (forceReset || !fromToSaved.from || !from.querySelector(`[value="${fromToSaved.from}"]`)) {
        from.value = settings.base
        forceBase = true
      } else {
        from.value = fromToSaved.from
      }
      if (
        forceReset ||
        !fromToSaved.to ||
        !to.querySelector(`[value="${fromToSaved.to}"]`) ||
        fromToSaved.to === from.value
      ) {
        for (let i = 0; i < to.options.length; i++) {
          if (to.options[i].value !== from.value) {
            to.selectedIndex = i
            break
          }
        }
      } else {
        to.value = fromToSaved.to
      }
      if (forceReset || forceBase) {
        await window.chrome.storage.sync.set({ from: from.value, to: to.value })
      }
    } catch (e) {
      console.error("Currency initialization failed:", e)
      if (valueIn.value.trim() !== "") {
        resultOut.textContent = "⚠️ Currency rates unavailable"
        resultOut.style.display = ""
      }

      // Essayer de charger des taux de base en fallback
      try {
        const fallbackRates = await ExtensionCache.getRates("usd")
        if (fallbackRates) {
          setCurrencyRates(fallbackRates)
          console.log("Using fallback USD rates")
          // Remplir les selects avec les taux de fallback
          from.innerHTML = to.innerHTML = ""
          Object.keys(currencyRates).forEach((code) => {
            from.add(new Option(code.toUpperCase(), code))
            to.add(new Option(code.toUpperCase(), code))
          })
        }
      } catch (fallbackError) {
        console.error("Fallback rates also failed:", fallbackError)
      }
    } finally {
      loader.style.display = "none"
      from.disabled = to.disabled = false
    }
  }

  if (category.value === "currency") {
    await initCurrency(false)
  }

  // Conversion function
  async function doConvert() {
    if (valueIn.value.trim() === "") {
      resultOut.value = ""
      resultOut.style.display = "none"
      lastConversionRecord = null
      return
    }
    let v = Number.parseFloat(valueIn.value)
    if (isNaN(v) || v < 0) v = 0
    let res = 0
    try {
      if (category.value === "currency") {
        res = convertCurrency(v, from.value, to.value)
      } else if (category.value === "cryptocurrency") {
        // Essayer d'abord le cache
        let rates = await ExtensionCache.getCryptoRates(settings.base)

        if (!rates) {
          const resp = await chrome.runtime.sendMessage({
            type: "getCryptoRates",
            base: settings.base,
          })
          rates = resp && resp.rates
        }

        if (!rates) throw new Error("Error fetching crypto rates")

        const fromId = supportedCryptos[from.value]
        const toId = supportedCryptos[to.value]
        const fromRate = rates[fromId]?.[settings.base] ?? null
        const toRate = rates[toId]?.[settings.base] ?? null
        if (fromRate === null || toRate === null) throw new Error("Missing rates")
        const vInBase = v * fromRate
        res = vInBase / toRate
      } else {
        res = convertUnit(
          v,
          from.value,
          to.value,
          category.value,
          settings.dataMode
        )
      }
      const formatted = res.toFixed(settings.decimals)
      if (resultOut.value !== formatted) {
        resultOut.style.display = ""
        resultOut.value = formatted
        resultOut.classList.remove("flip-anim")
        void resultOut.offsetWidth
        resultOut.classList.add("flip-anim")
      }
      lastConversionRecord = {
        category: category.value,
        from: from.value,
        to: to.value,
        input: v,
        output: res,
      }
    } catch (e) {
      console.error(e)
      resultOut.textContent = "⚠️"
      resultOut.style.display = ""
      lastConversionRecord = null
    }
  }

  const updateResult = debounce(doConvert, 200)

  // Event listeners
  category.addEventListener("change", async () => {
    await window.chrome.storage.sync.set({ category: category.value })
    loadUnits(category.value, from)
    loadUnits(category.value, to)

    const { from: storedFrom, to: storedTo } = await window.chrome.storage.sync.get(["from", "to"])
    if (settings.normEnabled && (!storedFrom || !from.querySelector(`[value="${storedFrom}"]`))) {
      setDefaultUnitsForCategory(category.value)
      await window.chrome.storage.sync.set({ from: from.value, to: to.value })
    } else {
      from.value = storedFrom
      if (storedTo && to.querySelector(`[value="${storedTo}"]`)) {
        to.value = storedTo
      }
    }

    if (category.value === "currency") {
      await initCurrency(false)
    }
    updateResult()
    checkCryptoAuto()
  })
  ;[from, to].forEach((el) =>
    el.addEventListener("change", () => {
      window.chrome.storage.sync.set({ from: from.value, to: to.value })
      updateResult()
    }),
  )

  valueIn.addEventListener("input", () => {
    updateResult()
    checkCryptoAuto()
  })

  copyBtn.addEventListener("click", async () => {
    if (!lastConversionRecord) return
    await navigator.clipboard.writeText(resultOut.value)
    copyBtn.textContent = t("copiedText")
    copyBtn.classList.add("copied-anim")
    setTimeout(() => {
      copyBtn.textContent = t("copyButton")
      copyBtn.classList.remove("copied-anim")
    }, 1200)
    await saveHistory(lastConversionRecord)
    showHistory()
  })

  if (exportBtn) {
    exportBtn.addEventListener("click", async () => {
      exportBtn.classList.add("loading")
      const { history = [] } = await window.chrome.storage.sync.get("history")
      const lines = history.map((rec) => [rec.time, rec.category, rec.input, rec.from, rec.output, rec.to].join(";"))
      const blob = new Blob([["time;category;input;from;output;to\n", ...lines].join("\n")], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "quickconvert-history.csv"
      document.body.appendChild(a)
      setTimeout(() => {
        a.click()
        exportBtn.classList.remove("loading")
        URL.revokeObjectURL(url)
        a.remove()
      }, 800)
    })
  }

  // Storage change listener pour la langue
  window.chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.language) {
      setLanguage(changes.language.newValue || "en")
      // Recharger les catégories et unités avec les nouvelles traductions
      loadCategories()
      loadUnits(category.value, from)
      loadUnits(category.value, to)
    }
    if (area === "sync" && changes.base) {
      settings.base = changes.base.newValue ?? getDefaultSettings().base
      if (document.getElementById("category")?.value === "currency") {
        initCurrency(true)
      }
    }
    if (area === "sync" && changes.norm) {
      settings.norm = changes.norm.newValue ?? getDefaultSettings().norm
    }
    if (area === "sync" && changes.normEnabled !== undefined) {
      settings.normEnabled = changes.normEnabled.newValue !== false
    }
    if (area === "sync" && changes.dataMode) {
      settings.dataMode = changes.dataMode.newValue ?? "decimal"
    }
  })

  showHistory()
  updateResult()
  checkCryptoAuto()

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "cryptoRatesUpdated" && isCryptoActive()) {
      doConvert()
    }
  })

  valueIn.addEventListener("blur", () => {
    if (valueIn.value.trim() === "") {
      valueIn.style.borderColor = "rgba(239, 68, 68, 0.5)"
      setTimeout(() => {
        valueIn.style.borderColor = ""
      }, 2000)
    }
  })
})

// Ajouter le style pour l'animation
const style = document.createElement("style")
style.textContent = `
@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-10px); }
  20% { opacity: 1; transform: translateY(0); }
  80% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}
`
document.head.appendChild(style)
