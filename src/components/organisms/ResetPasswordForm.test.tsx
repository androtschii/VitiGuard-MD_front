import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/client'
import { ResetPasswordForm } from './ResetPasswordForm'

async function fillAndSubmit(password: string, confirmPassword: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(/Новый пароль/), password)
  await user.type(screen.getByLabelText(/Повторите пароль/), confirmPassword)
  await user.click(screen.getByRole('button', { name: 'Сохранить пароль' }))
}

describe('ResetPasswordForm', () => {
  it('поле подсказывает менеджеру паролей, что пароль новый', () => {
    render(<ResetPasswordForm onSubmit={vi.fn()} />)

    expect(screen.getByLabelText(/Новый пароль/)).toHaveAttribute(
      'autocomplete',
      'new-password',
    )
  })

  it('несовпадающие пароли не отправляются', async () => {
    const onSubmit = vi.fn()
    render(<ResetPasswordForm onSubmit={onSubmit} />)

    await fillAndSubmit('secret123', 'secret124')

    expect(await screen.findByText('Пароли не совпадают')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('отправляет новый пароль', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<ResetPasswordForm onSubmit={onSubmit} />)

    await fillAndSubmit('secret123', 'secret123')

    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ password: 'secret123' })
  })

  it.each([
    [new ApiError('Ссылка устарела', 400), 'Ссылка устарела'],
    [new Error('boom'), 'Не удалось изменить пароль'],
  ])('показывает ошибку: %s', async (error, message) => {
    render(<ResetPasswordForm onSubmit={vi.fn().mockRejectedValue(error)} />)

    await fillAndSubmit('secret123', 'secret123')

    expect(await screen.findByRole('alert')).toHaveTextContent(message)
  })
})
