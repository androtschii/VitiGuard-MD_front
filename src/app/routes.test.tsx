import { screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { useSessionStore } from '@/store/session'
import { renderWithQueryClient } from '@/test/render'
import { routes } from './routes'

describe('routes', () => {
  it('на главном адресе вошедшему показывает главную страницу', () => {
    useSessionStore.getState().setAccessToken('token')
    const router = createMemoryRouter(routes, { initialEntries: ['/'] })
    renderWithQueryClient(<RouterProvider router={router} />)

    expect(
      screen.getByRole('heading', { name: 'Обзор хозяйства' }),
    ).toBeInTheDocument()
  })

  it('на неизвестном адресе показывает страницу 404', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/nowhere'] })
    renderWithQueryClient(<RouterProvider router={router} />)

    expect(
      screen.getByRole('heading', { name: 'Страница не найдена' }),
    ).toBeInTheDocument()
  })

  it('ошибка страницы не оставляет пустой экран', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const Broken = () => {
      throw new Error('сбой страницы')
    }
    const router = createMemoryRouter(
      [
        {
          errorElement: routes[0]?.errorElement,
          children: [{ path: '/', element: <Broken /> }],
        },
      ],
      { initialEntries: ['/'] },
    )
    renderWithQueryClient(<RouterProvider router={router} />)

    expect(
      screen.getByRole('heading', { name: 'Что-то пошло не так' }),
    ).toBeInTheDocument()
  })

  it('страницы, кроме главной и ошибок, загружаются при открытии', async () => {
    const lazy = routes[0]?.children?.flatMap((route) =>
      route.children ? route.children : [route],
    )
    expect(
      lazy?.filter((route) => route.lazy).map((route) => route.path),
    ).toEqual([
      '/map',
      '/diagnosis',
      '/history',
      '/regions',
      '/compare',
      '/alerts',
      '/profile',
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
    ])

    const router = createMemoryRouter(routes, { initialEntries: ['/login'] })
    renderWithQueryClient(<RouterProvider router={router} />)

    expect(
      await screen.findByRole('heading', { name: 'Вход' }, { timeout: 5000 }),
    ).toBeInTheDocument()
  })

  it('карта загружается отдельно и открывается вошедшему', async () => {
    useSessionStore.getState().setAccessToken('token')
    const router = createMemoryRouter(routes, { initialEntries: ['/map'] })
    renderWithQueryClient(<RouterProvider router={router} />)

    // Первый импорт страницы карты под нагрузкой покрытия бывает дольше секунды,
    // которую findBy ждёт по умолчанию
    expect(
      await screen.findByRole(
        'heading',
        { name: 'Карта виноградников' },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument()
  })
})
