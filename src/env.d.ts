/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  // Адрес проекта Sentry (pr-092); без него мониторинг выключен
  readonly VITE_SENTRY_DSN?: string
}
