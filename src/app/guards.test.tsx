import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryRouter,
  RouterProvider,
  type RouteObject,
} from 'react-router'
import { describe, expect, it } from 'vitest'
import { LoginPage } from '@/pages/LoginPage'
import { useSessionStore } from '@/store/session'
import { renderWithQueryClient } from '@/test/render'
import { routes } from './routes'
import { GuestRoute, ProtectedRoute } from './guards'

const testRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <h1>Главная</h1> },
      { path: '/vineyards', element: <h1>Участки</h1> },
    ],
  },
  {
    element: <GuestRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
]

function renderAt(
  entry: string | { pathname: string; state: unknown },
  tree: RouteObject[] = testRoutes,
) {
  const router = createMemoryRouter(tree, { initialEntries: [entry] })
  renderWithQueryClient(<RouterProvider router={router} />)
  return { router, user: userEvent.setup() }
}

describe('ProtectedRoute', () => {
  it('гостя отправляет на вход и запоминает, куда он шёл', () => {
    const { router } = renderAt('/vineyards?sort=area')

    expect(router.state.location.pathname).toBe('/login')
    expect(router.state.location.state).toEqual({
      from: '/vineyards?sort=area',
    })
    expect(screen.queryByText('Участки')).not.toBeInTheDocument()
  })

  it('вошедшему показывает страницу', () => {
    useSessionStore.getState().setAccessToken('token')

    renderAt('/vineyards')

    expect(screen.getByRole('heading', { name: 'Участки' })).toBeInTheDocument()
  })

  it('пока сессия восстанавливается, показывает загрузку и не трогает адрес', () => {
    useSessionStore.setState(useSessionStore.getInitialState(), true)

    const { router } = renderAt('/vineyards')

    expect(screen.getByRole('status')).toHaveTextContent('Загрузка…')
    expect(router.state.location.pathname).toBe('/vineyards')
    expect(screen.queryByText('Участки')).not.toBeInTheDocument()
  })

  it('когда сессия восстановилась, вместо загрузки появляется страница', () => {
    useSessionStore.setState(useSessionStore.getInitialState(), true)
    renderAt('/vineyards')

    act(() => useSessionStore.getState().setAccessToken('token'))

    expect(screen.getByRole('heading', { name: 'Участки' })).toBeInTheDocument()
  })

  it('если сессия не восстановилась, отправляет на вход', () => {
    useSessionStore.setState(useSessionStore.getInitialState(), true)
    const { router } = renderAt('/vineyards')

    act(() => useSessionStore.getState().clear())

    expect(router.state.location.pathname).toBe('/login')
  })

  it('выход со страницы возвращает на вход', () => {
    useSessionStore.getState().setAccessToken('token')
    const { router } = renderAt('/vineyards')

    act(() => useSessionStore.getState().clear())

    expect(router.state.location.pathname).toBe('/login')
  })
})

describe('GuestRoute', () => {
  it('гостю показывает страницу входа', () => {
    renderAt('/login')

    expect(screen.getByRole('heading', { name: 'Вход' })).toBeInTheDocument()
  })

  it('вошедшего уводит на главную', () => {
    useSessionStore.getState().setAccessToken('token')

    const { router } = renderAt('/login')

    expect(router.state.location.pathname).toBe('/')
  })

  it('вошедшего возвращает на страницу, с которой его отправили на вход', () => {
    useSessionStore.getState().setAccessToken('token')

    const { router } = renderAt({
      pathname: '/login',
      state: { from: '/vineyards?sort=area' },
    })

    expect(router.state.location.pathname).toBe('/vineyards')
    expect(router.state.location.search).toBe('?sort=area')
  })

  it.each(['//evil.example', 'https://evil.example', 42, null])(
    'чужой адрес возврата %j игнорирует',
    (from) => {
      useSessionStore.getState().setAccessToken('token')

      const { router } = renderAt({ pathname: '/login', state: { from } })

      expect(router.state.location.pathname).toBe('/')
    },
  )

  it('пока сессия восстанавливается, показывает загрузку', () => {
    useSessionStore.setState(useSessionStore.getInitialState(), true)

    renderAt('/login')

    expect(screen.getByRole('status')).toHaveTextContent('Загрузка…')
  })
})

describe('вход через защищённую страницу', () => {
  it('после входа возвращает на страницу, которую открывал гость', async () => {
    const { router, user } = renderAt('/vineyards')
    expect(router.state.location.pathname).toBe('/login')

    await user.type(screen.getByLabelText(/Email/), 'grower@example.md')
    await user.type(screen.getByLabelText(/Пароль/), 'secret')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(
      await screen.findByRole('heading', { name: 'Участки' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/vineyards')
  })
})

describe('маршруты приложения', () => {
  it('главная страница закрыта для гостей', () => {
    const { router } = renderAt('/', routes)

    expect(router.state.location.pathname).toBe('/login')
  })

  it.each(['/login', '/register', '/forgot-password'])(
    'вошедший не видит страницу %s',
    (path) => {
      useSessionStore.getState().setAccessToken('token')

      const { router } = renderAt(path, routes)

      expect(router.state.location.pathname).toBe('/')
    },
  )

  it('ссылка сброса пароля открывается и гостю, и вошедшему', () => {
    useSessionStore.getState().setAccessToken('token')

    const { router } = renderAt('/reset-password?token=abc', routes)

    expect(router.state.location.pathname).toBe('/reset-password')
    expect(
      screen.getByRole('heading', { name: 'Новый пароль' }),
    ).toBeInTheDocument()
  })

  it('страница 404 открыта для всех', () => {
    renderAt('/nowhere', routes)

    expect(
      screen.getByRole('heading', { name: 'Страница не найдена' }),
    ).toBeInTheDocument()
  })

  it('кнопка «Выйти» на главной возвращает на вход', async () => {
    useSessionStore.getState().setAccessToken('token')
    const { router, user } = renderAt('/', routes)

    await user.click(screen.getByRole('button', { name: 'Выйти' }))

    expect(
      await screen.findByRole('heading', { name: 'Вход' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(useSessionStore.getState().accessToken).toBeNull()
  })
})
