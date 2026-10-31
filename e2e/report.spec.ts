import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { CRICOVA, mockApi } from './api.ts'
import { leafPhotoAt } from './photo.ts'

// Фото из поля до отчёта (pr-096): снимок листа на участке, диагноз с
// сохранением, проверка в истории, её карточка в PDF и отчёт по участку
test('фото листа → диагноз → история → PDF карточки и отчёт участка', async ({
  page,
}) => {
  const api = await mockApi(page)
  await page.goto('/diagnosis')

  // Снято внутри участка «Криково, северный склон»
  await page.getByLabel('Выбрать фото листа').setInputFiles({
    name: 'IMG_0612.jpg',
    mimeType: 'image/jpeg',
    buffer: leafPhotoAt(47.1415, 28.863),
  })
  await expect(page.getByText(`— на участке «${CRICOVA.name}».`)).toBeVisible()
  await page.getByRole('button', { name: 'Определить болезнь' }).click()

  await expect(page.getByText('Милдью', { exact: true }).first()).toBeVisible()
  // Участок подставлен по GPS из фото
  expect(api.diagnoses).toEqual([
    { save: 'true', top_k: '6', vineyard_id: CRICOVA.id },
  ])

  await page
    .getByRole('navigation', { name: 'Основная навигация' })
    .first()
    .getByRole('link', { name: 'История' })
    .click()
  await expect(page.getByText(CRICOVA.name).first()).toBeVisible()
  const [card] = await Promise.all([
    page.waitForEvent('download'),
    page
      .getByRole('button', { name: 'Скачать карточку проверки в PDF' })
      .click(),
  ])
  expect(card.suggestedFilename()).toMatch(
    /^vitiguard-diagnosis-\d{4}-\d{2}-\d{2}-saved-1\.pdf$/,
  )
  const pdf = await readFile(await card.path())
  expect(pdf.toString('latin1').startsWith('%PDF-')).toBe(true)

  // Отчёт о состоянии того же участка — из его карточки на карте
  await page
    .getByRole('navigation', { name: 'Основная навигация' })
    .first()
    .getByRole('link', { name: 'Карта' })
    .click()
  const search = page.getByRole('combobox', {
    name: 'Поиск участка или координат',
  })
  await search.fill('криково')
  await page.getByRole('option', { name: /Криково, северный склон/ }).click()
  const popup = page.locator('.maplibregl-popup')
  const [report] = await Promise.all([
    page.waitForEvent('download'),
    popup.getByRole('button', { name: 'PDF-отчёт' }).click(),
  ])

  expect(report.suggestedFilename()).toBe(`vitiguard-report-${CRICOVA.id}.pdf`)
  expect(api.reports).toEqual([CRICOVA.id])
})
