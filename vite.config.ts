/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Устанавливаемое приложение (pr-069): манифест и Service Worker. Новая
    // версия не подменяет открытую страницу молча — пользователь обновляет её
    // сам по подсказке (UpdatePrompt)
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'VitiGuard MD',
        short_name: 'VitiGuard',
        description:
          'Мониторинг здоровья виноградников Молдовы: диагностика по фото листа, спутниковые индексы и риск болезней',
        lang: 'ru',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#622ac3',
        background_color: '#ffffff',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Оболочка приложения: код, стили, шрифты и значки. Карта MapLibre —
        // самый большой фрагмент, лимит по умолчанию (2 МБ) его не пропускает
        globPatterns: ['**/*.{js,css,html,woff2,png,svg}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // Запросы к API Service Worker не перехватывает: данные всегда свежие
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // В разработке запросы к API уходят на локальный бэкенд — без настройки CORS
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
  // Фоновый поток MapLibre импортирует общий модуль, поэтому собирается как ES-модуль
  worker: {
    format: 'es',
  },
  test: {
    environment: 'jsdom',
    // Виртуальный модуль плагина PWA существует только в сборке Vite
    alias: {
      'virtual:pwa-register/react': fileURLToPath(
        new URL('./src/test/pwaRegister.ts', import.meta.url),
      ),
    },
    setupFiles: ['./src/test/setup.ts'],
    // Формы проверяются набором текста через user-event: под нагрузкой (покрытие,
    // медленная машина CI) пять секунд по умолчанию иногда не хватает
    testTimeout: 15_000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      // Точка входа только монтирует приложение, а test — вспомогательный код тестов
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.test.{ts,tsx}'],
      reporter: ['text-summary', 'html'],
      thresholds: {
        statements: 95,
        branches: 90,
        functions: 95,
        lines: 95,
        // Базовые UI-компоненты переиспользуются везде, для них планка выше
        'src/components/**': {
          statements: 100,
          branches: 95,
          functions: 100,
          lines: 100,
        },
      },
    },
  },
})
