// i18n configuration using i18next for React
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from './locales/ar.json';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import hi from './locales/hi.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ptBR from './locales/pt-BR.json';
import ru from './locales/ru.json';
import zhCN from './locales/zh-CN.json';

// Build resources object for i18next
const resources = {
  ar: { translation: ar },
  de: { translation: de },
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  hi: { translation: hi },
  ja: { translation: ja },
  ko: { translation: ko },
  'pt-BR': { translation: ptBR },
  ru: { translation: ru },
  'zh-CN': { translation: zhCN },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

// Apply translations to static DOM nodes
export function applyTranslations() {
  // Update document language attribute for accessibility and to reflect current language
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', i18n.language)
  }

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    const translation = i18n.t(key);

    if (element.tagName.toLowerCase() === 'input' && element.type !== 'checkbox') {
      element.placeholder = translation;
    } else if (element.tagName.toLowerCase() === 'option') {
      element.textContent = translation;
    } else {
      element.textContent = translation;
    }
  });

  // Localize language names using Intl.DisplayNames
  const langNames = new Intl.DisplayNames([i18n.language], { type: 'language' });
  const languageMap = {};
  document
    .querySelectorAll('option[data-i18n^="language"]')
    .forEach((option) => {
      const key = option.getAttribute('data-i18n');
      if (key && option.value) {
        languageMap[key] = option.value;
      }
    });
  document
    .querySelectorAll('option[data-i18n^="language"]')
    .forEach((option) => {
      const key = option.getAttribute('data-i18n');
      const code = languageMap[key];
      if (code) {
        const localized = langNames.of(code);
        if (localized) {
          option.textContent = localized;
        }
      }
    });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.placeholder = i18n.t(key);
  });

  document.title = i18n.t('extName');
}

export async function setLanguage(lang) {
  await i18n.changeLanguage(lang);
  applyTranslations();
}

export function getCurrentLanguage() {
  return i18n.language;
}

export const t = (key, options) => i18n.t(key, options);

export async function initLanguage() {
  const { language = 'en' } = await window.chrome.storage.sync.get('language');
  await i18n.changeLanguage(language);
  applyTranslations();
}

export { i18n as default };
