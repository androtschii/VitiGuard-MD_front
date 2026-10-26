import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { unreadAlertsKey } from '@/api/alerts'
import * as client from '@/api/client'
import { reconnectDelay, socketUrl, useAlertsSocket } from './useAlertsSocket'

// WebSocket вместо настоящего: тест сам открывает, присылает и закрывает
class FakeSocket {
  static instances: FakeSocket[] = []
  onopen: (() => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  onclose: (() => void) | null = null
  close = vi.fn()

  url: string

  constructor(url: string) {
    this.url = url
    FakeSocket.instances.push(this)
  }
}

function setup(token: string | null = 'token-1') {
  FakeSocket.instances = []
  vi.stubGlobal('WebSocket', FakeSocket)
  vi.spyOn(client, 'readAccessToken').mockReturnValue(token)
  const queryClient = new QueryClient()
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const hook = renderHook(() => useAlertsSocket(), { wrapper })
  return { ...hook, queryClient, invalidate }
}

describe('useAlertsSocket', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('адрес сокета — от базы API и схемы страницы', () => {
    const page = new URL('https://vitiguard.md/map')
    expect(socketUrl('/api/v1', 't 1', page)).toBe(
      'wss://vitiguard.md/api/v1/ws/alerts?token=t+1',
    )
    expect(
      socketUrl('http://127.0.0.1:8000/api/v1/', 't', new URL('http://x/')),
    ).toBe('ws://127.0.0.1:8000/api/v1/ws/alerts?token=t')
  })

  it('переподключение — 1, 2, 4… секунд, не дольше 30', () => {
    expect([0, 1, 2, 5, 10].map(reconnectDelay)).toEqual([
      1000, 2000, 4000, 30000, 30000,
    ])
  })

  it('число из сокета попадает в значок, список перечитывается', () => {
    const { result, queryClient, invalidate } = setup()
    const socket = FakeSocket.instances[0]
    expect(socket?.url).toContain('/api/v1/ws/alerts?token=token-1')
    expect(result.current).toBe(false)

    act(() => {
      socket?.onopen?.()
    })
    expect(result.current).toBe(true)
    act(() => {
      socket?.onmessage?.({ data: '{"unread":4}' })
    })

    expect(queryClient.getQueryData(unreadAlertsKey)).toBe(4)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['alerts', 'list'] })
    // Чужие сообщения пропускаются
    act(() => {
      socket?.onmessage?.({ data: '{"other":1}' })
    })
    expect(queryClient.getQueryData(unreadAlertsKey)).toBe(4)
  })

  it('после разрыва переподключается с новым токеном', () => {
    const { result } = setup()
    const first = FakeSocket.instances[0]
    act(() => {
      first?.onopen?.()
    })

    act(() => {
      first?.onclose?.()
    })
    expect(result.current).toBe(false)
    vi.mocked(client.readAccessToken).mockReturnValue('token-2')
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(FakeSocket.instances).toHaveLength(2)
    expect(FakeSocket.instances[1]?.url).toContain('token=token-2')
  })

  it('без токена ждёт входа и пробует снова', () => {
    setup(null)
    expect(FakeSocket.instances).toHaveLength(0)

    vi.mocked(client.readAccessToken).mockReturnValue('token-3')
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(FakeSocket.instances).toHaveLength(1)
  })

  it('при уходе со страницы закрывает сокет и не переподключается', () => {
    const { unmount } = setup()
    const socket = FakeSocket.instances[0]

    unmount()
    act(() => {
      vi.advanceTimersByTime(60_000)
    })

    expect(socket?.close).toHaveBeenCalled()
    expect(FakeSocket.instances).toHaveLength(1)
  })

  it('без поддержки WebSocket ничего не делает', () => {
    vi.stubGlobal('WebSocket', undefined)
    const queryClient = new QueryClient()
    const { result } = renderHook(() => useAlertsSocket(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    })

    expect(result.current).toBe(false)
  })
})
