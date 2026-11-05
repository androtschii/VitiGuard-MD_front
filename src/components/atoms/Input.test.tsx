import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('передаёт атрибуты и события полю ввода', () => {
    const onChange = vi.fn()
    render(<Input type="email" placeholder="email" onChange={onChange} />)
    const input = screen.getByPlaceholderText('email')

    fireEvent.change(input, { target: { value: 'grower@example.md' } })

    expect(input).toHaveAttribute('type', 'email')
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('отдаёт ref на элемент input', () => {
    let element: HTMLInputElement | null = null
    render(
      <Input
        ref={(node) => {
          element = node
        }}
      />,
    )

    expect(element).toBeInstanceOf(HTMLInputElement)
  })

  it('у поля даты открывает календарь нажатием в любом месте поля', async () => {
    const onClick = vi.fn()
    render(<Input type="date" aria-label="С даты" onClick={onClick} />)
    const input = screen.getByLabelText<HTMLInputElement>('С даты')
    const showPicker = vi.fn()
    input.showPicker = showPicker

    await userEvent.click(input)

    expect(onClick).toHaveBeenCalledOnce()
    expect(showPicker).toHaveBeenCalledOnce()
  })

  it('календарь не открывается у текстового, неактивного и только для чтения поля', async () => {
    render(
      <>
        <Input aria-label="Имя" />
        <Input type="date" aria-label="Только чтение" readOnly />
        <Input
          type="date"
          aria-label="Свой обработчик"
          onClick={(event) => event.preventDefault()}
        />
      </>,
    )
    const showPicker = vi.fn()
    for (const name of ['Имя', 'Только чтение', 'Свой обработчик']) {
      const input = screen.getByLabelText<HTMLInputElement>(name)
      input.showPicker = showPicker
      await userEvent.click(input)
    }

    expect(showPicker).not.toHaveBeenCalled()
  })

  it('браузер без showPicker не ломает поле', async () => {
    render(<Input type="date" aria-label="С даты" />)
    const input = screen.getByLabelText<HTMLInputElement>('С даты')
    input.showPicker = () => {
      throw new DOMException('Нужен жест пользователя', 'NotAllowedError')
    }

    await userEvent.click(input)

    expect(input).toBeVisible()
  })
})
