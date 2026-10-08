import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '@/test/render'
import { NotFoundPage } from './NotFoundPage'

describe('NotFoundPage', () => {
  it('сообщает об отсутствии страницы и ведёт на главную', () => {
    renderWithRouter(<NotFoundPage />, '/nowhere')

    expect(
      screen.getByRole('heading', { name: 'Страница не найдена' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'На главную' })).toHaveAttribute(
      'href',
      '/',
    )
  })
})
