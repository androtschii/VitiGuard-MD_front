import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useTelegramStore } from '@/lib/telegram'
import { THEMES, useThemeStore, type Theme } from '@/theme'

export function ThemeSwitcher() {
  const { t } = useTranslation()
  const id = useId()
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  // В мини-приложении «как в системе» — это тема Telegram (pr-087)
  const inTelegram = useTelegramStore((state) => state.webApp !== null)

  return (
    <div className="fill-hover flex items-center rounded-md text-ink transition">
      <label htmlFor={id} className="sr-only">
        {t('theme.label')}
      </label>
      <select
        id={id}
        value={theme}
        onChange={(event) => setTheme(event.target.value as Theme)}
        className="cursor-pointer rounded-md border border-line-strong bg-transparent px-2 py-1 text-sm text-inherit transition"
      >
        {THEMES.map((value) => (
          <option key={value} value={value}>
            {t(
              value === 'system' && inTelegram
                ? 'theme.telegram'
                : `theme.${value}`,
            )}
          </option>
        ))}
      </select>
    </div>
  )
}
