import React from 'react'

export default function Options() {
  return (
    <>
      <div className="card bg-white dark:bg-gray-800 rounded-xl shadow p-4 w-[360px] mx-auto">
        <div className="header-row">
          <h1 data-i18n="optionsTitle">Options</h1>
        </div>
        <div className="field">
          <label htmlFor="language" data-i18n="languageLabel">Language</label>
          <select id="language">
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
          <select id="norm">
            <option value="fr" data-i18n="normFR">France (metric)</option>
            <option value="us" data-i18n="normUS">United States (imperial)</option>
            <option value="uk" data-i18n="normUK">United Kingdom (mixed)</option>
          </select>
          <div className="checkbox-field" style={{marginTop:'6px'}}>
            <input type="checkbox" id="normEnabled" />
            <label htmlFor="normEnabled" data-i18n="normEnabledLabel">Apply norm/country</label>
          </div>
        </div>
        <div className="field">
          <label htmlFor="decimals" data-i18n="decimalsLabel">Decimals</label>
          <input type="number" id="decimals" min="0" max="10" />
        </div>
        <div className="field">
          <label htmlFor="dataMode" data-i18n="dataModeLabel">Data unit mode</label>
          <select id="dataMode">
            <option value="decimal" data-i18n="dataModeDecimal">Decimal (SI)</option>
            <option value="binary" data-i18n="dataModeBinary">Binary (IEC)</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="base" data-i18n="baseLabel">Base currency (e.g. 'USD')</label>
          <input type="text" id="base" maxLength={3} />
        </div>
        <div className="field checkbox-field">
          <input type="checkbox" id="historyEnabled" />
          <label htmlFor="historyEnabled" data-i18n="historyEnabledLabel">Enable history</label>
        </div>
        <div className="field checkbox-field">
          <input type="checkbox" id="tooltipEnabled" />
          <label htmlFor="tooltipEnabled" data-i18n="tooltipEnabledLabel">Enable quick widget</label>
        </div>
        <div id="historyButtons" className="actions" style={{display:'none', marginBottom:'10px'}}>
          <button id="manageHistoryBtn" type="button" data-i18n="manageHistoryBtn">Manage History</button>
        </div>
        <div className="field" id="historyMaxField">
          <label htmlFor="historyMax" data-i18n="historyMaxLabel">History max size</label>
          <input type="number" id="historyMax" min="1" max="50" />
        </div>
        <div id="status" className="status"></div>
      </div>
      <div id="historyModal" className="modal" style={{display:'none'}}>
        <div className="modal-content">
          <div className="modal-header">
            <h2 data-i18n="manageHistoryTitle">History Management</h2>
            <button id="closeModalBtn" className="close-btn">&times;</button>
          </div>
          <div className="modal-body">
            <ul id="historyList" className="history-list"></ul>
          </div>
          <div className="modal-footer">
            <button id="exportHistoryBtn" type="button" data-i18n="exportHistoryBtn">Export CSV</button>
            <button id="clearAllHistoryBtn" type="button" data-i18n="clearHistoryBtn">Clear History</button>
          </div>
        </div>
      </div>
    </>
  )
}
