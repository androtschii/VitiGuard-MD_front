import { screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { renderWithQueryClient } from '@/test/render'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('в баннере основная кнопка — «Проверить лист», остальные второстепенные, печать внизу', () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>,
    )

    // Заголовок
    expect(
      screen.getByRole('heading', { name: 'Обзор хозяйства' }),
    ).toBeInTheDocument()

    // Основная кнопка в баннере ведёт на диагностику
    const checkLeaf = screen.getByRole('link', { name: 'Проверить лист' })
    expect(checkLeaf).toHaveAttribute('href', '/diagnosis')
    // Класс primary: белый фон, тёмный текст
    expect(checkLeaf).toHaveClass('bg-white', 'text-brand-900')

    // Второстепенные кнопки баннера: рамка
    const mapLink = screen.getByRole('link', { name: 'Открыть карту' })
    expect(mapLink).toHaveAttribute('href', '/map')
    expect(mapLink).toHaveClass('border', 'text-white')

    const regionsLink = screen.getByRole('link', { name: 'Статистика районов' })
    expect(regionsLink).toHaveAttribute('href', '/regions')
    expect(regionsLink).toHaveClass('border', 'text-white')

    const compareLink = screen.getByRole('link', { name: 'Сравнить участки' })
    expect(compareLink).toHaveAttribute('href', '/compare')
    expect(compareLink).toHaveClass('border', 'text-white')

    const tipsLink = screen.getByRole('link', { name: 'Подсказки для поля' })
    expect(tipsLink).toHaveAttribute('href', '/tips')
    expect(tipsLink).toHaveClass('border', 'text-white')

    // Печать доступна на странице (в нижней части)
    const printButton = screen.getByRole('button', { name: 'Распечатать' })
    expect(printButton).toBeInTheDocument()
  })
})
