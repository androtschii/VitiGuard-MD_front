import type { Decorator, Preview } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import i18n, { i18nReady } from '@/i18n'
import '@fontsource-variable/montserrat'
import '@/index.css'

// Язык и тема — из панели инструментов Storybook, как у пользователя
const withAppContext: Decorator = (Story, context) => {
  const { locale, theme } = context.globals as { locale: string; theme: string }
  void i18n.changeLanguage(locale)
  document.documentElement.classList.toggle('dark', theme === 'dark')
  return (
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <div className="bg-canvas p-4 text-ink">
          <Story />
        </div>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const preview: Preview = {
  // Тексты загружаются по требованию (pr-098): история рисуется после них
  loaders: [
    async ({ globals }) => {
      await i18nReady
      await i18n.changeLanguage((globals as { locale: string }).locale)
      return {}
    },
  ],
  decorators: [withAppContext],
  globalTypes: {
    locale: {
      description: 'Язык интерфейса',
      toolbar: {
        title: 'Язык',
        icon: 'globe',
        items: [
          { value: 'ru', title: 'Русский' },
          { value: 'ro', title: 'Română' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      description: 'Тема',
      toolbar: {
        title: 'Тема',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Светлая' },
          { value: 'dark', title: 'Тёмная' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { locale: 'ru', theme: 'light' },
  parameters: {
    layout: 'fullscreen',
    // Аддон доступности проверяет те же правила, что e2e-аудит (pr-094)
    a11y: { test: 'error' },
  },
}

export default preview
