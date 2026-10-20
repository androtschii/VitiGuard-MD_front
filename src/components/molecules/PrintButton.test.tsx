import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PrintButton } from './PrintButton'

describe('PrintButton', () => {
  it('открывает печать и сама на бумагу не попадает', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<PrintButton />)
    const button = screen.getByRole('button', { name: 'Распечатать' })

    await userEvent.click(button)

    expect(print).toHaveBeenCalledOnce()
    expect(button).toHaveClass('print:hidden')
  })
})
