// Telegram WebApp (pr-086): то же приложение открывается и как мини-приложение
// бота. SDK Telegram загружается только при таком запуске: в браузере и в
// установленном PWA он не нужен, а без него приложение работает как сайт
import { create } from 'zustand'

export const SDK_URL = 'https://telegram.org/js/telegram-web-app.js'
// Telegram передаёт параметры запуска в адресе (#tgWebAppData=...) только при
// открытии; после перезагрузки внутри Telegram признак берётся из вкладки
const LAUNCH_KEY = 'vitiguard.telegram'

export type TelegramWebApp = {
  initData: string
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  ready: () => void
  expand: () => void
  isVersionAtLeast: (version: string) => boolean
  disableVerticalSwipes?: () => void
  BackButton: {
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp }
  }
}

export const useTelegramStore = create<{ webApp: TelegramWebApp | null }>()(
  () => ({ webApp: null }),
)

export function isTelegramLaunch(hash = window.location.hash) {
  const params = new URLSearchParams(hash.slice(1))
  if (params.has('tgWebAppData') || params.has('tgWebAppPlatform')) {
    sessionStorage.setItem(LAUNCH_KEY, '1')
    return true
  }
  return sessionStorage.getItem(LAUNCH_KEY) === '1'
}

let loading: Promise<TelegramWebApp | null> | null = null

export function loadTelegram() {
  loading ??= new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = SDK_URL
    script.async = true
    script.onload = () => resolve(window.Telegram?.WebApp ?? null)
    // telegram.org недоступен (нет сети, блокировка) — работаем как сайт
    script.onerror = () => resolve(null)
    document.head.append(script)
  })
  return loading
}

export async function initTelegram() {
  if (!isTelegramLaunch()) return null
  const webApp = await loadTelegram()
  if (!webApp) return null
  webApp.ready()
  // Во всю высоту: карта и диагностика в половине окна неудобны
  webApp.expand()
  // Свайп вниз по карте двигает карту, а не закрывает мини-приложение
  if (webApp.isVersionAtLeast('7.7')) webApp.disableVerticalSwipes?.()
  document.documentElement.dataset.telegram = webApp.platform
  useTelegramStore.setState({ webApp })
  return webApp
}
