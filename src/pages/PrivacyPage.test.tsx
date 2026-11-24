import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { renderWithQueryClient } from '@/test/render'
import { routes } from '@/test/routes'

function renderPrivacy(initialEntries = ['/privacy']) {
  const router = createMemoryRouter(routes, { initialEntries })
  renderWithQueryClient(<RouterProvider router={router} />)
  return { router, user: userEvent.setup() }
}

describe('PrivacyPage', () => {
  it('отображает заголовок, ссылку на Закон 195/2024 и все 7 разделов', () => {
    renderPrivacy()

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Политика конфиденциальности',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'В соответствии с Законом Республики Молдова № 195/2024 о защите персональных данных',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { name: '1. Кто обрабатывает данные' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '2. Какие данные обрабатываются' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '3. Зачем обрабатываются данные' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '4. Кто имеет доступ к данным' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '5. Сколько хранятся данные' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: '6. Права пользователя по Закону № 195/2024',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '7. Дата обновления' }),
    ).toBeInTheDocument()
    expect(screen.getByText('23.11.2026')).toBeInTheDocument()
  })

  it('содержит ссылку «Назад», которая возвращает пользователя', async () => {
    const { router, user } = renderPrivacy(['/login', '/privacy'])

    const backLink = screen.getByRole('link', { name: /Назад/ })
    expect(backLink).toBeInTheDocument()

    await user.click(backLink)
    expect(router.state.location.pathname).toBe('/login')
  })
})
