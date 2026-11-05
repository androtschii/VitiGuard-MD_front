import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('показывает заголовок, пояснение и следующий шаг', () => {
    const { container } = render(
      <EmptyState
        icon="leaf"
        title="Проверок пока нет"
        hint="Проверьте лист по фото"
        action={<a href="/diagnosis">Проверить лист</a>}
      />,
    )

    expect(screen.getByText('Проверок пока нет')).toBeVisible()
    expect(screen.getByText('Проверьте лист по фото')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Проверить лист' })).toBeVisible()
    // Значок — украшение, диктор его не читает
    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('без пояснения и действия — только заголовок', () => {
    render(<EmptyState icon="search" title="Ничего не найдено" />)

    expect(screen.getByText('Ничего не найдено')).toBeVisible()
    expect(screen.queryByRole('link')).toBeNull()
  })
})
