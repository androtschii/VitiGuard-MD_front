import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/client'
import { LoginForm } from './LoginForm'

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup()
  if (email) await user.type(screen.getByLabelText(/Email/), email)
  if (password) await user.type(screen.getByLabelText(/Пароль/), password)
  await user.click(screen.getByRole('button', { name: 'Войти' }))
}

describe('LoginForm', () => {
  it('у полей подходящие типы и подсказки для менеджера паролей', () => {
    render(<LoginForm onSubmit={vi.fn()} />)
    const email = screen.getByLabelText(/Email/)
    const password = screen.getByLabelText(/Пароль/)

    expect(email).toHaveAttribute('type', 'email')
    expect(email).toHaveAttribute('autocomplete', 'email')
    expect(password).toHaveAttribute('type', 'password')
    expect(password).toHaveAttribute('autocomplete', 'current-password')
  })

  it('пустая форма не отправляется и показывает ошибки у полей', async () => {
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} />)

    await fillAndSubmit('', '')

    expect(await screen.findByText('Введите email')).toBeInTheDocument()
    expect(screen.getByText('Введите пароль')).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/)).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('неверный email не отправляется', async () => {
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} />)

    await fillAndSubmit('grower', 'secret')

    expect(
      await screen.findByText('Введите корректный email'),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('отправляет введённые значения', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<LoginForm onSubmit={onSubmit} />)

    await fillAndSubmit('grower@example.md', 'secret')

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      email: 'grower@example.md',
      password: 'secret',
    })
  })

  it('пока идёт отправка, кнопка заблокирована', async () => {
    let finish: () => void = () => undefined
    const onSubmit = vi.fn(
      () => new Promise<void>((resolve) => (finish = resolve)),
    )
    render(<LoginForm onSubmit={onSubmit} />)

    await fillAndSubmit('grower@example.md', 'secret')

    expect(screen.getByRole('button', { name: 'Войти' })).toBeDisabled()
    finish()
    expect(await screen.findByRole('button', { name: 'Войти' })).toBeEnabled()
  })

  it('показывает текст ошибки сервера', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new ApiError('Неверный email или пароль', 401))
    render(<LoginForm onSubmit={onSubmit} />)

    await fillAndSubmit('grower@example.md', 'wrong')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Неверный email или пароль',
    )
  })

  it('при неизвестной ошибке показывает общий текст', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('boom'))
    render(<LoginForm onSubmit={onSubmit} />)

    await fillAndSubmit('grower@example.md', 'secret')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось войти',
    )
  })
})
