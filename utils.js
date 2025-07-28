export { getDefaultSettings, debounce };

import { getCurrentLanguage } from './i18n.js';

function getDefaultSettings() {
  const currentLang = getCurrentLanguage();
  if (currentLang === 'fr') {
    return {
      norm: 'fr',
      base: 'eur',
    };
  }
  return {
    norm: 'us',
    base: 'usd',
  };
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
