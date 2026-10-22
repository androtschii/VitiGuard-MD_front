import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { useTelegramStore, type TelegramWebApp } from '@/lib/telegram'
import { ThemeSwitcher } from './ThemeSwitcher'

describe('ThemeSwitcher', () => {
  it('предлагает три режима, по умолчанию — как в системе', () => {
    render(<ThemeSwitcher />)

    const select = screen.getByLabelText('Тема')
    expect(select).toHaveValue('system')
    expect(
      screen.getAllByRole('option').map((option) => option.textContent),
    ).toEqual(['Как в системе', 'Светлая', 'Тёмная'])
  })

  it('включает тёмную тему', async () => {
    render(<ThemeSwitcher />)

    await userEvent.selectOptions(screen.getByLabelText('Тема'), 'dark')

    expect(screen.getByLabelText('Тема')).toHaveValue('dark')
    expect(document.documentElement).toHaveClass('dark')
  })
})

describe('ThemeSwitcher в Telegram', () => {
  afterEach(() => {
    useTelegramStore.setState({ webApp: null })
  })

  it('режим «как в системе» называется по Telegram', () => {
    useTelegramStore.setState({ webApp: {} as TelegramWebApp })
    render(<ThemeSwitcher />)

    expect(screen.getAllByRole('option')[0]).toHaveTextContent('Как в Telegram')
  })
})
