import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '@/test/render'
import { Header } from './Header'

describe('Header', () => {
  it('содержит ссылку на главную с названием проекта', () => {
    renderWithRouter(<Header />)

    expect(screen.getByRole('link', { name: 'VitiGuard MD' })).toHaveAttribute(
      'href',
      '/',
    )
  })

  it('показывает переданные действия', () => {
    renderWithRouter(<Header actions={<button>Выйти</button>} />)

    expect(screen.getByRole('button', { name: 'Выйти' })).toBeInTheDocument()
  })
})
