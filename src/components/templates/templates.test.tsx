import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthTemplate } from './AuthTemplate'
import { CenteredTemplate } from './CenteredTemplate'
import { LoadingScreen } from './LoadingScreen'

describe('AuthTemplate', () => {
  it('выводит заголовок, содержимое и переключатели языка и темы', () => {
    render(
      <AuthTemplate title="Вход" footer="Нет аккаунта?">
        <form aria-label="Форма входа" />
      </AuthTemplate>,
    )

    expect(screen.getByRole('heading', { name: 'Вход' })).toBeInTheDocument()
    expect(
      screen.getByRole('form', { name: 'Форма входа' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Нет аккаунта?')).toBeInTheDocument()
    expect(screen.getByLabelText('Язык')).toBeInTheDocument()
    expect(screen.getByLabelText('Тема')).toBeInTheDocument()
  })

  it('без footer не оставляет пустой абзац', () => {
    const { container } = render(
      <AuthTemplate title="Вход">форма</AuthTemplate>,
    )

    expect(container.querySelectorAll('main > p')).toHaveLength(0)
  })
})

describe('CenteredTemplate', () => {
  it('оборачивает содержимое в main', () => {
    render(<CenteredTemplate>Страница не найдена</CenteredTemplate>)

    expect(screen.getByRole('main')).toHaveTextContent('Страница не найдена')
  })
})

describe('LoadingScreen', () => {
  it('сообщает о загрузке через role="status"', () => {
    render(<LoadingScreen />)

    expect(screen.getByRole('status')).toHaveTextContent('Загрузка…')
  })
})
