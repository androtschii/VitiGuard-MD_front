import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { mockApi } from './api.ts'

const LEAF = new URL('./fixtures/green-leaf.png', import.meta.url)

// Работа в поле без связи и синхронизация (pr-097) — на сборке, как на
// телефоне: Service Worker держит оболочку, движок WebAssembly и Web Worker,
// модель лежит в IndexedDB. Анализ без сети идёт настоящей моделью ONNX в
// браузере, а проверка с сохранением ждёт сети в очереди
test('без сети: диагноз на устройстве, очередь и синхронизация', async ({
  page,
  context,
}) => {
  const api = await mockApi(page)
  await page.goto('/diagnosis')
  await page.evaluate(() => navigator.serviceWorker.ready)
  // «Готов» — значит активен, но страницу он берёт под контроль чуть позже
  // (clientsClaim); до этого запросы, включая движок WebAssembly, идут мимо
  // его кэша
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null)

  // Пока сеть есть — модель на устройство
  await page.getByRole('button', { name: 'Скачать модель' }).click()
  await expect(page.getByText(/Модель на устройстве/)).toBeVisible()
  // Движок WebAssembly Service Worker кладёт в кэш параллельно с ответом:
  // сеть пропадает, только когда он уже сохранён
  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          const requests = await (await caches.open('ort-wasm')).keys()
          return requests.some((request) => request.url.endsWith('.wasm'))
        }),
      { timeout: 20_000 },
    )
    .toBe(true)

  await context.setOffline(true)
  await page.getByLabel('Выбрать фото листа').setInputFiles({
    name: 'leaf.png',
    mimeType: 'image/png',
    buffer: await readFile(LEAF),
  })
  await page.getByRole('button', { name: 'Определить болезнь' }).click()

  await expect(page.getByText(/Определено на устройстве/)).toBeVisible()
  await expect(page.getByText('Милдью', { exact: true }).first()).toBeVisible()
  await expect(page.getByText(/Фото поставлено в очередь/)).toBeVisible()
  await expect(page.getByText(/В очереди 1 проверка без сети/)).toBeVisible()
  // Без сети на сервер ничего не ушло
  expect(api.diagnoses).toEqual([])

  await context.setOffline(false)

  await expect(
    page.getByText('Проверка из очереди сохранена в историю.'),
  ).toBeVisible()
  expect(api.diagnoses).toEqual([expect.objectContaining({ save: 'true' })])
  // В истории — проверка, сделанная без сети
  await page
    .getByRole('navigation', { name: 'Основная навигация' })
    .first()
    .getByRole('link', { name: 'История' })
    .click()
  await expect(page.getByRole('heading', { name: 'Милдью' })).toBeVisible()
})
