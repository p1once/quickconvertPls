import React from 'react'

export default function Popup() {
  return (
    <>
      <div className="card bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 w-[340px] mx-auto transition-all">
        <div className="header-row flex items-center justify-between mb-3">
          <h1 data-i18n="popupTitle" className="app-title">QuickConvert+</h1>
          <div className="header-buttons">
            <button id="themeToggle" className="theme-toggle focus:ring-2 focus:ring-[var(--primary)] transition hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md" aria-label="Toggle theme">
              <span className="theme-icon material-symbols-outlined">dark_mode</span>
            </button>
            <button id="settingsBtn" className="theme-toggle focus:ring-2 focus:ring-[var(--primary)] transition hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md" aria-label="Open settings">
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
          <select id="category" className="transition-colors duration-150 focus:ring-2 focus:ring-[var(--primary)] focus:outline-none rounded-md" aria-label="Choose category"></select>
        </div>

        <div className="field swap-group">
          <div className="unit-group">
            <label htmlFor="from" data-i18n="fromLabel">From</label>
            <select id="from" className="transition-colors duration-150 focus:ring-2 focus:ring-[var(--primary)] focus:outline-none rounded-md" aria-label="Unit from"></select>
          </div>
          <button id="swap" className="swap-btn transition-transform duration-300 hover:rotate-[-8deg] hover:scale-105">
            <svg viewBox="0 0 32 32" width="24" height="24" className="swap-svg">
              <path d="M8.3 11.7a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 1.4L12.4 8.3H24a1 1 0 1 1 0 2H12.4l2.3 2.3a1 1 0 0 1-1.4 1.4l-5-5zm15.4 8.6a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4l2.3-2.3H8a1 1 0 1 1 0-2h11.6l-2.3-2.3a1 1 0 1 1 1.4-1.4l5 5z" fill="currentColor"/>
            </svg>
          </button>
          <div className="unit-group">
            <label htmlFor="to" data-i18n="toLabel">To</label>
            <select id="to" className="transition-colors duration-150 focus:ring-2 focus:ring-[var(--primary)] focus:outline-none rounded-md" aria-label="Unit to"></select>
          </div>
          <div id="loader" className="loader" role="status" aria-hidden="true"></div>
        </div>

        <div className="field">
          <label htmlFor="value" data-i18n="inputPlaceholder">Enter value</label>
          <input type="number" id="value" data-i18n-placeholder="inputPlaceholder" aria-label="Value to convert" autoComplete="off" />
        </div>

        <div className="field">
          <label data-i18n="resultLabel">Result</label>
          <output id="result" aria-live="polite" style={{display:'none'}}>0</output>
        </div>

        <button id="copy" className="transition-colors duration-150 active:scale-95" data-i18n="copyButton">Copy</button>

        <div id="cryptoSupport" className="crypto-support" aria-label="Support cryptocurrency donations">
          <button id="btcBtn" className="crypto-btn" aria-label="Bitcoin donation address">
            <img src="btc.svg" width="24" height="24" alt="Bitcoin icon" aria-hidden="true" />
          </button>
          <button id="supportBtn" className="crypto-btn" aria-label="Support">
            <img id="kofiIcon" className="kofi-icon" src="kofi_icon.svg" width="24" height="24" alt="Ko-fi icon" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="cryptoModal" className="modal" style={{display:'none'}} role="dialog" aria-modal="true" aria-labelledby="cryptoModalTitle">
        <div className="modal-content" id="cryptoModalContent">
          <div className="modal-header">
            <h2 id="cryptoModalTitle" data-i18n="cryptoModalTitle">Payment address</h2>
            <button id="cryptoModalClose" className="close-btn" aria-label="Close window">&times;</button>
          </div>
          <div className="modal-body">
            <p id="cryptoAddress" className="crypto-address break-all select-all font-mono cursor-pointer"></p>
            <span id="cryptoCopied" className="crypto-copied" style={{display:'none'}}>✔ <span data-i18n="copiedText">Copied!</span></span>
            <img id="cryptoQRCode" alt="QR code address" className="w-44 h-44" />
          </div>
        </div>
      </div>

      <div id="kofiModal" className="modal" style={{display:'none'}} role="dialog" aria-modal="true" aria-labelledby="kofiModalTitle">
        <div className="modal-content kofi-modal-content">
          <div className="modal-header">
            <h2 id="kofiModalTitle" data-i18n="kofiModalTitle">Support me on Ko-fi</h2>
            <button id="kofiModalClose" className="close-btn" aria-label="Close window">&times;</button>
          </div>
          <div className="modal-body">
            <iframe id="kofiframe" data-src="https://ko-fi.com/p1p4ss/?hidefeed=true&widget=true&embed=true&preview=true" title="p1p4ss"></iframe>
          </div>
        </div>
      </div>
    </>
  )
}
