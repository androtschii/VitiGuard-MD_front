import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { THEMES, useThemeStore, type Theme } from '@/theme'

export function ThemeSwitcher() {
  const { t } = useTranslation()
  const id = useId()
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)

  return (
    <div className="flex items-center">
      <label htmlFor={id} className="sr-only">
        {t('theme.label')}
      </label>
      <select
        id={id}
        value={theme}
        onChange={(event) => setTheme(event.target.value as Theme)}
        className="rounded-md border border-line-strong bg-surface px-2 py-1 text-sm text-ink"
      >
        {THEMES.map((value) => (
          <option key={value} value={value}>
            {t(`theme.${value}`)}
          </option>
        ))}
      </select>
    </div>
  )
}
