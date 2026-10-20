import { expect, test } from '@playwright/test'
import { mockApi, PNG } from './api.ts'

test('фото листа: анализ, наложения и сохранение в историю', async ({
  page,
}) => {
  const api = await mockApi(page)
  await page.goto('/diagnosis')

  await page.getByLabel('Выбрать фото листа').setInputFiles({
    name: 'leaf.png',
    mimeType: 'image/png',
    buffer: PNG,
  })
  await expect(
    page.getByRole('img', { name: /Предпросмотр|фото/i }).first(),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Определить болезнь' }).click()

  await expect(page.getByText('Диагноз', { exact: true })).toBeVisible()
  await expect(page.getByText('Милдью', { exact: true }).first()).toBeVisible()
  await expect(
    page.getByText(/Уверенность модели: 91\s%/).first(),
  ).toBeVisible()
  expect(api.diagnoses).toEqual([{ save: 'true', top_k: '6' }])

  // Наложения: тепловая карта по умолчанию, маска — с долей поражения
  await page.getByText('Поражение', { exact: true }).click()
  await expect(
    page.getByText(/Поражено около 18\s% площади листа/),
  ).toBeVisible()
})
