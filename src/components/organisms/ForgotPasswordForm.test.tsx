import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/client'
import { ForgotPasswordForm } from './ForgotPasswordForm'

async function fillAndSubmit(email: string) {
  const user = userEvent.setup()
  if (email) await user.type(screen.getByLabelText(/Email/), email)
  await user.click(screen.getByRole('button', { name: 'Отправить ссылку' }))
}

describe('ForgotPasswordForm', () => {
  it('без email не отправляется', async () => {
    const onSubmit = vi.fn()
    render(<ForgotPasswordForm onSubmit={onSubmit} />)

    await fillAndSubmit('')

    expect(await screen.findByText('Введите email')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('отправляет email', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<ForgotPasswordForm onSubmit={onSubmit} />)

    await fillAndSubmit('grower@example.md')

    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ email: 'grower@example.md' })
  })

  it.each([
    [new ApiError('Слишком много запросов', 429), 'Слишком много запросов'],
    [new Error('boom'), 'Не удалось отправить письмо'],
  ])('показывает ошибку: %s', async (error, message) => {
    render(<ForgotPasswordForm onSubmit={vi.fn().mockRejectedValue(error)} />)

    await fillAndSubmit('grower@example.md')

    expect(await screen.findByRole('alert')).toHaveTextContent(message)
  })
})
