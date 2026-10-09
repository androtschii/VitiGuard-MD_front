import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { ro } from './locales/ro'
import { ru } from './locales/ru'

export const LANGUAGES = [
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'ro', label: 'Română', short: 'RO' },
  { code: 'en', label: 'English', short: 'EN' },
] as const

export type Language = (typeof LANGUAGES)[number]['code']

export const LANGUAGE_STORAGE_KEY = 'vitiguard.language'

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      ro: { translation: ro },
      en: { translation: en },
    },
    supportedLngs: LANGUAGES.map((language) => language.code),
    // Язык браузера вроде ro-MD или en-GB сводится к поддерживаемому ro или en
    nonExplicitSupportedLngs: true,
    fallbackLng: 'ru',
    detection: {
      // Сначала выбор пользователя, затем язык браузера
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    // React сам экранирует текст, двойное экранирование испортило бы кавычки
    interpolation: { escapeValue: false },
  })

// Язык документа: от него зависят озвучивание экранными дикторами и переносы
i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language
})

export default i18n
