
export const unitCategories = {
  distance: {
    meter: 1,
    kilometer: 1000,
    mile: 1609.344,
    yard: 0.9144,
    foot: 0.3048,
    inch: 0.0254,
    centimeter: 0.01,
    millimeter: 0.001,
    decimeter: 0.1,
    decameter: 10,
    hectometer: 100,
    nautical_mile: 1852,
  },
  weight: {
    gram: 1,
    kilogram: 1000,
    pound: 453.59237,
    ounce: 28.349523125,
    milligram: 0.001,
    tonne: 1000000,
    stone: 6350.29,
    carat: 0.2, // 1 carat = 0.2 grams
    troy_ounce: 31.1034768, // 1 troy ounce = 31.1034768 grams
    troy_pound: 373.2417216, // 1 troy pound = 373.2417216 grams
    short_ton: 907185, // US short ton = 907.185 kg = 907185 grams
    long_ton: 1016047, // UK long ton = 1016.047 kg = 1016047 grams
  },
  volume: {
    liter: 1,
    milliliter: 0.001,
    gallon: 3.785411784,
    pint: 0.473176473,
    cubic_meter: 1000,
    quart: 0.946353,
    cup: 0.236588,
    fluid_ounce: 0.0295735,
    cubic_centimeter: 0.001,
    cubic_decimeter: 1, // 1 dm³ = 1 liter
    cubic_decameter: 1000000, // 1 dam³ = 1,000,000 liters
    cubic_hectometer: 1000000000, // 1 hm³ = 1,000,000,000 liters
    cubic_kilometer: 1000000000000, // 1 km³ = 1,000,000,000,000 liters
    barrel: 158.987, // US liquid barrel = 158.987 liters
    cubic_foot: 28.3168, // 1 cubic foot = 28.3168 liters
    cubic_inch: 0.0163871, // 1 cubic inch = 0.0163871 liters
  },
  temperature: {
    celsius: {
      toKelvin: (v) => v + 273.15,
      fromKelvin: (v) => v - 273.15,
    },
    fahrenheit: {
      toKelvin: (v) => (v - 32) * (5 / 9) + 273.15,
      fromKelvin: (v) => (v - 273.15) * (9 / 5) + 32,
    },
    kelvin: {
      toKelvin: (v) => v,
      fromKelvin: (v) => v,
    },
    rankine: {
      toKelvin: (v) => v * (5 / 9),
      fromKelvin: (v) => v * (9 / 5),
    },
    reaumur: {
      toKelvin: (v) => v * (5 / 4) + 273.15,
      fromKelvin: (v) => (v - 273.15) * (4 / 5),
    },
  },
  time: {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
    month: 2629746, // Average month
    year: 31556952, // Average year
  },
  speed: {
    meter_per_second: 1,
    kilometer_per_hour: 1 / 3.6,
    mile_per_hour: 0.44704,
    knot: 0.514444,
  },
  area: {
    square_meter: 1,
    square_kilometer: 1000000,
    square_centimeter: 0.0001,
    square_millimeter: 0.000001,
    hectare: 10000,
    acre: 4046.86,
  },
  energy: {
    joule: 1,
    kilojoule: 1000,
    calorie: 4.184, // 1 cal = 4.184 J
    kilocalorie: 4184, // 1 kcal = 4184 J
    kilowatt_hour: 3600000, // 1 kWh = 3.6 MJ = 3,600,000 J
  },
  pressure: {
    pascal: 1,
    kilopascal: 1000,
    bar: 100000,
    psi: 6894.76, // 1 psi = 6894.76 Pa
    atmosphere: 101325, // 1 atm = 101325 Pa
  },
  data: {
    bit: 1,
    byte: 8,
    kilobyte: 8 * 1000,
    megabyte: 8 * 1000 * 1000,
    gigabyte: 8 * 1000 * 1000 * 1000,
    terabyte: 8 * 1000 * 1000 * 1000 * 1000,
  },
}

export const binaryDataUnits = {
  bit: 1,
  byte: 8,
  kilobyte: 8 * 1024,
  megabyte: 8 * 1024 * 1024,
  gigabyte: 8 * 1024 * 1024 * 1024,
  terabyte: 8 * 1024 * 1024 * 1024 * 1024,
}

export const unitAbbr = {
  meter: "m",
  kilometer: "km",
  mile: "mi",
  yard: "yd",
  foot: "ft",
  inch: "in",
  centimeter: "cm",
  millimeter: "mm",
  decimeter: "dm",
  decameter: "dam",
  hectometer: "hm",
  nautical_mile: "nm",
  gram: "g",
  kilogram: "kg",
  pound: "lb",
  ounce: "oz",
  milligram: "mg",
  tonne: "t",
  stone: "st",
  carat: "ct",
  troy_ounce: "ozt",
  troy_pound: "lbt",
  short_ton: "ston",
  long_ton: "lton",
  liter: "l",
  milliliter: "ml",
  gallon: "gal",
  pint: "pt",
  cubic_meter: "m3",
  quart: "qt",
  cup: "cup",
  fluid_ounce: "floz",
  cubic_centimeter: "cm3",
  cubic_decimeter: "dm3",
  cubic_decameter: "dam3",
  cubic_hectometer: "hm3",
  cubic_kilometer: "km3",
  barrel: "bbl",
  cubic_foot: "ft3",
  cubic_inch: "in3",
  celsius: "°C",
  fahrenheit: "°F",
  kelvin: "K",
  rankine: "°R",
  reaumur: "°Re",
  second: "s",
  minute: "min",
  hour: "h",
  day: "d",
  week: "wk",
  month: "mo",
  year: "yr",
  meter_per_second: "m/s",
  kilometer_per_hour: "km/h",
  mile_per_hour: "mph",
  knot: "kt",
  square_meter: "m²",
  square_kilometer: "km²",
  square_centimeter: "cm²",
  square_millimeter: "mm²",
  hectare: "ha",
  acre: "ac",
  joule: "J",
  kilojoule: "kJ",
  calorie: "cal",
  kilocalorie: "kcal",
  kilowatt_hour: "kWh",
  pascal: "Pa",
  kilopascal: "kPa",
  bar: "bar",
  psi: "psi",
  atmosphere: "atm",
  bit: "b",
  byte: "B",
  kilobyte: "kB",
  megabyte: "MB",
  gigabyte: "GB",
  terabyte: "TB",
}

export const unitToCategory = {}
export const aliasToUnit = {}
Object.entries(unitCategories).forEach(([cat, units]) => {
  Object.keys(units).forEach((unit) => {
    unitToCategory[unit] = cat
    const base = unit.replace(/_/g, " ")
    const aliases = new Set([
      unit,
      base,
      base + "s",
      (unitAbbr[unit] || "").toLowerCase(),
    ])
    aliases.forEach((a) => {
      if (a) aliasToUnit[a.toLowerCase()] = unit
    })
  })
})

// Aliases pour les devises courantes
export const currencyAliases = {
  usd: ["usd", "dollar", "dollars", "$", "us$"],
  eur: ["eur", "euro", "euros", "€"],
  gbp: ["gbp", "pound", "pounds", "£"],
  jpy: ["jpy", "yen", "¥"],
  cad: ["cad", "canadian dollar", "c$"],
  aud: ["aud", "australian dollar", "a$"],
  chf: ["chf", "swiss franc"],
  cny: ["cny", "yuan", "renminbi", "¥"],
  inr: ["inr", "rupee", "₹"],
}

Object.entries(currencyAliases).forEach(([code, aliases]) => {
  unitToCategory[code] = "currency"
  aliases.forEach((a) => {
    aliasToUnit[a.toLowerCase()] = code
  })
})

export const defaultUnitTarget = {
  kilometer: "mile",
  mile: "kilometer",
  liter: "gallon",
  gallon: "liter",
  kilogram: "pound",
  pound: "kilogram",
  celsius: "fahrenheit",
  fahrenheit: "celsius",
  eur: "usd",
  usd: "eur",
}

// Units from other categories that should appear when a category is selected
// Map units from volume to weight and vice versa (for water density)
export const extraUnits = { weight: {}, volume: {} }
Object.keys(unitCategories.volume).forEach((u) => {
  extraUnits.weight[u] = "volume"
})
Object.keys(unitCategories.weight).forEach((u) => {
  extraUnits.volume[u] = "weight"
})

export function convertUnit(value, from, to, category, dataMode = "decimal") {
  if (category === "temperature") {
    const k = unitCategories.temperature[from].toKelvin(value)
    return unitCategories.temperature[to].fromKelvin(k)
  }
  let fromMap = unitCategories[category]
  let toMap = unitCategories[category]

  if (category === "data" && dataMode === "binary") {
    fromMap = binaryDataUnits
    toMap = binaryDataUnits
  }

  // Handle cross conversions between weight and volume for water
  if (category === "weight") {
    const fromVol = extraUnits.weight[from]
    const toVol = extraUnits.weight[to]
    if (fromVol && toVol) {
      const fromFactor = unitCategories.volume[from]
      const toFactor = unitCategories.volume[to]
      return (value * fromFactor) / toFactor
    }
    if (fromVol) {
      const liters = value * unitCategories.volume[from]
      const grams = liters * 1000
      const toFactor = unitCategories.weight[to]
      return grams / toFactor
    }
    if (toVol) {
      const grams = value * fromMap[from]
      const liters = grams / 1000
      const toFactor = unitCategories.volume[to]
      return liters / toFactor
    }
  }
  if (category === "volume") {
    const fromWt = extraUnits.volume[from]
    const toWt = extraUnits.volume[to]
    if (fromWt && toWt) {
      const fromFactor = unitCategories.weight[from]
      const toFactor = unitCategories.weight[to]
      return (value * fromFactor) / toFactor
    }
    if (fromWt) {
      const grams = value * unitCategories.weight[from]
      const liters = grams / 1000
      const toFactor = unitCategories.volume[to]
      return liters / toFactor
    }
    if (toWt) {
      const liters = value * fromMap[from]
      const grams = liters * 1000
      const toFactor = unitCategories.weight[to]
      return grams / toFactor
    }
  }

  const fromFactor = fromMap[from]
  const toFactor = toMap[to]
  return (value * fromFactor) / toFactor
}

export let currencyRates = {}

export function setCurrencyRates(rates) {
  currencyRates = rates
}

// APIs de fallback pour les devises
const CURRENCY_APIS = [
  (base) => `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base}.json`,
  (base) => `https://api.exchangerate-api.com/v4/latest/${base.toUpperCase()}`,
  (base) => `https://open.er-api.com/v6/latest/${base.toUpperCase()}`,
]

export async function fetchRates(base = "eur", retries = 3) {
  // Essayer chaque API de fallback
  for (let apiIndex = 0; apiIndex < CURRENCY_APIS.length; apiIndex++) {
    const apiUrl = CURRENCY_APIS[apiIndex](base)

    // Retry pour chaque API
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        console.log(`Fetching rates from API ${apiIndex + 1}, attempt ${attempt + 1}`)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8s timeout

        const resp = await fetch(apiUrl, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "User-Agent": "QuickConvert+ Extension",
          },
        })

        clearTimeout(timeoutId)

        if (!resp.ok) {
          throw new Error(`HTTP error! status: ${resp.status}`)
        }

        const data = await resp.json()

        // Normaliser les différents formats de réponse
        let rates = null
        if (data[base]) {
          rates = data[base]
        } else if (data.rates) {
          rates = data.rates
        } else if (data.conversion_rates) {
          rates = data.conversion_rates
        } else {
          rates = data
        }

        if (rates && Object.keys(rates).length > 0) {
          currencyRates = rates
          console.log(`Successfully fetched rates from API ${apiIndex + 1}`)
          return
        } else {
          throw new Error("No rates data in response")
        }
      } catch (error) {
        console.warn(`API ${apiIndex + 1}, attempt ${attempt + 1} failed:`, error.message)

        // Si ce n'est pas le dernier essai, attendre avant de retry
        if (attempt < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
        }
      }
    }
  }

  // Si toutes les APIs ont échoué
  console.error("All currency APIs failed")
  throw new Error("Unable to fetch currency rates from any source")
}

export function convertCurrency(amount, from, to) {
  if (!currencyRates || Object.keys(currencyRates).length === 0) {
    throw new Error("Currency rates not loaded")
  }

  const fromRate = currencyRates[from.toLowerCase()]
  const toRate = currencyRates[to.toLowerCase()]

  if (fromRate === undefined || toRate === undefined) {
    throw new Error(`Currency rate not found for ${from} or ${to}`)
  }

  return (amount / fromRate) * toRate
}

