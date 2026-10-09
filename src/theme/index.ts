import { create } from 'zustand'

export const THEMES = ['system', 'light', 'dark'] as const

export type Theme = (typeof THEMES)[number]

// Тот же ключ читает скрипт в index.html, чтобы применить тему до загрузки приложения
export const THEME_STORAGE_KEY = 'vitiguard.theme'

const darkQuery = '(prefers-color-scheme: dark)'

function isTheme(value: unknown): value is Theme {
  return THEMES.includes(value as Theme)
}

export function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(stored) ? stored : 'system'
  } catch {
    // В приватном режиме некоторых браузеров хранилище недоступно
    return 'system'
  }
}

function prefersDark() {
  return window.matchMedia?.(darkQuery).matches ?? false
}

export function applyTheme(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && prefersDark())
  document.documentElement.classList.toggle('dark', dark)
}

type ThemeState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: readStoredTheme(),
  setTheme: (theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Тема применится и без сохранения, просто не переживёт перезагрузку
    }
    applyTheme(theme)
    set({ theme })
  },
}))

// В режиме «как в системе» тема следует за настройкой ОС и без перезагрузки
export function watchSystemTheme() {
  const query = window.matchMedia?.(darkQuery)
  if (!query) return () => {}
  const onChange = () => {
    if (useThemeStore.getState().theme === 'system') applyTheme('system')
  }
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
