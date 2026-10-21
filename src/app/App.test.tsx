import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useTelegramStore, type TelegramWebApp } from '@/lib/telegram'
import { useSessionStore } from '@/store/session'
import { sidebarLink } from '@/test/nav'
import { renderWithQueryClient } from '@/test/render'
import { App } from './App'

describe('App', () => {
  it('показывает главную страницу вошедшему пользователю', async () => {
    useSessionStore.getState().setAccessToken('token')
    renderWithQueryClient(<App />)

    expect(
      screen.getByRole('heading', { name: 'Обзор хозяйства' }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/API 0\.1\.0/)).toBeInTheDocument()
  })
})

describe('App в Telegram', () => {
  afterEach(() => {
    useTelegramStore.setState({ webApp: null })
  })

  it('кнопка «Назад» Telegram появляется, когда есть куда вернуться', async () => {
    const BackButton = {
      show: vi.fn(),
      hide: vi.fn(),
      onClick: vi.fn(),
      offClick: vi.fn(),
    }
    useTelegramStore.setState({
      webApp: { BackButton } as unknown as TelegramWebApp,
    })
    useSessionStore.getState().setAccessToken('token')
    const user = userEvent.setup()
    const { unmount } = renderWithQueryClient(<App />)

    expect(BackButton.hide).toHaveBeenCalled()
    await user.click(sidebarLink('Профиль'))
    await waitFor(() => expect(BackButton.show).toHaveBeenCalled())

    const back = BackButton.onClick.mock.calls[0]?.[0] as () => void
    act(back)
    expect(
      await screen.findByRole('heading', { name: 'Обзор хозяйства' }),
    ).toBeInTheDocument()

    unmount()
    expect(BackButton.offClick).toHaveBeenCalledWith(back)
  })
})
