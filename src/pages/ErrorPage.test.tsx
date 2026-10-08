import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorPage } from './ErrorPage'

describe('ErrorPage', () => {
  it('предлагает обновить страницу', () => {
    const onRetry = vi.fn()
    render(<ErrorPage onRetry={onRetry} />)

    fireEvent.click(screen.getByRole('button', { name: 'Обновить страницу' }))

    expect(
      screen.getByRole('heading', { name: 'Что-то пошло не так' }),
    ).toBeInTheDocument()
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
