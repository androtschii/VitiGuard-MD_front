import { expect, test } from '@playwright/test'

// Проверка PWA на сборке (pr-082). В Lighthouse 12 категории PWA больше нет,
// поэтому её критерии проверяются здесь: устанавливаемость — тем же методом
// Chrome, что показывает кнопку «Установить», работа без сети — перезагрузкой
// без подключения

test('приложение можно установить', async ({ page }) => {
  await page.goto('/login')
  await page.evaluate(() => navigator.serviceWorker.ready)

  const cdp = await page.context().newCDPSession(page)
  const { installabilityErrors } = await cdp.send(
    'Page.getInstallabilityErrors',
  )
  const manifest = (await (
    await page.request.get('/manifest.webmanifest')
  ).json()) as { icons: { src: string }[] }

  expect(installabilityErrors).toEqual([])
  expect(manifest).toMatchObject({
    name: 'VitiGuard MD',
    short_name: 'VitiGuard',
    start_url: '/',
    display: 'standalone',
  })
  for (const icon of manifest.icons) {
    const response = await page.request.get(icon.src)
    expect(response.headers()['content-type']).toBe('image/png')
  }
})

test('после первого визита открывается без сети', async ({ page, context }) => {
  await page.goto('/login')
  await page.evaluate(() => navigator.serviceWorker.ready)

  await context.setOffline(true)
  await page.reload()

  await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible()
})

test('страница входа гостя не пишет ошибок в консоль', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible()
  await page.evaluate(() => navigator.serviceWorker.ready)

  expect(errors).toEqual([])
})

test('robots.txt — правила для поисковиков, а не страница приложения', async ({
  request,
}) => {
  const response = await request.get('/robots.txt')

  expect(response.headers()['content-type']).toContain('text/plain')
  expect(await response.text()).toContain('Disallow: /')
})
