import { supportedCryptos } from "./supportedCryptos.js"

const DEBUG = false

export async function fetchCryptoRates(base = "usd") {
  const baseUpper = base.toUpperCase()

  // Build an array of promises to fetch each crypto rate in parallel
  const missingSymbols = []
  const requests = Object.entries(supportedCryptos).map(([symbol, id]) => {
    const url = `https://api.coinbase.com/v2/exchange-rates?currency=${symbol.toUpperCase()}`
    if (DEBUG) console.log(`Fetching ${symbol} rate from: ${url}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    return fetch(url, { signal: controller.signal })
      .then((res) => {
        clearTimeout(timeoutId)
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        const rateStr = data?.data?.rates?.[baseUpper]
        if (!rateStr) throw new Error(`No rate for ${symbol}`)
        const rate = parseFloat(rateStr)
        if (Number.isNaN(rate)) throw new Error(`Invalid rate for ${symbol}`)
        return { id, rate: { [base]: rate } }
      })
      .catch((err) => {
        if (DEBUG) console.error(`Coinbase fetch failed for ${symbol}:`, err)
        missingSymbols.push(symbol)
        return null
      })
  })

  const settled = await Promise.all(requests)
  const result = {}

  for (const res of settled) {
    if (res) {
      const { id, rate } = res
      result[id] = rate
    }
  }

  if (missingSymbols.length > 0) {
    if (DEBUG) console.log("Fetching missing rates from CoinGecko")
    try {
      const ids = missingSymbols.map((sym) => supportedCryptos[sym]).join(",")
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${base}`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      for (const sym of missingSymbols) {
        const id = supportedCryptos[sym]
        const rate = data[id]?.[base]
        if (rate !== undefined) {
          result[id] = { [base]: rate }
        }
      }
    } catch (e) {
      if (DEBUG) console.error("CoinGecko fallback failed", e)
    }
  }

  if (Object.keys(result).length === 0) {
    throw new Error("No crypto rates from Coinbase or CoinGecko")
  }

  return result
}
