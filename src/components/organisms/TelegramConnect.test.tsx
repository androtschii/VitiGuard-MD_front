import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { useTelegramStore } from '@/lib/telegram'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { fakeTelegram } from '@/test/telegram'
import { TelegramConnect } from './TelegramConnect'

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
})

describe('TelegramConnect', () => {
  it('в браузере даёт одноразовую ссылку на бота', async () => {
    me(false)
    linkHandler()
    const user = userEvent.setup()
    renderWithQueryClient(<TelegramConnect />)

    expect(await screen.findByText(/Подключите бота/)).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Подключить Telegram' }),
    )

    const open = await screen.findByRole('link', {
      name: 'Открыть бота и нажать «Start»',
    })
    expect(open).toHaveAttribute('href', LINK)
    expect(open).toHaveAttribute('target', '_blank')
    expect(screen.getByText(/действует 15 минут/)).toBeInTheDocument()
  })

  it('в мини-приложении открывает чат с ботом сразу', async () => {
    me(false)
    linkHandler()
    const telegram = fakeTelegram()
    useTelegramStore.setState({ webApp: telegram })
    const user = userEvent.setup()
    renderWithQueryClient(<TelegramConnect />)

    await user.click(
      await screen.findByRole('button', { name: 'Подключить Telegram' }),
    )

    await screen.findByRole('link', { name: /Открыть бота/ })
    expect(telegram.openTelegramLink).toHaveBeenCalledWith(LINK)
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
