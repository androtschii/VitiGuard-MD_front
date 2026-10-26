import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { alertsKey, unreadAlertsKey } from '@/api/alerts'
import { readAccessToken } from '@/api/client'

const MAX_DELAY = 30_000

// Адрес WebSocket по базе API: относительная база — на том же сервере, что
// страница; схема ws/wss — как http/https у страницы или у базы
export function socketUrl(base: string, token: string, page: Location | URL) {
  const url = new URL(`${base.replace(/\/$/, '')}/ws/alerts`, page.href)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.searchParams.set('token', token)
  return url.toString()
}

// Задержка переподключения: 1, 2, 4… секунд, не больше 30
export function reconnectDelay(attempt: number) {
  return Math.min(MAX_DELAY, 1000 * 2 ** attempt)
}

// Число непрочитанных предупреждений в реальном времени (pr-063,
// backend/pr-093). Возвращает, открыто ли соединение: пока нет — значок
// обновляется опросом
export function useAlertsSocket() {
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (typeof WebSocket === 'undefined') return
    const base = import.meta.env.VITE_API_URL ?? '/api/v1'
    let socket: WebSocket | null = null
    let timer: ReturnType<typeof setTimeout> | undefined
    let attempt = 0
    let isStopped = false

    const retry = () => {
      if (isStopped) return
      timer = setTimeout(connect, reconnectDelay(attempt))
      attempt += 1
    }

    function connect() {
      // Токен берётся заново при каждом подключении: он живёт 15 минут
      const token = readAccessToken()
      if (!token) {
        retry()
        return
      }
      socket = new WebSocket(socketUrl(base, token, window.location))
      socket.onopen = () => {
        attempt = 0
        setIsConnected(true)
      }
      socket.onmessage = (event: MessageEvent<string>) => {
        const message = JSON.parse(event.data) as { unread?: unknown }
        if (typeof message.unread !== 'number') return
        queryClient.setQueryData(unreadAlertsKey, message.unread)
        // Список на открытой странице предупреждений тоже устарел
        void queryClient.invalidateQueries({
          queryKey: [...alertsKey, 'list'],
        })
      }
      socket.onclose = () => {
        setIsConnected(false)
        retry()
      }
    }

    connect()
    return () => {
      isStopped = true
      clearTimeout(timer)
      if (socket) {
        socket.onclose = null
        socket.close()
      }
    }
  }, [queryClient])

  return isConnected
}
