import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('по умолчанию не отправляет форму', () => {
    render(<Button>Сохранить</Button>)

    expect(screen.getByRole('button', { name: 'Сохранить' })).toHaveAttribute(
      'type',
      'button',
    )
  })

  it('вызывает обработчик нажатия', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Сохранить</Button>)

    fireEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('во время загрузки заблокирована и помечена как занятая', () => {
    const onClick = vi.fn()
    render(
      <Button isLoading onClick={onClick}>
        Сохранить
      </Button>,
    )
    const button = screen.getByRole('button')

    fireEvent.click(button)

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button.querySelector('svg')).toBeInTheDocument()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('className снаружи перекрывает стили варианта', () => {
    render(
      <Button variant="danger" className="bg-black">
        Удалить
      </Button>,
    )
    const button = screen.getByRole('button')

    expect(button).toHaveClass('bg-black')
    expect(button).not.toHaveClass('bg-red-700')
  })
})
