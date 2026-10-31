import { expect, test } from '@playwright/test'
import { mockApi } from './api.ts'

// Первый день в приложении (pr-095): регистрация, вход и первый участок на
// карте — путь, без которого остальное приложение не нужно
test('от регистрации до нарисованного участка', async ({ page }) => {
  const api = await mockApi(page, { guest: true, empty: true })

  // Гостя с главной уводит на вход, оттуда — на регистрацию
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible()
  await page.getByRole('link', { name: 'Зарегистрироваться' }).click()

  await page.getByLabel('Имя').fill('Ион Попеску')
  await page.getByLabel('Email').fill('ion@example.md')
  await page
    .getByRole('textbox', { name: 'Пароль', exact: true })
    .fill('vinograd2026')
  await page.getByLabel('Повторите пароль').fill('vinograd2026')
  await page
    .getByRole('combobox', { name: 'Роль', exact: true })
    .selectOption({ label: 'Виноградарь' })
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click()

  await expect(page.getByText(/Аккаунт создан/)).toBeVisible()
  expect(api.registered).toEqual([
    {
      full_name: 'Ион Попеску',
      email: 'ion@example.md',
      password: 'vinograd2026',
      role: 'user',
    },
  ])

  await page.getByLabel('Email').fill('ion@example.md')
  await page.getByLabel('Пароль').fill('vinograd2026')
  await page.getByRole('button', { name: 'Войти' }).click()
  await expect(
    page.getByRole('heading', { name: 'Обзор хозяйства' }),
  ).toBeVisible()
  expect(api.logins).toEqual([
    { email: 'ion@example.md', password: 'vinograd2026' },
  ])

  await page
    .getByRole('navigation', { name: 'Основная навигация' })
    .first()
    .getByRole('link', { name: 'Карта' })
    .click()
  const draw = page.getByRole('button', { name: 'Нарисовать участок' })
  await expect(draw).toBeVisible()
  const box = await page.locator('canvas.maplibregl-canvas').boundingBox()
  if (!box) throw new Error('нет карты')
  const at = (x: number, y: number) =>
    [box.x + box.width * x, box.y + box.height * y] as const

  await draw.click()
  for (const [x, y] of [at(0.55, 0.3), at(0.75, 0.3), at(0.75, 0.6)]) {
    await page.mouse.click(x, y)
  }
  // Контур замыкается щелчком в первую точку
  await page.mouse.click(...at(0.55, 0.3))

  const form = page.getByRole('form', { name: 'Новый участок' })
  await form.getByLabel('Название участка').fill('Первый участок')
  await form.getByRole('button', { name: 'Сохранить участок' }).click()

  await expect(
    page.getByText('Участок «Первый участок» сохранён'),
  ).toBeVisible()
  const [created] = api.created as {
    name: string
    geometry: { type: string; coordinates: number[][][][] }
  }[]
  expect(created?.name).toBe('Первый участок')
  expect(created?.geometry.type).toBe('MultiPolygon')
  // Треугольник: три вершины и замыкающая точка
  expect(created?.geometry.coordinates[0]?.[0]).toHaveLength(4)
})
