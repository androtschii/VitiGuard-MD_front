import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useTelegramStore } from '@/lib/telegram'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { fakeTelegram } from '@/test/telegram'
import { LINK_POLL_MS, TelegramConnect } from './TelegramConnect'

const LINK = 'https://t.me/VitiGuard_bot?start=code'

function me(telegramLinked: boolean) {
  server.use(
    http.get('/api/v1/users/me', () =>
      HttpResponse.json({
        id: 'user-1',
        email: 'ion@example.md',
        full_name: 'Ион',
        role: 'user',
        is_active: true,
        telegram_linked: telegramLinked,
        created_at: '2026-06-01T00:00:00Z',
        updated_at: '2026-06-01T00:00:00Z',
      }),
    ),
  )
}

function linkHandler() {
  server.use(
    http.post('/api/v1/users/me/telegram', () =>
      HttpResponse.json({ url: LINK, expires_in: 900 }),
    ),
  )
}

afterEach(() => {
  useTelegramStore.setState({ webApp: null })
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// Вкладка, которую сайт открывает по нажатию: адрес бота ей ставится позже
function fakeTab() {
  const tab = { location: { href: '' }, close: vi.fn() }
  const open = vi
    .spyOn(window, 'open')
    .mockReturnValue(tab as unknown as Window)
  return { tab, open }
}

describe('TelegramConnect', () => {
  it('в браузере сразу открывает бота и сам замечает подключение', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    me(false)
    linkHandler()
    const { tab, open: openTab } = fakeTab()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithQueryClient(<TelegramConnect />)

    expect(await screen.findByText(/Подключите бота/)).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Подключить Telegram' }),
    )

    // Вкладка открыта в момент нажатия и получила адрес бота
    expect(openTab).toHaveBeenCalledWith('', '_blank')
    expect(await screen.findByText(/нажмите в нём «Start»/)).toBeVisible()
    expect(tab.location.href).toBe(LINK)
    // Запасная ссылка, если Telegram не открылся
    const open = screen.getByRole('link', {
      name: 'Открыть бота и нажать «Start»',
    })
    expect(open).toHaveAttribute('href', LINK)
    expect(screen.getByText(/действует 15 минут/)).toBeInTheDocument()

    // Пользователь нажал «Start» — профиль переспрашивается и видит привязку
    me(true)
    await act(() => vi.advanceTimersByTimeAsync(LINK_POLL_MS))
    expect(await screen.findByText(/Чат с ботом подключён/)).toBeVisible()
  })

  it('перестаёт ждать, когда ссылка истекла', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    me(false)
    linkHandler()
    fakeTab()
    let asked = 0
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithQueryClient(<TelegramConnect />)

    await user.click(
      await screen.findByRole('button', { name: 'Подключить Telegram' }),
    )
    await screen.findByText(/нажмите в нём «Start»/)
    server.use(
      http.get('/api/v1/users/me', () => {
        asked += 1
        return HttpResponse.json({
          id: 'user-1',
          email: 'ion@example.md',
          full_name: 'Ион',
          role: 'user',
          is_active: true,
          telegram_linked: false,
          created_at: '2026-06-01T00:00:00Z',
          updated_at: '2026-06-01T00:00:00Z',
        })
      }),
    )
    await act(() => vi.advanceTimersByTimeAsync(900 * 1000))
    const before = asked
    await act(() => vi.advanceTimersByTimeAsync(LINK_POLL_MS * 3))
    expect(asked).toBe(before)
  })

  it('закрывает пустую вкладку, если ссылку получить не удалось', async () => {
    me(false)
    server.use(
      http.post('/api/v1/users/me/telegram', () =>
        HttpResponse.json({ detail: 'Ошибка' }, { status: 500 }),
      ),
    )
    const { tab } = fakeTab()
    const user = userEvent.setup()
    renderWithQueryClient(<TelegramConnect />)

    await user.click(
      await screen.findByRole('button', { name: 'Подключить Telegram' }),
    )

    await screen.findByRole('alert')
    expect(tab.close).toHaveBeenCalled()
  })

  it('если браузер не дал открыть вкладку, остаётся ссылка', async () => {
    me(false)
    linkHandler()
    vi.spyOn(window, 'open').mockReturnValue(null)
    const user = userEvent.setup()
    renderWithQueryClient(<TelegramConnect />)

    await user.click(
      await screen.findByRole('button', { name: 'Подключить Telegram' }),
    )

    expect(
      await screen.findByRole('link', { name: /Открыть бота/ }),
    ).toHaveAttribute('href', LINK)
  })

  it('в мини-приложении открывает чат с ботом сразу', async () => {
    me(false)
    linkHandler()
    const telegram = fakeTelegram()
    useTelegramStore.setState({ webApp: telegram })
    const openTab = vi.spyOn(window, 'open')
    const user = userEvent.setup()
    renderWithQueryClient(<TelegramConnect />)

    await user.click(
      await screen.findByRole('button', { name: 'Подключить Telegram' }),
    )

    await screen.findByRole('link', { name: /Открыть бота/ })
    expect(telegram.openTelegramLink).toHaveBeenCalledWith(LINK)
    // В мини-приложении вкладки браузера нет
    expect(openTab).not.toHaveBeenCalled()
  })

  it('подключённый чат можно отключить', async () => {
    me(true)
    let deleted = false
    server.use(
      http.delete('/api/v1/users/me/telegram', () => {
        deleted = true
        me(false)
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const user = userEvent.setup()
    renderWithQueryClient(<TelegramConnect />)

    expect(await screen.findByText(/Чат с ботом подключён/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Отключить' }))

    expect(
      await screen.findByRole('button', { name: 'Подключить Telegram' }),
    ).toBeInTheDocument()
    expect(deleted).toBe(true)
  })

  it('объясняет, если бот не настроен на сервере', async () => {
    me(false)
    fakeTab()
    server.use(
      http.post('/api/v1/users/me/telegram', () =>
        HttpResponse.json(
          { detail: 'Telegram-бот не настроен' },
          { status: 503 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderWithQueryClient(<TelegramConnect />)

    await user.click(
      await screen.findByRole('button', { name: 'Подключить Telegram' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Telegram-бот пока не настроен на сервере.',
    )
  })

  it('другие ошибки показывает как есть', async () => {
    me(false)
    fakeTab()
    server.use(
      http.post('/api/v1/users/me/telegram', () =>
        HttpResponse.json({ detail: 'Не авторизован' }, { status: 401 }),
      ),
    )
    const user = userEvent.setup()
    renderWithQueryClient(<TelegramConnect />)

    await user.click(
      await screen.findByRole('button', { name: 'Подключить Telegram' }),
    )

    expect(await screen.findByRole('alert')).not.toHaveTextContent(
      'не настроен',
    )
  })
})
