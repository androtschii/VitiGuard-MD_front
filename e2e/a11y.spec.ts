import { AxeBuilder } from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { mockApi } from './api.ts'

// Автоматическая проверка доступности по WCAG 2.1 A и AA (pr-094): контраст,
// подписи полей и кнопок, роли, порядок заголовков, язык страницы. Ловит около
// половины нарушений; остальное (смысл подписей, порядок фокуса) проверяется
// руками и тестами компонентов
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

// Страница и заголовок, по которому видно, что она отрисовалась
const PAGES: [string, string][] = [
  ['/', 'Обзор хозяйства'],
  ['/diagnosis', 'Диагностика по фото листа'],
  ['/history', 'История проверок'],
  ['/regions', 'Статистика по районам'],
  ['/tips', 'Подсказки для работы в поле'],
  ['/profile', 'Профиль'],
  ['/alerts', 'Предупреждения'],
  ['/map', 'Карта виноградников'],
  ['/compare', 'Сравнение участков'],
]

// Страницы без входа: сервер на любой запрос отвечает 401
const PUBLIC_PAGES: [string, string][] = [
  ['/login', 'Вход'],
  ['/register', 'Регистрация'],
]

async function audit(page: Page) {
  // Контраст считается по итоговому виду, а не посреди проявления элемента
  await page.evaluate(() =>
    Promise.allSettled(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.effect?.getComputedTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished),
    ),
  )
  const result = await new AxeBuilder({ page })
    .withTags(WCAG)
    // Холст карты MapLibre axe не разбирает: подписи и управление карты
    // проверяются отдельно
    .exclude('.maplibregl-canvas')
    .analyze()
  return result.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target.join(' ')).slice(0, 5),
  }))
}

for (const theme of ['light', 'dark'] as const) {
  test.describe(`тема ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((value) => {
        localStorage.setItem('vitiguard.theme', value)
      }, theme)
    })

    for (const [path, heading] of PAGES) {
      test(`${path} без нарушений WCAG 2.1 AA`, async ({ page }) => {
        await mockApi(page)
        await page.goto(path)
        await expect(
          page.getByRole('heading', { level: 1, name: heading }),
        ).toBeVisible()

        expect(await audit(page)).toEqual([])
      })
    }

    for (const [path, heading] of PUBLIC_PAGES) {
      test(`${path} без входа без нарушений WCAG 2.1 AA`, async ({ page }) => {
        await page.route('**/api/v1/**', (route) =>
          route.fulfill({ status: 401, json: { detail: 'Требуется вход' } }),
        )
        await page.goto(path)
        await expect(
          page.getByRole('heading', { level: 1, name: heading }),
        ).toBeVisible()

        expect(await audit(page)).toEqual([])
      })
    }
  })
}

// Проверка проверки: без неё пустой список нарушений мог бы значить, что
// аудит ничего не смотрел
test('аудит находит картинку без описания', async ({ page }) => {
  await mockApi(page)
  await page.goto('/tips')
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Подсказки для работы в поле',
    }),
  ).toBeVisible()
  await page.evaluate(() => {
    const image = document.createElement('img')
    image.src = '/favicon.png'
    document.querySelector('main')?.append(image)
  })

  const ids = (await audit(page)).map((violation) => violation.id)

  expect(ids).toContain('image-alt')
})
