import React, { useEffect, useState, useCallback } from 'react'
import { setLanguage, t, initLanguage } from '../../i18n.js'
import { getDefaultSettings, debounce } from '../utils/utils.js'

// chrome typings are not available
declare const chrome: any

export default function Options() {
  const [language, setLang] = useState('en')
  const [norm, setNorm] = useState('us')
  const [normEnabled, setNormEnabled] = useState(true)
  const [decimals, setDecimals] = useState(4)
  const [dataMode, setDataMode] = useState('decimal')
  const [base, setBase] = useState('')
  const [historyEnabled, setHistoryEnabled] = useState(false)
  const [historyMax, setHistoryMax] = useState(10)
  const [tooltipEnabled, setTooltipEnabled] = useState(false)
  const [status, setStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    ;(async () => {
      await initLanguage()
      const defaults = getDefaultSettings()
      const saved = await chrome.storage.sync.get([
        'language',
        'norm',
        'normEnabled',
        'decimals',
        'dataMode',
        'base',
        'historyEnabled',
        'historyMax',
        'tooltipEnabled',
      ])

      setLang(saved.language ?? 'en')
      setNorm(saved.norm ?? defaults.norm)
      setNormEnabled(saved.normEnabled !== false)
      setDecimals(saved.decimals ?? 4)
      setDataMode(saved.dataMode ?? 'decimal')
      setBase(saved.base ?? defaults.base)
      setHistoryEnabled(saved.historyEnabled ?? false)
      setHistoryMax(saved.historyMax ?? 10)
      setTooltipEnabled(saved.tooltipEnabled ?? false)
    })()
  }, [])

  useEffect(() => {
    setLanguage(language)
  }, [language])

  const saveSettings = useCallback(async () => {
    const toSave = {
      language,
      norm,
      normEnabled,
      decimals: Number.parseInt(String(decimals), 10),
      dataMode,
      base: base.trim().toLowerCase(),
      historyEnabled,
      historyMax: Number.parseInt(String(historyMax), 10),
      tooltipEnabled,
    }
    await chrome.storage.sync.set(toSave)
    setStatus(t('savedMessage'))
    setTimeout(() => setStatus(''), 1200)
  }, [language, norm, normEnabled, decimals, dataMode, base, historyEnabled, historyMax, tooltipEnabled])

  const debouncedSave = useCallback(debounce(saveSettings, 2000), [saveSettings])

  const handleChange = (fn: (v: any) => void) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    fn(e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value)
    debouncedSave()
  }

  const loadHistory = useCallback(async () => {
    const { history = [] } = await chrome.storage.sync.get('history')
    setHistory(history.slice(0, Number(historyMax)))
  }, [historyMax])

  const removeEntry = async (time: number) => {
    const { history: hist = [] } = await chrome.storage.sync.get('history')
    const newHistory = hist.filter((rec: any) => rec.time !== time)
    await chrome.storage.sync.set({ history: newHistory })
    loadHistory()
  }

  const clearAll = async () => {
    const confirmClear = confirm(t('confirmClearHistory'))
    if (!confirmClear) return
    await chrome.storage.sync.remove('history')
    loadHistory()
  }

  const exportCSV = async () => {
    const { history: hist = [] } = await chrome.storage.sync.get('history')
    if (hist.length === 0) {
      alert(t('historyEmptyMessage'))
      return
    }
    const lines = hist.map((rec: any) => [rec.time, rec.category, rec.input, rec.from, rec.output, rec.to].join(';'))
    const csvContent = ['time;category;input;from;output;to\n', ...lines].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'quickconvert-history.csv'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      URL.revokeObjectURL(url)
      a.remove()
    }, 300)
  }

  const openModal = async () => {
    await loadHistory()
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)

  return (
    <>
      <div className="card bg-white dark:bg-gray-800 rounded-xl shadow p-4 w-[360px] mx-auto">
        <div className="header-row">
          <h1 data-i18n="optionsTitle">Options</h1>
        </div>
        <div className="field">
          <label htmlFor="language" data-i18n="languageLabel">Language</label>
          <select id="language" value={language} onChange={handleChange(setLang)}>
            <option value="en" data-i18n="languageEN">English</option>
            <option value="fr" data-i18n="languageFR">Français</option>
            <option value="es" data-i18n="languageES">Español</option>
            <option value="de" data-i18n="languageDE">Deutsch</option>
            <option value="zh-CN" data-i18n="languageZHCN">简体中文</option>
            <option value="hi" data-i18n="languageHI">हिन्दी</option>
            <option value="ar" data-i18n="languageAR">العربية</option>
            <option value="pt-BR" data-i18n="languagePTBR">Português (Brasil)</option>
            <option value="ru" data-i18n="languageRU">Русский</option>
            <option value="ja" data-i18n="languageJA">日本語</option>
            <option value="ko" data-i18n="languageKO">한국어</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="norm" data-i18n="normLabel">Norm/Country</label>
          <select id="norm" value={norm} onChange={handleChange(setNorm)}>
            <option value="fr" data-i18n="normFR">France (metric)</option>
            <option value="us" data-i18n="normUS">United States (imperial)</option>
            <option value="uk" data-i18n="normUK">United Kingdom (mixed)</option>
          </select>
          <div className="checkbox-field" style={{ marginTop: '6px' }}>
            <input type="checkbox" id="normEnabled" checked={normEnabled} onChange={handleChange(setNormEnabled)} />
            <label htmlFor="normEnabled" data-i18n="normEnabledLabel">Apply norm/country</label>
          </div>
        </div>
        <div className="field">
          <label htmlFor="decimals" data-i18n="decimalsLabel">Decimals</label>
          <input type="number" id="decimals" min="0" max="10" value={decimals} onChange={handleChange((v) => setDecimals(Number(v)))} />
        </div>
        <div className="field">
          <label htmlFor="dataMode" data-i18n="dataModeLabel">Data unit mode</label>
          <select id="dataMode" value={dataMode} onChange={handleChange(setDataMode)}>
            <option value="decimal" data-i18n="dataModeDecimal">Decimal (SI)</option>
            <option value="binary" data-i18n="dataModeBinary">Binary (IEC)</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="base" data-i18n="baseLabel">Base currency (e.g. 'USD')</label>
          <input type="text" id="base" maxLength={3} value={base} onChange={handleChange(setBase)} />
        </div>
        <div className="field checkbox-field">
          <input type="checkbox" id="historyEnabled" checked={historyEnabled} onChange={handleChange(setHistoryEnabled)} />
          <label htmlFor="historyEnabled" data-i18n="historyEnabledLabel">Enable history</label>
        </div>
        <div className="field checkbox-field">
          <input type="checkbox" id="tooltipEnabled" checked={tooltipEnabled} onChange={handleChange(setTooltipEnabled)} />
          <label htmlFor="tooltipEnabled" data-i18n="tooltipEnabledLabel">Enable quick widget</label>
        </div>
        {historyEnabled && (
          <>
            <div id="historyButtons" className="actions" style={{ marginBottom: '10px' }}>
              <button id="manageHistoryBtn" type="button" data-i18n="manageHistoryBtn" onClick={openModal}>Manage History</button>
            </div>
            <div className="field" id="historyMaxField">
              <label htmlFor="historyMax" data-i18n="historyMaxLabel">History max size</label>
              <input type="number" id="historyMax" min="1" max="50" value={historyMax} onChange={handleChange((v) => setHistoryMax(Number(v)))} />
            </div>
          </>
        )}
        <div id="status" className="status">{status}</div>
      </div>
      {modalOpen && (
        <div id="historyModal" className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 data-i18n="manageHistoryTitle">History Management</h2>
              <button id="closeModalBtn" className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              <ul id="historyList" className="history-list">
                {history.length === 0 && <li style={{ fontStyle: 'italic' }}>{t('historyEmptyMessage')}</li>}
                {history.map((rec) => (
                  <li key={rec.time}>
                    {`${rec.input} ${rec.from?.toUpperCase()} → ${rec.output?.toFixed(decimals) ?? ''} ${rec.to?.toUpperCase()}`}
                    <button className="remove-btn" title={t('removeHistoryEntry')} onClick={() => removeEntry(rec.time)}>×</button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="modal-footer">
              <button id="exportHistoryBtn" type="button" data-i18n="exportHistoryBtn" onClick={exportCSV}>Export CSV</button>
              <button id="clearAllHistoryBtn" type="button" data-i18n="clearHistoryBtn" onClick={clearAll}>Clear History</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
