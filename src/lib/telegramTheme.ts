// Оформление под тему Telegram (pr-087). В мини-приложении «как в системе»
// значит «как в Telegram»: светлая или тёмная схема и цвета текущей темы
// чата. Смысловые цвета приложения (фон, поверхности, текст, подсказки,
// ссылки) берутся из Theme Parameters, фирменные кнопки остаются своими.
// Если тема выбрана вручную, действует палитра приложения
import { applyTheme, useThemeStore } from '@/theme'
import type { TelegramThemeParams, TelegramWebApp } from './telegram'

type Token =
  | 'canvas'
  | 'surface'
  | 'muted'
  | 'ink'
  | 'ink-soft'
  | 'ink-muted'
  | 'ink-subtle'
  | 'line'
  | 'accent'
  | 'danger'

// Для каждого токена — параметры Telegram по убыванию предпочтения: у
// старых клиентов новых параметров (section_bg_color и др.) нет
const SOURCES: Record<Token, (keyof TelegramThemeParams)[]> = {
  canvas: ['secondary_bg_color', 'bg_color'],
  surface: ['section_bg_color', 'bg_color'],
  muted: ['secondary_bg_color'],
  ink: ['text_color'],
  'ink-soft': ['text_color'],
  'ink-muted': ['subtitle_text_color', 'hint_color'],
  'ink-subtle': ['hint_color'],
  line: ['section_separator_color', 'secondary_bg_color'],
  accent: ['accent_text_color', 'link_color'],
  danger: ['destructive_text_color'],
}

const HEX = /^#[0-9a-f]{6}$/i

export function telegramPalette(params: TelegramThemeParams) {
  const palette: Partial<Record<Token, string>> = {}
  for (const [token, names] of Object.entries(SOURCES) as [
    Token,
    (keyof TelegramThemeParams)[],
  ][]) {
    const value = names
      .map((name) => params[name])
      .find((v) => v && HEX.test(v))
    if (value) palette[token] = value
  }
  return palette
}

export function applyTelegramTheme(webApp: TelegramWebApp) {
  const root = document.documentElement
  for (const token of Object.keys(SOURCES))
    root.style.removeProperty(`--${token}`)
  const { theme } = useThemeStore.getState()
  if (theme !== 'system') {
    applyTheme(theme)
    return
  }
  root.classList.toggle('dark', webApp.colorScheme === 'dark')
  for (const [token, value] of Object.entries(
    telegramPalette(webApp.themeParams),
  ))
    root.style.setProperty(`--${token}`, value)
  // Шапка и фон окна Telegram — того же цвета, что страница
  webApp.setHeaderColor?.('secondary_bg_color')
  webApp.setBackgroundColor?.('secondary_bg_color')
}

// Смена темы в Telegram и выбор темы в профиле применяются сразу
export function watchTelegramTheme(webApp: TelegramWebApp) {
  const apply = () => applyTelegramTheme(webApp)
  apply()
  webApp.onEvent('themeChanged', apply)
  const unsubscribe = useThemeStore.subscribe(apply)
  return () => {
    webApp.offEvent('themeChanged', apply)
    unsubscribe()
  }
}
