import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SlidingChoice } from './SlidingChoice'

const options = [
  { value: 'a', label: 'Первый', content: 'A' },
  { value: 'b', label: 'Второй', content: 'B', lang: 'ro' },
]

describe('SlidingChoice', () => {
  it('отмечает текущий вариант и везёт к нему подсветку', () => {
    render(
      <SlidingChoice
        label="Выбор"
        value="b"
        options={options}
        onChange={() => {}}
      />,
    )

    expect(screen.getByRole('radiogroup', { name: 'Выбор' })).toBeVisible()
    expect(screen.getByRole('radio', { name: 'Второй' })).toBeChecked()
    expect(screen.getByTestId('sliding-pill').style.transform).toBe(
      'translateX(100%)',
    )
    expect(screen.getByTitle('Второй')).toHaveAttribute('lang', 'ro')
  })

  it('меняет выбор кликом и стрелками', async () => {
    const onChange = vi.fn()
    render(
      <SlidingChoice
        label="Выбор"
        value="a"
        options={options}
        onChange={onChange}
      />,
    )

    await userEvent.click(screen.getByText('B'))
    expect(onChange).toHaveBeenCalledWith('b')

    onChange.mockClear()
    screen.getByRole('radio', { name: 'Первый' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('без совпадения подсветку не показывает', () => {
    render(
      <SlidingChoice
        label="Выбор"
        value="z"
        options={options}
        onChange={() => {}}
      />,
    )

    expect(screen.queryByTestId('sliding-pill')).toBeNull()
  })
})
