import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('отмечает текущую страницу', () => {
    render(<Pagination page={3} pageCount={5} onPageChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Страница 3' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(
      screen.getByRole('button', { name: 'Страница 2' }),
    ).not.toHaveAttribute('aria-current')
  })

  it('переходит на выбранную, предыдущую и следующую страницы', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={3} pageCount={5} onPageChange={onPageChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Страница 5' }))
    fireEvent.click(screen.getByRole('button', { name: 'Назад' }))
    fireEvent.click(screen.getByRole('button', { name: 'Вперёд' }))

    expect(onPageChange.mock.calls).toEqual([[5], [2], [4]])
  })

  it('на краях блокирует «Назад» и «Вперёд»', () => {
    const { rerender } = render(
      <Pagination page={1} pageCount={3} onPageChange={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: 'Назад' })).toBeDisabled()

    rerender(<Pagination page={3} pageCount={3} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Вперёд' })).toBeDisabled()
  })

  it('с одной страницей ничего не показывает', () => {
    const { container } = render(
      <Pagination page={1} pageCount={1} onPageChange={vi.fn()} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('пропуски в длинном списке страниц скрыты от дикторов', () => {
    const { container } = render(
      <Pagination page={5} pageCount={10} onPageChange={vi.fn()} />,
    )

    const gaps = container.querySelectorAll('span[aria-hidden="true"]')
    expect(gaps).toHaveLength(2)
    expect(gaps[0]).toHaveTextContent('…')
  })
})
