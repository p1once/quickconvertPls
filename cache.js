// Système de cache intelligent pour l'extension
import { supportedCryptos } from "./supportedCryptos.js"


export class ExtensionCache {
  static CACHE_DURATION = 10 * 60 * 1000 // 10 minutes
  static CRYPTO_CACHE_DURATION = 2 * 60 * 1000 // 2 minutes pour crypto (plus volatil)

  // Cache pour les taux de change
  static async getRates(base) {
    try {
      const cacheKey = `rates_${base.toLowerCase()}`
      const timestampKey = `${cacheKey}_timestamp`

      const result = await chrome.storage.local.get([cacheKey, timestampKey])
      const cachedRates = result[cacheKey]
      const timestamp = result[timestampKey]

      if (cachedRates && timestamp) {
        const age = Date.now() - timestamp
        if (age < this.CACHE_DURATION) {
          console.log(`Using cached rates for ${base} (age: ${Math.round(age / 1000)}s)`)
          return cachedRates
        } else {
          console.log(`Cache expired for ${base} (age: ${Math.round(age / 1000)}s)`)
        }
      }

      return null
    } catch (error) {
      console.error("Error reading rates cache:", error)
      return null
    }
  }

  static async setRates(base, rates) {
    try {
      const cacheKey = `rates_${base.toLowerCase()}`
      const timestampKey = `${cacheKey}_timestamp`

      await chrome.storage.local.set({
        [cacheKey]: rates,
        [timestampKey]: Date.now(),
      })

      console.log(`Cached rates for ${base}`)

      // Nettoyer les anciens caches (garder seulement les 5 derniers)
      await this.cleanOldCaches("rates_")
    } catch (error) {
      console.error("Error saving rates cache:", error)
    }
  }

  // Cache pour les cryptomonnaies
  static async getCryptoRates(base) {
    try {
      const cacheKey = "crypto_rates"
      const timestampKey = "crypto_rates_timestamp"

      const result = await chrome.storage.local.get([cacheKey, timestampKey])
      let cachedRates = result[cacheKey]
      const timestamp = result[timestampKey]

      if (cachedRates && timestamp) {
        const age = Date.now() - timestamp
        if (age < this.CRYPTO_CACHE_DURATION) {
          if (cachedRates && cachedRates.data && cachedRates.data.currency) {
            const coinSym = cachedRates.data.currency.toLowerCase()
            const coinId = supportedCryptos[coinSym]
            const rateStr = cachedRates.data.rates?.[base.toUpperCase()]
            if (coinId && rateStr) {
              cachedRates = { [coinId]: { [base]: parseFloat(rateStr) } }
            } else {
              return null
            }
          }
          console.log(`Using cached crypto rates (age: ${Math.round(age / 1000)}s)`)
          return cachedRates
        }
      }

      return null
    } catch (error) {
      console.error("Error reading crypto cache:", error)
      return null
    }
  }

  static async setCryptoRates(rates) {
    try {
      await chrome.storage.local.set({
        crypto_rates: rates,
        crypto_rates_timestamp: Date.now(),
      })

      console.log("Cached crypto rates")
    } catch (error) {
      console.error("Error saving crypto cache:", error)
    }
  }

  // Nettoyer les anciens caches
  static async cleanOldCaches(prefix) {
    try {
      const storage = await chrome.storage.local.get()
      const cacheKeys = Object.keys(storage).filter((key) => key.startsWith(prefix) && !key.endsWith("_timestamp"))

      if (cacheKeys.length > 5) {
        // Trier par timestamp et garder seulement les 5 plus récents
        const cacheInfo = []
        for (const key of cacheKeys) {
          const timestampKey = `${key}_timestamp`
          const timestamp = storage[timestampKey] || 0
          cacheInfo.push({ key, timestamp })
        }

        cacheInfo.sort((a, b) => b.timestamp - a.timestamp)
        const keysToRemove = cacheInfo.slice(5).flatMap((info) => [info.key, `${info.key}_timestamp`])

        if (keysToRemove.length > 0) {
          await chrome.storage.local.remove(keysToRemove)
          console.log(`Cleaned ${keysToRemove.length} old cache entries`)
        }
      }
    } catch (error) {
      console.error("Error cleaning cache:", error)
    }
  }

}

