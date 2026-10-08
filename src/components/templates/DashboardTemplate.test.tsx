import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DashboardTemplate } from './DashboardTemplate'

describe('DashboardTemplate', () => {
  it('собирает шапку, навигацию, содержимое и подвал', () => {
    render(
      <DashboardTemplate navItems={[{ label: 'Участки', href: '/vineyards' }]}>
        Содержимое страницы
      </DashboardTemplate>,
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveTextContent('Содержимое страницы')
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('даёт ссылку для перехода к основному содержимому', () => {
    render(<DashboardTemplate navItems={[]}>Текст</DashboardTemplate>)

    expect(
      screen.getByRole('link', { name: 'Перейти к содержимому' }),
    ).toHaveAttribute('href', '#content')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'content')
  })
})
