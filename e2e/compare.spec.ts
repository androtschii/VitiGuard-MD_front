import { expect, test } from '@playwright/test'
import { CRICOVA, mockApi } from './api.ts'

test('сравнение двух участков с главной', async ({ page }) => {
  await mockApi(page)
  await page.route('**/api/v1/vineyards?*', (route) =>
    route.fulfill({
      json: {
        items: [
          CRICOVA,
          { ...CRICOVA, id: 'vineyard-2', name: 'Пуркарь', area_ha: 4.2 },
        ],
        total: 2,
        page: 1,
        size: 100,
        pages: 1,
      },
    }),
  )
  await page.goto('/')

  await page.getByRole('link', { name: 'Сравнить участки' }).click()

  await expect(
    page.getByRole('heading', { name: 'Сравнение участков' }),
  ).toBeVisible()
  await expect(
    page.getByRole('columnheader', { name: 'Пуркарь' }),
  ).toBeVisible()
  await expect(page.getByText('1, подтверждённых: 0')).toBeVisible()
  await expect(
    page.getByRole('img', { name: /NDVI участков .+ \(A\) и Пуркарь \(B\)/ }),
  ).toBeVisible()
})
