import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { AppProviders } from '@/app/AppProviders'
import { initSession } from '@/app/session'
import '@/i18n'
import { initTelegram } from '@/lib/telegram'
import { applyTheme, readStoredTheme, watchSystemTheme } from '@/theme'
import '@fontsource-variable/montserrat'
import './index.css'

// Страница показывается сразу, а сессия восстанавливается параллельно
void initSession()
// Мини-приложение Telegram: SDK грузится, только если открыто из бота
void initTelegram()
applyTheme(readStoredTheme())
watchSystemTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
