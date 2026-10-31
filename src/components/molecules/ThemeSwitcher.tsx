import { useTranslation } from 'react-i18next'
import { SlidingChoice } from '@/components/molecules/SlidingChoice'
import { useTelegramStore } from '@/lib/telegram'
import { THEMES, useThemeStore, type Theme } from '@/theme'

const ICONS: Record<Theme, string> = {
  // Монитор, солнце, полумесяц
  system: 'M3 4.5h18v12H3zM8.5 20.5h7M12 16.5v4',
  light:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4',
  dark: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z',
}

export function ThemeSwitcher() {
  const { t } = useTranslation()
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  // В мини-приложении «как в системе» — это тема Telegram (pr-087)
  const inTelegram = useTelegramStore((state) => state.webApp !== null)

  return (
    <SlidingChoice
      label={t('theme.label')}
      value={theme}
      onChange={setTheme}
      options={THEMES.map((value) => ({
        value,
        label: t(
          value === 'system' && inTelegram
            ? 'theme.telegram'
            : `theme.${value}`,
        ),
        content: (
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={ICONS[value]} />
          </svg>
        ),
      }))}
    />
  )
}
