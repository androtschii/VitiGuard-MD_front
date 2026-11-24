import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/client'
import { RegisterForm } from './RegisterForm'

function renderForm(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

type FillOverrides = {
  name?: string
  email?: string
  password?: string
  confirm?: string
  agree?: boolean
}

async function fill(overrides: FillOverrides = {}) {
  const user = userEvent.setup()
  const values = {
    name: 'Андрей Бахов',
    email: 'grower@example.md',
    password: 'secret123',
    confirm: 'secret123',
    agree: true,
    ...overrides,
  }
  if (values.name) await user.type(screen.getByLabelText(/Имя/), values.name)
  if (values.email)
    await user.type(screen.getByLabelText(/Email/), values.email)
  if (values.password)
    await user.type(screen.getByLabelText(/^Пароль/), values.password)
  if (values.confirm)
    await user.type(screen.getByLabelText(/Повторите пароль/), values.confirm)
  if (values.agree)
    await user.click(screen.getByRole('checkbox', { name: /соглашаюсь/i }))
  return user
}

async function submit(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))
}

describe('RegisterForm', () => {
  it('роль не выбирается: её назначает администратор', () => {
    renderForm(<RegisterForm onSubmit={vi.fn()} />)

    expect(screen.queryByRole('combobox')).toBeNull()
    expect(screen.queryByText(/Роль/)).toBeNull()
  })

  it('поля подсказывают браузеру, что вводится новый пароль', () => {
    renderForm(<RegisterForm onSubmit={vi.fn()} />)

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

  it('ссылка на политику конфиденциальности открывается в новой вкладке с noopener', () => {
    renderForm(<RegisterForm onSubmit={vi.fn()} />)

    const link = screen.getByRole('link', {
      name: 'политикой конфиденциальности',
    })
    expect(link).toHaveAttribute('href', '/privacy')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener')
  })

  it('пустая форма не отправляется', async () => {
    const onSubmit = vi.fn()
    renderForm(<RegisterForm onSubmit={onSubmit} />)

    await submit(userEvent.setup())

    expect(await screen.findByText('Введите имя')).toBeInTheDocument()
    expect(screen.getByText('Введите email')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('несовпадающие пароли показывают ошибку у второго поля', async () => {
    const onSubmit = vi.fn()
    renderForm(<RegisterForm onSubmit={onSubmit} />)

    await submit(await fill({ confirm: 'secret124' }))

    expect(await screen.findByText('Пароли не совпадают')).toBeInTheDocument()
    expect(screen.getByLabelText(/Повторите пароль/)).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('без согласия с политикой конфиденциальности форма не отправляется', async () => {
    const onSubmit = vi.fn()
    renderForm(<RegisterForm onSubmit={onSubmit} />)

    await submit(await fill({ agree: false }))

    expect(
      await screen.findByText(
        'Подтвердите согласие с политикой конфиденциальности',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: /соглашаюсь/i }),
    ).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('отправляет введённые значения', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderForm(<RegisterForm onSubmit={onSubmit} />)

    await submit(await fill())

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      fullName: 'Андрей Бахов',
      email: 'grower@example.md',
      agreePrivacy: true,
    })
    expect(onSubmit.mock.calls[0]?.[0]).not.toHaveProperty('role')
  })

  it('занятый email показывается у поля email', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new ApiError('Конфликт', 409))
    renderForm(<RegisterForm onSubmit={onSubmit} />)

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
    renderForm(<RegisterForm onSubmit={onSubmit} />)

    await submit(await fill())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ошибка сервера (500)',
    )
  })

  it('неизвестная ошибка даёт общий текст', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('boom'))
    renderForm(<RegisterForm onSubmit={onSubmit} />)

    await submit(await fill())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось зарегистрироваться',
    )
  })
})
