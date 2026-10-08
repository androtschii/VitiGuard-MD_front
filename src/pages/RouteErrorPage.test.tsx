import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RouteErrorPage } from './RouteErrorPage'

describe('RouteErrorPage', () => {
  it('показывает экран ошибки с кнопкой обновления', () => {
    render(<RouteErrorPage />)

    expect(
      screen.getByRole('button', { name: 'Обновить страницу' }),
    ).toBeInTheDocument()
  })
})
