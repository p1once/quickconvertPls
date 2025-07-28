// Translation system using external locale files
let translations = {};
let currentLanguage = 'en';
const defaultLanguage = 'en';

async function loadLanguage(lang) {
  if (translations[lang]) return;
  const url = chrome.runtime.getURL(`locales/${lang}.json`);
  try {
    const res = await fetch(url);
    translations[lang] = await res.json();
  } catch (err) {
    console.error(`Failed to load language ${lang}`, err);
    translations[lang] = {};
  }
}

export async function setLanguage(lang) {
  await loadLanguage(defaultLanguage);
  currentLanguage = lang;
  await loadLanguage(lang);
  applyTranslations();
}

export function getCurrentLanguage() {
  return currentLanguage;
}

export function t(key) {
  return (
    translations[currentLanguage]?.[key] ||
    translations[defaultLanguage]?.[key] ||
    key
  );
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    const translation = t(key);

    if (element.tagName.toLowerCase() === 'input' && element.type !== 'checkbox') {
      element.placeholder = translation;
    } else if (element.tagName.toLowerCase() === 'option') {
      element.textContent = translation;
    } else {
      element.textContent = translation;
    }
  });

  // Localize language names using Intl.DisplayNames
  const langNames = new Intl.DisplayNames([currentLanguage], { type: 'language' });
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
    element.placeholder = t(key);
  });

  document.title = t('extName');
}

export async function initLanguage() {
  const { language = defaultLanguage } = await window.chrome.storage.sync.get('language');
  currentLanguage = language;
  await loadLanguage(defaultLanguage);
  if (language !== defaultLanguage) {
    await loadLanguage(language);
  }
  applyTranslations();
}

export { translations };
