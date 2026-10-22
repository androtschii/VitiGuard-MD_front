import type { ErrorEvent } from '@sentry/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const sentry = vi.hoisted(() => ({
  init: vi.fn(),
  captureException: vi.fn(),
}))
vi.mock('@sentry/react', () => sentry)

// Модуль помнит инициализацию: каждый тест начинает с чистого
async function load() {
  vi.resetModules()
  return import('./monitoring')
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('monitoring', () => {
  it('без DSN SDK не загружается, а ошибки никуда не уходят', async () => {
    const monitoring = await load()

    expect(await monitoring.initMonitoring(undefined)).toBeNull()
    monitoring.reportError(new Error('boom'))
    await Promise.resolve()

    expect(sentry.init).not.toHaveBeenCalled()
    expect(sentry.captureException).not.toHaveBeenCalled()
  })

  it('с DSN — только ошибки, без личных данных', async () => {
    const monitoring = await load()

    await monitoring.initMonitoring('https://key@sentry.example/1')
    await monitoring.initMonitoring('https://key@sentry.example/1')

    expect(sentry.init).toHaveBeenCalledTimes(1)
    const [options] = sentry.init.mock.calls[0] as [Record<string, unknown>]
    expect(options).toMatchObject({
      dsn: 'https://key@sentry.example/1',
      tracesSampleRate: 0,
      dataCollection: { userInfo: false, cookies: false, httpHeaders: false },
      beforeSend: monitoring.scrubEvent,
    })

    monitoring.reportError(new Error('boom'), { componentStack: 'at Map' })
    monitoring.reportError('plain')
    await vi.waitFor(() =>
      expect(sentry.captureException).toHaveBeenCalledTimes(2),
    )
    expect(sentry.captureException).toHaveBeenNthCalledWith(
      1,
      new Error('boom'),
      { extra: { componentStack: 'at Map' } },
    )
    expect(sentry.captureException).toHaveBeenNthCalledWith(
      2,
      'plain',
      undefined,
    )
  })

  it('прячет секреты в адресах', async () => {
    const { scrubUrl } = await load()

    expect(scrubUrl('/reset-password?token=abc123&lang=ru')).toBe(
      '/reset-password?token=[скрыто]&lang=ru',
    )
    expect(scrubUrl('/#tgWebAppData=query_id%3D1&tgWebAppVersion=8.0')).toBe(
      '/#tgWebAppData=[скрыто]&tgWebAppVersion=8.0',
    )
    expect(scrubUrl('/map')).toBe('/map')
  })

  it('из события убираются заголовки, cookie, пользователь и секреты', async () => {
    const { scrubEvent } = await load()
    const event = {
      type: undefined,
      request: {
        url: 'https://app/reset-password?token=abc',
        query_string: 'token=abc',
        headers: { Authorization: 'Bearer secret' },
        cookies: { refresh_token: 'secret' },
      },
      user: { email: 'ion@example.md' },
      breadcrumbs: [
        { data: { url: '/api/v1/auth/reset?token=abc' } },
        { data: { from: '/reset-password?token=abc', to: '/login' } },
        { message: 'без данных' },
      ],
    } as unknown as ErrorEvent

    const cleaned = scrubEvent(event)

    expect(cleaned.request).toEqual({
      url: 'https://app/reset-password?token=[скрыто]',
      query_string: '?token=[скрыто]',
    })
    expect(cleaned.user).toBeUndefined()
    expect(cleaned.breadcrumbs?.map((crumb) => crumb.data)).toEqual([
      { url: '/api/v1/auth/reset?token=[скрыто]' },
      { from: '/reset-password?token=[скрыто]', to: '/login' },
      undefined,
    ])
    expect(scrubEvent({ type: undefined })).toEqual({
      type: undefined,
    })
  })
})
