// background.js - service worker amélioré
// L'objet chrome est déjà disponible globalement dans les extensions Chrome
import { ExtensionCache } from "./cache.js";
import * as conv from "./conversions.js";
import * as cryptoMod from "./cryptoRates.js";

const DEBUG = false


// Lors de l'installation de l'extension
chrome.runtime.onInstalled.addListener(() => {
  if (DEBUG) console.log("QuickConvert+ installed")
  chrome.alarms.create("updateRates", { periodInMinutes: 60 })
})

// Gestionnaire d'erreurs global
chrome.runtime.onStartup.addListener(() => {
  if (DEBUG) console.log("QuickConvert+ service worker started")

  // Re-planifier l'alarme au démarrage du service worker
  chrome.alarms.create("updateRates", { periodInMinutes: 60 })
})


async function updateRates() {
  try {
    const { base } = await chrome.storage.sync.get(["base"])
    const currentBase = (base || "usd").toLowerCase()

    // Les modules sont importés en haut du fichier pour éviter les import() dynamiques

    // Mettre à jour les devises traditionnelles
    try {
      const cached = await ExtensionCache.getRates(currentBase)
      if (!cached) {
        await conv.fetchRates(currentBase)
        if (conv.currencyRates && Object.keys(conv.currencyRates).length > 0) {
          await ExtensionCache.setRates(currentBase, conv.currencyRates)
        }
      }
    } catch (e) {
      console.error("Currency rates update failed:", e)
    }

    // Mettre à jour les cryptomonnaies
    try {
      const cachedCrypto = await ExtensionCache.getCryptoRates(currentBase)
      if (!cachedCrypto) {
        const rates = await cryptoMod.fetchCryptoRates(currentBase)
        if (rates) {
          await ExtensionCache.setCryptoRates(rates)
          chrome.runtime.sendMessage({ type: "cryptoRatesUpdated" })
        }
      }
    } catch (e) {
      console.error("Crypto rates update failed:", e)
    }
  } catch (err) {
    console.error("Rates update error:", err)
  }
}


// Nettoyer le cache périodiquement (une fois par jour)
chrome.alarms.create("cleanCache", { periodInMinutes: 24 * 60 })

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "cleanCache") {
    if (DEBUG) console.log("Cleaning cache...")
    // Utiliser le cache cleaner
    ExtensionCache.cleanOldCaches("rates_")
    ExtensionCache.cleanOldCaches("crypto_")
  } else if (alarm.name === "updateRates") {
    if (DEBUG) console.log("Updating rates via alarm")
    updateRates()
  }
})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "getCryptoRates") {
    ExtensionCache.getCryptoRates(msg.base || "usd")
      .then(async (cached) => {
        if (cached) {
          sendResponse({ rates: cached })
        } else {
          const rates = await cryptoMod.fetchCryptoRates(msg.base || "usd")
          if (rates) {
            await ExtensionCache.setCryptoRates(rates)
            chrome.runtime.sendMessage({ type: "cryptoRatesUpdated" })
          }
          sendResponse({ rates })
        }
      })
      .catch((e) => {
        console.error("getCryptoRates error", e)
        sendResponse({ rates: null })
      })
    return true
  }
})

// Gérer les erreurs non capturées
self.addEventListener("error", (event) => {
  console.error("Service worker error:", event.error)
})

self.addEventListener("unhandledrejection", (event) => {
  console.error("Service worker unhandled rejection:", event.reason)
})
