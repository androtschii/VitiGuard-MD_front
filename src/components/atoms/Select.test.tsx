import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Select } from './Select'

describe('Select', () => {
  it('выбирает вариант и сообщает о смене', () => {
    const onChange = vi.fn()
    render(
      <Select aria-label="Сорт" defaultValue="" onChange={onChange}>
        <option value="">Не выбран</option>
        <option value="feteasca">Фетяска</option>
      </Select>,
    )
    const select = screen.getByRole('combobox', { name: 'Сорт' })

    fireEvent.change(select, { target: { value: 'feteasca' } })

    expect(select).toHaveValue('feteasca')
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('стрелка скрыта от дикторов', () => {
    const { container } = render(
      <Select aria-label="Сорт">
        <option>Фетяска</option>
      </Select>,
    )

    expect(container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })
})
