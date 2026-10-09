import { screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { renderWithQueryClient } from '@/test/render'
import { MapPage } from './MapPage'

describe('MapPage', () => {
  it('показывает карту в кабинете и отмечает раздел в навигации', () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/map']}>
        <MapPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Карта виноградников' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Карта' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Главная' })).not.toHaveAttribute(
      'aria-current',
    )
    expect(screen.getByRole('button', { name: 'Выйти' })).toBeInTheDocument()
  })
})
