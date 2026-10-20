import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '@/test/render'
import { DashboardTemplate } from './DashboardTemplate'

describe('DashboardTemplate', () => {
  it('собирает шапку, навигацию, содержимое и подвал', () => {
    renderWithRouter(
      <DashboardTemplate navItems={[{ label: 'Участки', href: '/vineyards' }]}>
        Содержимое страницы
      </DashboardTemplate>,
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
    // Боковая колонка и нижняя панель телефона: видна одна, по ширине экрана
    expect(screen.getAllByRole('navigation')).toHaveLength(2)
    expect(screen.getByRole('main')).toHaveTextContent('Содержимое страницы')
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('для печати прячет навигацию и подписывает страницу датой', () => {
    renderWithRouter(<DashboardTemplate navItems={[]}>Текст</DashboardTemplate>)

    const header = screen.getByText(/^VitiGuard MD · напечатано \d+ \S+ \d{4}/)
    expect(header).toHaveClass('hidden', 'print:block')
    expect(screen.getByRole('banner').closest('.print\\:hidden')).not.toBeNull()
    expect(
      screen.getByRole('contentinfo').closest('.print\\:hidden'),
    ).not.toBeNull()
  })

  it('даёт ссылку для перехода к основному содержимому', () => {
    renderWithRouter(<DashboardTemplate navItems={[]}>Текст</DashboardTemplate>)

    expect(
      screen.getByRole('link', { name: 'Перейти к содержимому' }),
    ).toHaveAttribute('href', '#content')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'content')
  })
})
