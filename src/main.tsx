import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { AppProviders } from '@/app/AppProviders'
import { initSession, signInWithTelegram } from '@/app/session'
import '@/i18n'
import { initTelegram } from '@/lib/telegram'
import { applyTheme, readStoredTheme, watchSystemTheme } from '@/theme'
import '@fontsource-variable/montserrat'
import './index.css'

// Страница показывается сразу, а сессия восстанавливается параллельно
const restoring = initSession()
// Мини-приложение Telegram: SDK грузится, только если открыто из бота, и
// там вход возможен без пароля (pr-090)
void initTelegram().then(
  (webApp) => webApp && signInWithTelegram(webApp.initData, restoring),
)
applyTheme(readStoredTheme())
watchSystemTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
