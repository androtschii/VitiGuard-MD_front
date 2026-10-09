import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { AppProviders } from '@/app/AppProviders'
import { initSession } from '@/app/session'
import '@/i18n'
import { applyTheme, readStoredTheme, watchSystemTheme } from '@/theme'
import './index.css'

// Страница показывается сразу, а сессия восстанавливается параллельно
void initSession()
applyTheme(readStoredTheme())
watchSystemTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
