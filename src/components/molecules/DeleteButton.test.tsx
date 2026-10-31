import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DeleteButton } from './DeleteButton'

describe('DeleteButton', () => {
  it('удаляет по клику', async () => {
    const onClick = vi.fn()
    render(<DeleteButton onClick={onClick}>Удалить</DeleteButton>)

    await userEvent.click(screen.getByRole('button', { name: 'Удалить' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('пока идёт удаление, кнопка занята и не нажимается', () => {
    render(<DeleteButton isLoading>Удалить</DeleteButton>)

    const button = screen.getByRole('button', { name: 'Удалить' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('можно отключить и дополнить оформление', () => {
    render(
      <DeleteButton disabled className="self-start">
        Удалить
      </DeleteButton>,
    )

    const button = screen.getByRole('button', { name: 'Удалить' })
    expect(button).toBeDisabled()
    expect(button).not.toHaveAttribute('aria-busy')
    expect(button).toHaveClass('self-start')
  })
})
