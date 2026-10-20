import { readFile } from 'node:fs/promises'
import { expect, test, type Page } from '@playwright/test'
import { CRICOVA, mockApi } from './api.ts'

async function openMap(page: Page) {
  const api = await mockApi(page)
  await page.goto('/map')
  await expect(
    page.getByRole('heading', { name: 'Карта виноградников' }),
  ).toBeVisible()
  // Стиль загружен и инструменты подключены — карта готова к работе
  await expect(
    page.getByRole('button', { name: 'Нарисовать участок' }),
  ).toBeVisible()
  return api
}

function canvas(page: Page) {
  return page.locator('canvas.maplibregl-canvas')
}

test('карта рисуется через WebGL с участками пользователя', async ({
  page,
}) => {
  await openMap(page)

  await expect(canvas(page)).toBeVisible()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByLabel('Карта виноградников Молдовы')).toBeVisible()
})

test('выбранная подложка сохраняется после перезагрузки', async ({ page }) => {
  await openMap(page)

  await page.getByText('Спутник', { exact: true }).click()
  await expect(page.getByRole('radio', { name: 'Спутник' })).toBeChecked()
  await page.reload()

  await expect(page.getByRole('radio', { name: 'Спутник' })).toBeChecked()
})

test('поиск открывает карточку участка', async ({ page }) => {
  await openMap(page)
  const search = page.getByRole('combobox', {
    name: 'Поиск участка или координат',
  })

  await search.fill('криково')
  await page.getByRole('option', { name: /Криково, северный склон/ }).click()

  const card = page.locator('.maplibregl-popup')
  await expect(card.getByText(CRICOVA.name)).toBeVisible()
  await expect(card.getByText('Район: Chișinău')).toBeVisible()
})

test('рисование контура и сохранение участка', async ({ page }) => {
  const api = await openMap(page)
  const box = await canvas(page).boundingBox()
  if (!box) throw new Error('нет карты')
  const at = (x: number, y: number) => ({
    x: box.x + box.width * x,
    y: box.y + box.height * y,
  })

  await page.getByRole('button', { name: 'Нарисовать участок' }).click()
  for (const point of [
    at(0.6, 0.3),
    at(0.8, 0.3),
    at(0.8, 0.6),
    at(0.6, 0.6),
  ]) {
    await page.mouse.click(point.x, point.y)
  }
  await page.mouse.click(at(0.6, 0.3).x, at(0.6, 0.3).y)

  const form = page.getByRole('form', { name: 'Новый участок' })
  await expect(form).toBeVisible()
  await form.getByLabel('Название участка').fill('Новый склон')
  await form.getByRole('button', { name: 'Сохранить участок' }).click()

  await expect(page.getByText('Участок «Новый склон» сохранён')).toBeVisible()
  const [body] = api.created as { name: string; geometry: { type: string } }[]
  expect(body.name).toBe('Новый склон')
  expect(body.geometry.type).toBe('MultiPolygon')
})

test('измерение расстояния по двум точкам', async ({ page }) => {
  await openMap(page)
  const box = await canvas(page).boundingBox()
  if (!box) throw new Error('нет карты')

  await page
    .getByRole('button', { name: 'Измерить расстояние и площадь' })
    .click()
  await page.mouse.click(box.x + box.width * 0.55, box.y + box.height * 0.5)
  await page.mouse.click(box.x + box.width * 0.85, box.y + box.height * 0.5)

  await expect(page.getByText(/^Расстояние: [\d,\s]+ (м|км)$/)).toBeVisible()
})

test('картограмма NDVI: шкала, прозрачность и даты снимков', async ({
  page,
}) => {
  const api = await openMap(page)

  await page.getByText('Фильтры и слои').click()
  await page.getByRole('checkbox', { name: 'Картограмма NDVI' }).check()

  await expect(page.getByText('1 · густая листва')).toBeVisible()
  await expect
    .poll(() => api.ndviImages)
    .toEqual(['/vineyards/vineyard-1/vegetation/aug/ndvi.png'])
  await page.getByRole('slider', { name: /Прозрачность/ }).fill('40')
  await expect(page.getByText('40 %')).toBeVisible()

  const dates = page.getByRole('slider', { name: /Дата снимка/ })
  await expect(
    page.getByText('последний снимок', { exact: true }),
  ).toBeVisible()
  await dates.fill('0')
  await expect(dates).toHaveAttribute('aria-valuetext', '25 июн. 2026 г.')
  await expect
    .poll(() => api.ndviImages)
    .toContain('/vineyards/vineyard-1/vegetation/june/ndvi.png')
})

test('карта сохраняется в PNG и PDF', async ({ page }) => {
  await openMap(page)

  const [png] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Сохранить карту в PNG' }).click(),
  ])
  expect(png.suggestedFilename()).toMatch(
    /^vitiguard-map-\d{4}-\d{2}-\d{2}\.png$/,
  )
  const pngBytes = await readFile(await png.path())
  expect(pngBytes.subarray(1, 4).toString()).toBe('PNG')

  const [pdf] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Сохранить карту в PDF' }).click(),
  ])
  expect(pdf.suggestedFilename()).toMatch(/\.pdf$/)
  const pdfBytes = await readFile(await pdf.path())
  expect(pdfBytes.subarray(0, 8).toString()).toBe('%PDF-1.4')
  expect(pdfBytes.toString('latin1')).toContain('/Filter /DCTDecode')
})
