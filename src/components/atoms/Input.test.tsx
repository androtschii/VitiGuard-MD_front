import { fireEvent, render, screen } from '@testing-library/react'
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
})
