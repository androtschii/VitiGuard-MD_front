import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { AppProviders } from '@/app/AppProviders'
import { initSession, signInWithTelegram } from '@/app/session'
import { i18nReady } from '@/i18n'
import { initMonitoring } from '@/lib/monitoring'
import { initTelegram } from '@/lib/telegram'
import { applyTheme, readStoredTheme, watchSystemTheme } from '@/theme'
import './fonts.css'
import './index.css'

// Мониторинг ошибок — до всего остального, чтобы не пропустить ранние
void initMonitoring()
// Страница показывается сразу, а сессия восстанавливается параллельно
const restoring = initSession()
// Мини-приложение Telegram: SDK грузится, только если открыто из бота, и
// там вход возможен без пароля (pr-090)
void initTelegram().then(
  (webApp) => webApp && signInWithTelegram(webApp.initData, restoring),
)
applyTheme(readStoredTheme())
watchSystemTheme()

// Тексты выбранного языка — до первого рисования; если фрагмент языка не
// загрузился (нет сети и нет кэша), приложение всё равно рисуется
await i18nReady.catch(() => undefined)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
