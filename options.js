import { setLanguage, t, initLanguage } from "./i18n.js"
import { getDefaultSettings, debounce } from "./utils.js"

document.addEventListener("DOMContentLoaded", async () => {
  // Initialiser la langue en premier
  await initLanguage()

  const $ = (id) => document.getElementById(id)

  // Chargement prefs avec valeurs par défaut basées sur la locale
  const defaults = getDefaultSettings()
  const {
    language = "en",
    norm = defaults.norm,
    normEnabled = true,
    decimals = 4,
    base = defaults.base,
    historyEnabled = false,
    historyMax = 10,
    tooltipEnabled = false,
    dataMode = "decimal",
    quickconvert_theme = "light",
  } = await window.chrome.storage.sync.get([
    "language",
    "norm",
    "normEnabled",
    "decimals",
    "base",
    "historyEnabled",
    "historyMax",
    "tooltipEnabled",
    "dataMode",
    "quickconvert_theme",
  ])


  document.documentElement.setAttribute("data-theme", quickconvert_theme)
  document.documentElement.classList.toggle("dark", quickconvert_theme === "dark")

  $("language").value = language
  $("norm").value = norm
  $("normEnabled").checked = normEnabled
  $("decimals").value = decimals
  $("dataMode").value = dataMode
  $("base").value = base
  $("historyEnabled").checked = historyEnabled
  $("historyMax").value = historyMax
  $("tooltipEnabled").checked = tooltipEnabled

  // Manage focus styles for dropdowns
  document.querySelectorAll("select").forEach((sel) => {
    sel.addEventListener("focus", () => sel.classList.add("focused"))
    sel.addEventListener("blur", () => sel.classList.remove("focused"))
  })


  const historyMaxField = $("historyMaxField")
  const historyButtons = $("historyButtons")

  const DEBOUNCE_DELAY = 2000
  let countdownInterval
  let countdownRemaining = 0

  function startCountdown() {
    clearInterval(countdownInterval)
    countdownRemaining = DEBOUNCE_DELAY / 1000
    if ($("status")) {
      $("status").textContent = `${t("autoSaveIn")} ${countdownRemaining}s`
    }
    countdownInterval = setInterval(() => {
      countdownRemaining -= 1
      if (countdownRemaining >= 0) {
        if ($("status")) {
          $("status").textContent = `${t("autoSaveIn")} ${countdownRemaining}s`
        }
      }
      if (countdownRemaining <= 0) {
        clearInterval(countdownInterval)
      }
    }, 1000)
  }

  function toggleHistoryField() {
    const enabled = $("historyEnabled").checked
    historyMaxField.style.display = enabled ? "block" : "none"
    historyButtons.style.display = enabled ? "flex" : "none"
  }
  toggleHistoryField()

  $("historyEnabled").addEventListener("change", toggleHistoryField)

  // --------- Sauvegarde différée sur changement ----------

  async function saveField(e) {
    const toSave = {
      language: $("language").value,
      norm: $("norm").value,
      normEnabled: $("normEnabled").checked,
      decimals: Number.parseInt($("decimals").value, 10),
      dataMode: $("dataMode").value,
      base: $("base").value.trim().toLowerCase(),
      historyEnabled: $("historyEnabled").checked,
      historyMax: Number.parseInt($("historyMax").value, 10),
      tooltipEnabled: $("tooltipEnabled").checked,
    }
    await window.chrome.storage.sync.set(toSave)

    // no local crypto API preferences anymore

    // Si la langue change, appliquer immédiatement
    if (e && e.target && e.target.id === "language") {
      setLanguage($("language").value)
    }

    // Si la base ou la norme change, reset aussi from/to pour la popup
    if (
      (e && e.target && e.target.id === "base") ||
      (e && e.target && (e.target.id === "norm" || e.target.id === "normEnabled"))
    ) {
      await window.chrome.storage.sync.remove(["from", "to"])
    }

    clearInterval(countdownInterval)
    if ($("status")) {
      $("status").textContent = t("savedMessage")
      setTimeout(() => ($("status").textContent = ""), 1200)
    }
  }

  const debouncedSaveField = debounce(saveField, DEBOUNCE_DELAY)

  function handleFieldChange(e) {
    startCountdown()
    debouncedSaveField(e)
  }

  $("language").addEventListener("change", handleFieldChange)
  $("norm").addEventListener("change", handleFieldChange)
  $("normEnabled").addEventListener("change", handleFieldChange)
  $("decimals").addEventListener("input", handleFieldChange)
  $("dataMode").addEventListener("change", handleFieldChange)
  $("base").addEventListener("input", handleFieldChange)
  $("historyEnabled").addEventListener("change", handleFieldChange)
  $("historyMax").addEventListener("input", handleFieldChange)
  $("tooltipEnabled").addEventListener("change", handleFieldChange)


  // --- Gestion Modale Historique ---
  const historyModal = $("historyModal")
  const historyList = $("historyList")
  const manageHistoryBtn = $("manageHistoryBtn")
  const closeModalBtn = $("closeModalBtn")
  const exportHistoryBtn = $("exportHistoryBtn")
  const clearAllHistoryBtn = $("clearAllHistoryBtn")

  // Ouvrir modale
  if (manageHistoryBtn) {
    manageHistoryBtn.addEventListener("click", async () => {
      await loadAndDisplayHistory()
      historyModal.style.display = "flex"
    })
  }

  // Fermer modale
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      historyModal.style.display = "none"
    })
  }

  window.addEventListener("click", (e) => {
    if (e.target === historyModal) historyModal.style.display = "none"
  })

  // Charger et afficher l'historique dans la modale
  async function loadAndDisplayHistory() {
    const decimals = Number.parseInt($("decimals").value, 10) || 4
    const { history = [] } = await window.chrome.storage.sync.get("history")
    if (historyList) {
      historyList.innerHTML = ""
      const maxItems = Number.parseInt($("historyMax").value, 10) || 10
      const itemsToShow = history.slice(0, maxItems)
      if (itemsToShow.length === 0) {
        const emptyMsg = document.createElement("li")
        emptyMsg.textContent = t("historyEmptyMessage")
        emptyMsg.style.fontStyle = "italic"
        historyList.appendChild(emptyMsg)
        return
      }
      itemsToShow.forEach((rec) => {
        const li = document.createElement("li")
        li.textContent = `${rec.input} ${rec.from?.toUpperCase()} → ${
          rec.output?.toFixed(decimals) ?? ""
        } ${rec.to?.toUpperCase()}`
        // Bouton supprimer ligne
        const removeBtn = document.createElement("button")
        removeBtn.textContent = "×"
        removeBtn.className = "remove-btn"
        removeBtn.title = t("removeHistoryEntry")
        removeBtn.addEventListener("click", async (ev) => {
          ev.stopPropagation()
          await removeHistoryEntry(rec.time)
          await loadAndDisplayHistory()
        })
        li.appendChild(removeBtn)
        historyList.appendChild(li)
      })
    }
  }

  // Supprimer une entrée spécifique de l'historique
  async function removeHistoryEntry(time) {
    const { history = [] } = await window.chrome.storage.sync.get("history")
    const newHistory = history.filter((rec) => rec.time !== time)
    await window.chrome.storage.sync.set({ history: newHistory })
  }

  // Supprimer tout l'historique (bouton "Supprimer tout")
  if (clearAllHistoryBtn) {
    clearAllHistoryBtn.addEventListener("click", async () => {
      const confirmClear = confirm(t("confirmClearHistory"))
      if (!confirmClear) return
      await window.chrome.storage.sync.remove("history")
      await loadAndDisplayHistory()
    })
  }

  // Exporter l'historique en CSV
  if (exportHistoryBtn) {
    exportHistoryBtn.addEventListener("click", async () => {
      const { history = [] } = await window.chrome.storage.sync.get("history")
      if (history.length === 0) {
        alert(t("historyEmptyMessage"))
        return
      }
      const lines = history.map((rec) => [rec.time, rec.category, rec.input, rec.from, rec.output, rec.to].join(";"))
      const csvContent = ["time;category;input;from;output;to\n", ...lines].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "quickconvert-history.csv"
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        URL.revokeObjectURL(url)
        a.remove()
      }, 300)
    })
  }
})
