import i18n, { type BackendModule } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import type { Messages } from './locales/ru'

export const LANGUAGES = [
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'ro', label: 'Română', short: 'RO' },
  { code: 'en', label: 'English', short: 'EN' },
] as const

export type Language = (typeof LANGUAGES)[number]['code']

export const LANGUAGE_STORAGE_KEY = 'vitiguard.language'

// Тексты загружаются по требованию (pr-098): человеку нужен один язык из
// трёх, а все три — около 130 КБ в первой загрузке. Каждый язык — отдельный
// фрагмент сборки; Service Worker предзагружает все, так что смена языка
// работает и без сети
const loaders: Record<Language, () => Promise<Messages>> = {
  ru: () => import('./locales/ru').then((module) => module.ru),
  ro: () => import('./locales/ro').then((module) => module.ro),
  en: () => import('./locales/en').then((module) => module.en),
}

const isLanguage = (code: string): code is Language => code in loaders

const lazyLocales: BackendModule = {
  type: 'backend',
  init: () => undefined,
  read: (language, _namespace, callback) => {
    if (!isLanguage(language)) {
      callback(new Error(`Нет перевода: ${language}`), false)
      return
    }
    loaders[language]().then(
      (messages) => callback(null, messages),
      (error: Error) => callback(error, false),
    )
  },
}

// Готовность первого языка: приложение рисуется после неё, иначе на миг
// вместо текста были бы ключи переводов
export const i18nReady = i18n
  .use(lazyLocales)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: LANGUAGES.map((language) => language.code),
    // Язык браузера вроде ro-MD или en-GB сводится к поддерживаемому ro или en
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    // Переводы полные — это проверяет тип Messages, — поэтому русский как
    // запасной нужен только для неподдерживаемого языка браузера, и лишний
    // язык не загружается. i18next спрашивает и без кода языка
    fallbackLng: (code?: string) =>
      code && isLanguage(code.split('-')[0] ?? '') ? [] : ['ru'],
    detection: {
      // Сначала выбор пользователя, затем язык браузера
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    // React сам экранирует текст, двойное экранирование испортило бы кавычки
    interpolation: { escapeValue: false },
    // Язык загружается до первого рисования и при смене — до переключения
    react: { useSuspense: false },
  })

// Язык документа: от него зависят озвучивание экранными дикторами и переносы
i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language
})

export default i18n
