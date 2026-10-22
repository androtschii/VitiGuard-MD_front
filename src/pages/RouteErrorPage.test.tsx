import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import * as monitoring from '@/lib/monitoring'
import { RouteErrorPage } from './RouteErrorPage'

function Broken(): never {
  throw new Error('Страница сломалась')
}

describe('RouteErrorPage', () => {
  it('показывает экран ошибки и отправляет ошибку в мониторинг', async () => {
    const report = vi.spyOn(monitoring, 'reportError')
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const router = createMemoryRouter([
      { path: '/', element: <Broken />, errorElement: <RouteErrorPage /> },
    ])

    render(<RouterProvider router={router} />)

    expect(
      await screen.findByRole('button', { name: 'Обновить страницу' }),
    ).toBeInTheDocument()
    expect(report).toHaveBeenCalledWith(new Error('Страница сломалась'))
  })
})
