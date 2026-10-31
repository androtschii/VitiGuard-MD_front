import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { useTelegramStore, type TelegramWebApp } from '@/lib/telegram'
import { ThemeSwitcher } from './ThemeSwitcher'

describe('ThemeSwitcher', () => {
  it('предлагает три режима, по умолчанию — как в системе', () => {
    render(<ThemeSwitcher />)

    expect(screen.getByRole('radio', { name: 'Как в системе' })).toBeChecked()
    expect(
      screen
        .getAllByRole('radio')
        .map((radio) => radio.getAttribute('aria-label')),
    ).toEqual(['Как в системе', 'Светлая', 'Тёмная'])
  })

  it('включает тёмную тему', async () => {
    render(<ThemeSwitcher />)

    await userEvent.click(screen.getByRole('radio', { name: 'Тёмная' }))

    expect(screen.getByRole('radio', { name: 'Тёмная' })).toBeChecked()
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

    expect(
      screen.getByRole('radio', { name: 'Как в Telegram' }),
    ).toBeInTheDocument()
  })
})
