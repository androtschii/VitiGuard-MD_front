import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
// Service Worker работает только в сборке: проверка PWA (pr-082) идёт на ней
const PREVIEW_PORT = 4174

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
    locale: 'ru-RU',
    timezoneId: 'Europe/Chisinau',
    viewport: { width: 1280, height: 800 },
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /pwa.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${PORT}`,
      },
    },
    {
      name: 'pwa',
      testMatch: /pwa.*\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${PREVIEW_PORT}`,
      },
    },
  ],
  webServer: [
    {
      command: `npm run dev -- --port ${PORT} --strictPort`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npm run build && npm run preview -- --port ${PREVIEW_PORT} --strictPort`,
      url: `http://localhost:${PREVIEW_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
  ],
})
