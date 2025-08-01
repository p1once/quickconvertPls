import React, { useEffect, useState } from 'react'
import { unitCategories, convertUnit } from '../utils/conversions.js'
import { setLanguage, initLanguage } from '../../i18n.js'
import { useTranslation } from 'react-i18next'
import { getDefaultSettings } from '../utils/utils.js'

declare const chrome: any

export default function Popup() {
  const { t } = useTranslation()
  const [theme, setTheme] = useState('light')
  const [category, setCategory] = useState('distance')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [value, setValue] = useState('')
  const [result, setResult] = useState('')

  useEffect(() => {
    ;(async () => {
      await initLanguage()
      const defaults = getDefaultSettings()
      const stored = await chrome.storage.sync.get(['quickconvert_theme', 'category', 'from', 'to', 'language'])
      setTheme(stored.quickconvert_theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
      setCategory(stored.category || 'distance')
      const defUnits = Object.keys(unitCategories[stored.category || 'distance'])
      setFrom(stored.from || defUnits[0])
      setTo(stored.to || defUnits[1] || defUnits[0])
      if (stored.language) setLanguage(stored.language)
    })()
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    if (value === '') {
      setResult('')
      return
    }
    try {
      const v = parseFloat(value)
      const res = convertUnit(v, from, to, category)
      setResult(res.toFixed(4))
    } catch (e) {
      setResult('')
    }
  }, [value, from, to, category])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    chrome.storage.sync.set({ quickconvert_theme: next })
  }

  const openSettings = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage()
    } else {
      window.open(chrome.runtime.getURL('src/options/options.html'))
    }
  }

  useEffect(() => {
    const units = Object.keys(unitCategories[category])
    if (!units.includes(from)) setFrom(units[0])
    if (!units.includes(to)) setTo(units[1] || units[0])
  }, [category])

  useEffect(() => {
    const resize = () => {
      const { scrollWidth, scrollHeight } = document.documentElement
      window.resizeTo(scrollWidth, scrollHeight)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(document.documentElement)
    return () => ro.disconnect()
  }, [])

  return (
    <>
      <div className="card bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 mx-auto transition-all">
        <div className="header-row flex items-center justify-between mb-3">
          <h1 data-i18n="popupTitle" className="app-title">QuickConvert+</h1>
          <div className="header-buttons">
            <button id="themeToggle" className="theme-toggle focus:ring-2 focus:ring-[var(--primary)] transition hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md" aria-label="Toggle theme" onClick={toggleTheme}>
              <span className="theme-icon material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button id="settingsBtn" className="theme-toggle focus:ring-2 focus:ring-[var(--primary)] transition hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md" aria-label="Open settings" onClick={openSettings}>
              <span className="theme-icon material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>

        <div className="field history-field">
          <label htmlFor="history" data-i18n="historyLabel">History</label>
          <div className="history-row">
            <select id="history" className="transition-colors duration-150 focus:ring-2 focus:ring-[var(--primary)] focus:outline-none rounded-md" aria-label="Conversion history"></select>
            <button id="exportBtn" className="export-btn transition-colors duration-150 hover:bg-[var(--primary-hover)]" data-i18n="exportButton">
              Export CSV
              <span id="exportLoader" className="export-loader"></span>
            </button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="category" data-i18n="categoryLabel">Category</label>
          <select
            id="category"
            className="transition-colors duration-150 focus:ring-2 focus:ring-[var(--primary)] focus:outline-none rounded-md"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Choose category"
          >
            {Object.keys(unitCategories).map((cat) => (
              <option key={cat} value={cat} data-i18n={`category_${cat}`}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="field swap-group">
          <div className="unit-group">
            <label htmlFor="from" data-i18n="fromLabel">From</label>
            <select
              id="from"
              className="transition-colors duration-150 focus:ring-2 focus:ring-[var(--primary)] focus:outline-none rounded-md"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              aria-label="Unit from"
            >
              {Object.keys(unitCategories[category]).map((u) => (
                <option key={u} value={u} data-i18n={`unit_${category}_${u}`}>{u}</option>
              ))}
            </select>
          </div>
          <button
            id="swap"
            className="swap-btn transition-transform duration-300 hover:rotate-[-8deg] hover:scale-105"
            onClick={() => {
              setFrom(to)
              setTo(from)
            }}
          >
            <svg viewBox="0 0 32 32" width="24" height="24" className="swap-svg">
              <path d="M8.3 11.7a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 1.4L12.4 8.3H24a1 1 0 1 1 0 2H12.4l2.3 2.3a1 1 0 0 1-1.4 1.4l-5-5zm15.4 8.6a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4l2.3-2.3H8a1 1 0 1 1 0-2h11.6l-2.3-2.3a1 1 0 1 1 1.4-1.4l5 5z" fill="currentColor"/>
            </svg>
          </button>
          <div className="unit-group">
            <label htmlFor="to" data-i18n="toLabel">To</label>
            <select
              id="to"
              className="transition-colors duration-150 focus:ring-2 focus:ring-[var(--primary)] focus:outline-none rounded-md"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-label="Unit to"
            >
              {Object.keys(unitCategories[category]).map((u) => (
                <option key={u} value={u} data-i18n={`unit_${category}_${u}`}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="value" data-i18n="inputPlaceholder">Enter value</label>
          <input
            type="number"
            id="value"
            data-i18n-placeholder="inputPlaceholder"
            aria-label="Value to convert"
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <div className="field">
          <label data-i18n="resultLabel">Result</label>
          <output id="result" aria-live="polite" style={{ display: result ? '' : 'none' }}>
            {result}
          </output>
        </div>

        <button
          id="copy"
          className="transition-colors duration-150 active:scale-95"
          data-i18n="copyButton"
          onClick={async () => {
            if (result) {
              await navigator.clipboard.writeText(result)
            }
          }}
        >
          {t('copyButton')}
        </button>
        </div>

    </>
  )
}
