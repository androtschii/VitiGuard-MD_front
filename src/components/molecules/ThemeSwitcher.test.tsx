import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
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
