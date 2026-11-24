import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '@/test/render'
import { routes } from '@/test/routes'

afterEach(() => {
  vi.unstubAllEnvs()
})

function renderWelcome() {
  const router = createMemoryRouter(routes, { initialEntries: ['/welcome'] })
  renderWithQueryClient(<RouterProvider router={router} />)
  return { router, user: userEvent.setup() }
}

describe('WelcomePage', () => {
  it('рендерит заголовок, описание и 4 возможности', () => {
    renderWelcome()

    expect(
      screen.getByRole('heading', {
        name: 'Мониторинг здоровья виноградников Молдовы',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /VitiGuard MD — цифровая система мониторинга здоровья виноградников Молдовы/,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Диагностика болезни по фото листа/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Предупреждения о риске милдью и оидиума по погоде/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Участки на карте и спутниковый индекс NDVI/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Telegram-бот и работа без сети/),
    ).toBeInTheDocument()
  })

  it('содержит ссылки на вход, регистрацию и политику конфиденциальности', async () => {
    const { router, user } = renderWelcome()

    const loginLink = screen.getByRole('link', { name: 'Войти' })
    const registerLink = screen.getByRole('link', {
      name: 'Зарегистрироваться',
    })
    const privacyLink = screen.getByRole('link', {
      name: 'Политика конфиденциальности',
    })

    expect(loginLink).toHaveAttribute('href', '/login')
    expect(registerLink).toHaveAttribute('href', '/register')
    expect(privacyLink).toHaveAttribute('href', '/privacy')

    await user.click(loginLink)
    expect(router.state.location.pathname).toBe('/login')
  })

  it('показывает блок демо-входа, когда он включён', () => {
    // Флаг задаётся при сборке стенда; в CI его нет, поэтому задаётся здесь
    vi.stubEnv('VITE_DEMO_LOGIN', 'true')
    renderWelcome()

    expect(
      screen.getByRole('heading', { name: 'Демо-аккаунты' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Виноградарь' }),
    ).toBeInTheDocument()
  })

  it('без демо-входа блока нет', () => {
    vi.stubEnv('VITE_DEMO_LOGIN', 'false')
    renderWelcome()

    expect(
      screen.queryByRole('heading', { name: 'Демо-аккаунты' }),
    ).not.toBeInTheDocument()
  })
})
