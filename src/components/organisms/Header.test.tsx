import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderWithRouter } from '@/test/render'
import { useUiStore } from '@/store/ui'
import { Header } from './Header'

describe('Header', () => {
  beforeEach(() => {
    useUiStore.setState(useUiStore.getInitialState(), true)
  })

  it('содержит ссылку на главную с названием проекта', () => {
    renderWithRouter(<Header />)

    expect(screen.getByRole('link', { name: 'VitiGuard MD' })).toHaveAttribute(
      'href',
      '/',
    )
  })

  it('кнопка меню переключает боковую панель и сообщает её состояние', () => {
    renderWithRouter(<Header />)
    const button = screen.getByRole('button', { name: 'Меню' })
    expect(button).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(button)

    expect(useUiStore.getState().isSidebarOpen).toBe(true)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('показывает переданные действия', () => {
    renderWithRouter(<Header actions={<button>Выйти</button>} />)

    expect(screen.getByRole('button', { name: 'Выйти' })).toBeInTheDocument()
  })
})
