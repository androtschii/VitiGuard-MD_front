import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { HeaderMenu } from './HeaderMenu'

describe('HeaderMenu', () => {
  it('по кнопке раскрывает язык и тему', async () => {
    render(<HeaderMenu />)
    const button = screen.getByRole('button', { name: 'Меню' })

    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('radiogroup', { name: 'Язык' })).toBeNull()

    await userEvent.click(button)

    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('radiogroup', { name: 'Язык' })).toBeVisible()
    expect(screen.getByRole('radiogroup', { name: 'Тема' })).toBeVisible()
  })

  it('закрывается по Esc и возвращает фокус на кнопку', async () => {
    render(<HeaderMenu />)
    const button = screen.getByRole('button', { name: 'Меню' })
    await userEvent.click(button)

    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('radiogroup', { name: 'Язык' })).toBeNull()
    expect(button).toHaveFocus()
  })

  it('закрывается нажатием мимо меню, а выбор внутри его не закрывает', async () => {
    render(
      <>
        <HeaderMenu />
        <p>Страница</p>
      </>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Меню' }))

    await userEvent.click(screen.getByRole('radio', { name: 'Тёмная' }))
    expect(screen.getByRole('radiogroup', { name: 'Тема' })).toBeVisible()

    await userEvent.click(screen.getByText('Страница'))
    expect(screen.queryByRole('radiogroup', { name: 'Тема' })).toBeNull()
  })
})
