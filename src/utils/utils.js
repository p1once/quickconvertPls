export { getDefaultSettings };

import { getCurrentLanguage } from '../../i18n.js';

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

