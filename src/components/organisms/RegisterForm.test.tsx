import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/client'
import { RegisterForm } from './RegisterForm'

async function fill(overrides: Partial<Record<string, string>> = {}) {
  const user = userEvent.setup()
  const values = {
    name: 'Андрей Бахов',
    email: 'grower@example.md',
    password: 'secret123',
    confirm: 'secret123',
    ...overrides,
  }
  if (values.name) await user.type(screen.getByLabelText(/Имя/), values.name)
  if (values.email)
    await user.type(screen.getByLabelText(/Email/), values.email)
  if (values.password)
    await user.type(screen.getByLabelText(/^Пароль/), values.password)
  if (values.confirm)
    await user.type(screen.getByLabelText(/Повторите пароль/), values.confirm)
  return user
}

async function submit(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))
}

describe('RegisterForm', () => {
  it('по умолчанию выбрана роль «Виноградарь», администратора в списке нет', () => {
    render(<RegisterForm onSubmit={vi.fn()} />)
    const role = screen.getByRole('combobox', { name: /Роль/ })

    expect(role).toHaveValue('user')
    expect(
      screen.getAllByRole('option').map((option) => option.textContent),
    ).toEqual(['Виноградарь', 'Агроном'])
  })

  it('поля подсказывают браузеру, что вводится новый пароль', () => {
    render(<RegisterForm onSubmit={vi.fn()} />)

    expect(screen.getByLabelText(/^Пароль/)).toHaveAttribute(
      'autocomplete',
      'new-password',
    )
    expect(screen.getByLabelText(/Повторите пароль/)).toHaveAttribute(
      'autocomplete',
      'new-password',
    )
    expect(screen.getByLabelText(/^Пароль/)).toHaveAccessibleDescription(
      'Не короче 8 символов, с буквами и цифрами',
    )
  })

  it('пустая форма не отправляется', async () => {
    const onSubmit = vi.fn()
    render(<RegisterForm onSubmit={onSubmit} />)

    await submit(userEvent.setup())

    expect(await screen.findByText('Введите имя')).toBeInTheDocument()
    expect(screen.getByText('Введите email')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('несовпадающие пароли показывают ошибку у второго поля', async () => {
    const onSubmit = vi.fn()
    render(<RegisterForm onSubmit={onSubmit} />)

    await submit(await fill({ confirm: 'secret124' }))

    expect(await screen.findByText('Пароли не совпадают')).toBeInTheDocument()
    expect(screen.getByLabelText(/Повторите пароль/)).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('отправляет значения вместе с выбранной ролью', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<RegisterForm onSubmit={onSubmit} />)
    const user = await fill()

    await user.selectOptions(screen.getByRole('combobox'), 'agronomist')
    await submit(user)

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      fullName: 'Андрей Бахов',
      email: 'grower@example.md',
      role: 'agronomist',
    })
  })

  it('занятый email показывается у поля email', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new ApiError('Конфликт', 409))
    render(<RegisterForm onSubmit={onSubmit} />)

    await submit(await fill())

    expect(
      await screen.findByText('Пользователь с таким email уже зарегистрирован'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/)).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('другая ошибка сервера показывается общим сообщением', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new ApiError('Ошибка сервера (500)', 500))
    render(<RegisterForm onSubmit={onSubmit} />)

    await submit(await fill())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ошибка сервера (500)',
    )
  })

  it('неизвестная ошибка даёт общий текст', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('boom'))
    render(<RegisterForm onSubmit={onSubmit} />)

    await submit(await fill())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось зарегистрироваться',
    )
  })
})
