import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { keyBytes } from '@/api/push'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { PushSettings } from './PushSettings'

type Sub = {
  endpoint: string
  toJSON: () => object
  unsubscribe: () => Promise<boolean>
}

let current: Sub | null = null
const unsubscribe = vi.fn(() => Promise.resolve(true))
const subscribe = vi.fn(() => {
  current = {
    endpoint: 'https://push.example/1',
    toJSON: () => ({
      endpoint: 'https://push.example/1',
      keys: { p256dh: 'k', auth: 'a' },
    }),
    unsubscribe,
  }
  return Promise.resolve(current)
})

function install(permission: NotificationPermission, request = permission) {
  vi.stubGlobal('PushManager', function PushManager() {})
  vi.stubGlobal('Notification', {
    permission,
    requestPermission: vi.fn(() => Promise.resolve(request)),
  })
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: {
      ready: Promise.resolve({
        pushManager: {
          getSubscription: () => Promise.resolve(current),
          subscribe,
        },
      }),
    },
  })
}

function serveKey(status = 200) {
  server.use(
    http.get('/api/v1/push/key', () =>
      status === 200
        ? HttpResponse.json({ public_key: 'AQID' })
        : HttpResponse.json({ detail: 'нет' }, { status }),
    ),
  )
}

describe('PushSettings', () => {
  beforeEach(() => {
    current = null
    subscribe.mockClear()
    unsubscribe.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(navigator, 'serviceWorker')
  })

  it('без поддержки в браузере честно об этом говорит', async () => {
    renderWithQueryClient(<PushSettings />)

    expect(await screen.findByText(/не поддерживает/)).toBeInTheDocument()
  })

  it('без ключей на сервере сообщает, что push выключен', async () => {
    install('default')
    serveKey(503)
    renderWithQueryClient(<PushSettings />)

    expect(
      await screen.findByText(/не настроены на сервере/),
    ).toBeInTheDocument()
  })

  it('при запрете в браузере подсказывает, где разрешить', async () => {
    install('denied')
    serveKey()
    renderWithQueryClient(<PushSettings />)

    expect(
      await screen.findByText(/запрещены в настройках/),
    ).toBeInTheDocument()
  })

  it('сбой сервера показывает ошибку', async () => {
    install('default')
    serveKey(500)
    renderWithQueryClient(<PushSettings />)

    expect(await screen.findByText(/Не удалось проверить/)).toBeInTheDocument()
  })

  it('подписывает и отписывает это устройство', async () => {
    install('default', 'granted')
    serveKey()
    let posted: unknown
    let deleted: string | null = null
    server.use(
      http.post('/api/v1/push/subscriptions', async ({ request }) => {
        posted = await request.json()
        return new HttpResponse(null, { status: 204 })
      }),
      http.delete('/api/v1/push/subscriptions', ({ request }) => {
        deleted = new URL(request.url).searchParams.get('endpoint')
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderWithQueryClient(<PushSettings />)
    const checkbox = await screen.findByRole('checkbox', {
      name: 'Уведомления на этом устройстве',
    })
    expect(checkbox).not.toBeChecked()

    await userEvent.click(checkbox)
    await waitFor(() => expect(checkbox).toBeChecked())
    expect(subscribe).toHaveBeenCalledWith({
      userVisibleOnly: true,
      applicationServerKey: keyBytes('AQID'),
    })
    expect(posted).toEqual({
      endpoint: 'https://push.example/1',
      keys: { p256dh: 'k', auth: 'a' },
    })

    await userEvent.click(checkbox)
    await waitFor(() => expect(deleted).toBe('https://push.example/1'))
    expect(unsubscribe).toHaveBeenCalled()
  })

  it('без разрешения ничего не подписывает', async () => {
    install('default', 'denied')
    serveKey()
    renderWithQueryClient(<PushSettings />)

    await userEvent.click(await screen.findByRole('checkbox'))

    await waitFor(() => expect(subscribe).not.toHaveBeenCalled())
  })

  it('отписка без подписки ничего не ломает, сбой — с сообщением', async () => {
    install('default', 'granted')
    serveKey()
    server.use(
      http.post('/api/v1/push/subscriptions', () =>
        HttpResponse.json({ detail: 'нет' }, { status: 400 }),
      ),
    )
    renderWithQueryClient(<PushSettings />)

    await userEvent.click(await screen.findByRole('checkbox'))

    expect(await screen.findByRole('alert')).toHaveTextContent(/Не получилось/)
  })
})

describe('keyBytes', () => {
  it('переводит base64url в байты', () => {
    expect(Array.from(keyBytes('AQID'))).toEqual([1, 2, 3])
    expect(Array.from(keyBytes('-_8'))).toEqual([251, 255])
  })
})
