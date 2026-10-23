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
        // Границы районов и шрифт подписей карты — тоже часть оболочки (pr-070)
        globPatterns: ['**/*.{js,mjs,css,html,woff2,png,svg,pbf,geojson}'],
        // SDK Sentry (pr-092) загружается, только если задан DSN: в оболочку
        // для работы без сети его 450 КБ не входят
        globIgnores: ['**/sentry-*.js'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // При первой установке Service Worker сразу берёт открытую страницу:
        // иначе плитки первого визита прошли бы мимо кэша. Обновления
        // по-прежнему ждут кнопки «Обновить» (skipWaiting не включён)
        clientsClaim: true,
        // Запросы к API Service Worker не перехватывает: данные всегда свежие
        navigateFallbackDenylist: [/^\/api\//],
        // Плитки подложки — по мере просмотра (pr-070): виденная часть карты
        // открывается и без сети. Заранее ничего не скачивается — правила
        // tile.openstreetmap.org запрещают массовую загрузку
        runtimeCaching: [
          // Движок ONNX Runtime (14 МБ) — больше лимита предзагрузки. Он
          // сохраняется при скачивании модели для работы без сети (pr-071)
          {
            urlPattern: /\.wasm$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ort-wasm',
              expiration: { maxEntries: 2 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tiles-osm',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 7 * 24 * 60 * 60,
                purgeOnQuotaError: true,
              },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: /^https:\/\/server\.arcgisonline\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tiles-esri',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 7 * 24 * 60 * 60,
                purgeOnQuotaError: true,
              },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // У фрагмента с SDK Sentry — узнаваемое имя: его исключает предзагрузка
        chunkFileNames: (chunk) =>
          chunk.moduleIds.some((id) => id.includes('/@sentry/'))
            ? 'assets/sentry-[hash].js'
            : 'assets/[name]-[hash].js',
      },
    },
  },
  server: {
    // Временный туннель Cloudflare (pr-082): с телефона и из Telegram сервер
    // разработки открывается по https-адресу *.trycloudflare.com
    allowedHosts: ['.trycloudflare.com'],
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
    // Сценарии Playwright запускаются в настоящем браузере, а не в Vitest
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
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
      // Поток классификатора работает только в браузере (WebAssembly,
      // OffscreenCanvas): он проверяется в браузере, а его разбор фото и ответа
      // (leafTensor) и обмен сообщениями (offlineClassifier) — тестами
      exclude: [
        'src/main.tsx',
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
        'src/workers/**',
      ],
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
