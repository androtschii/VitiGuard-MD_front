import { expect, test, type Page } from '@playwright/test'
import { CRICOVA, mockApi } from './api.ts'

// Работа без сети в настоящем браузере (pr-085): сеть отключается средствами
// Chromium, поэтому navigator.onLine, события online/offline и отказ запросов
// такие же, как на телефоне в поле. Запуск без сети после перезагрузки
// проверяется на сборке с Service Worker (e2e/pwa.spec.ts)

// Проверка, сделанная без сети в прошлый раз и оставшаяся в очереди (pr-076).
// База создаётся в той же схеме, что у приложения (src/lib/db.ts)
async function queueCheck(page: Page) {
  await page.addInitScript(
    ({ vineyardId, bytes }) => {
      const request = indexedDB.open('vitiguard', 3)
      request.onupgradeneeded = () => {
        const db = request.result
        db.createObjectStore('models')
        db.createObjectStore('tracks', { keyPath: 'id', autoIncrement: true })
        db.createObjectStore('outbox', {
          keyPath: 'id',
          autoIncrement: true,
        }).add({
          image: new Uint8Array(bytes).buffer,
          name: 'leaf.jpg',
          type: 'image/jpeg',
          vineyardId,
          createdAt: '2026-06-10T07:30:00.000Z',
          disease: 'downy_mildew',
          confidence: 0.82,
        })
      }
      request.onsuccess = () => request.result.close()
    },
    { vineyardId: CRICOVA.id, bytes: [0xff, 0xd8, 0xff, 0xd9] },
  )
}

test('без сети — полоса о работе с загруженными данными', async ({
  page,
  context,
}) => {
  await mockApi(page)
  await page.goto('/history')
  await expect(page.getByRole('heading', { name: 'Милдью' })).toBeVisible()

  await context.setOffline(true)

  await expect(
    page.getByText(/Нет сети: показаны уже загруженные/),
  ).toBeVisible()
  // Уже загруженная история никуда не делась
  await expect(page.getByRole('heading', { name: 'Милдью' })).toBeVisible()

  await context.setOffline(false)
  await expect(page.getByText(/Нет сети/)).toHaveCount(0)
})

test('очередь проверок ждёт сети и уходит в историю сама', async ({
  page,
  context,
}) => {
  const api = await mockApi(page)
  await queueCheck(page)
  // Первая попытка — сервер недоступен
  let reachable = false
  await page.route(/\/api\/v1\/ai\/diagnose\?/, (route) =>
    reachable ? route.fallback() : route.abort('connectionrefused'),
  )

  await page.goto('/history')
  await expect(page.getByRole('alert')).toContainText(
    'Не удалось отправить проверки из очереди (1)',
  )

  await context.setOffline(true)
  await expect(page.getByText(/В очереди 1 проверка без сети/)).toBeVisible()

  reachable = true
  await context.setOffline(false)

  await expect(
    page.getByText('Проверка из очереди сохранена в историю.'),
  ).toBeVisible()
  expect(api.diagnoses).toEqual([
    expect.objectContaining({ save: 'true', vineyard_id: CRICOVA.id }),
  ])
})

test('обход записывается и без сети', async ({ page, context }) => {
  await context.grantPermissions(['geolocation'])
  await context.setGeolocation({ latitude: 47.1405, longitude: 28.862 })
  await mockApi(page)
  await page.goto('/map')
  const record = page.getByRole('button', { name: 'Записать обход' })
  await expect(record).toBeVisible()

  await context.setOffline(true)
  await record.click()
  await expect(page.getByText(/Идёт запись/)).toBeVisible()
  // Два шага по 11 м на север
  await context.setGeolocation({ latitude: 47.1406, longitude: 28.862 })
  await context.setGeolocation({ latitude: 47.1407, longitude: 28.862 })
  await expect(page.getByText(/^22 м ·/)).toBeVisible()
  await page.getByRole('button', { name: 'Остановить и сохранить' }).click()

  const saved = page.getByRole('list', { name: 'Сохранённые обходы' })
  await expect(saved).toContainText('22 м')
  const download = page.waitForEvent('download')
  await saved.getByRole('button', { name: 'GPX' }).click()
  expect((await download).suggestedFilename()).toMatch(
    /^vitiguard-track-\d{4}-\d{2}-\d{2}\.gpx$/,
  )
})
