import { defineConfig, devices } from '@playwright/test'

const PORT = 4173

// Сценарии в настоящем браузере: карта MapLibre рисуется через WebGL, которого
// нет в jsdom. API подменяется в самом браузере (e2e/api.ts), бэкенд не нужен
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  // Каждая вкладка рисует карту через программный WebGL: больше двух
  // одновременно перегружают процессор машины CI
  workers: 2,
  expect: { timeout: 10_000 },
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'ru-RU',
    timezoneId: 'Europe/Chisinau',
    viewport: { width: 1280, height: 800 },
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
})
