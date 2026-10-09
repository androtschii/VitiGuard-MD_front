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
      screen.getByRole('heading', { name: 'VitiGuard MD' }),
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

  it('карта загружается отдельно и открывается вошедшему', async () => {
    useSessionStore.getState().setAccessToken('token')
    const router = createMemoryRouter(routes, { initialEntries: ['/map'] })
    renderWithQueryClient(<RouterProvider router={router} />)

    expect(
      await screen.findByRole('heading', { name: 'Карта виноградников' }),
    ).toBeInTheDocument()
  })
})
