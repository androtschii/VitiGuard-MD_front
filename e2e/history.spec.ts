import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { mockApi } from './api.ts'

test('карточка проверки скачивается в PDF', async ({ page }) => {
  await mockApi(page)
  await page.goto('/history')
  await expect(page.getByRole('heading', { name: 'Милдью' })).toBeVisible()

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page
      .getByRole('button', { name: 'Скачать карточку проверки в PDF' })
      .click(),
  ])

  expect(download.suggestedFilename()).toBe(
    'vitiguard-diagnosis-2026-06-10-3f1c9a0b.pdf',
  )
  const pdf = await readFile(await download.path())
  const text = pdf.toString('latin1')
  expect(text.startsWith('%PDF-1.4')).toBe(true)
  expect(text).toContain('/MediaBox [0 0 595 842]')
  expect(text).toContain('/Width 1240 /Height 1754')
  // Нарисованная страница — JPEG в десятки килобайт, а не пустой холст
  expect(pdf.length).toBeGreaterThan(20_000)
  await expect(page.getByRole('alert')).toHaveCount(0)
})
