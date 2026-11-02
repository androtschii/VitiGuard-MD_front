import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from './client'

// Ключ VAPID приходит в base64url, а браузеру нужны байты
export function keyBytes(base64url: string) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
}

export function pushSupported() {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export type PushState = 'unsupported' | 'unavailable' | 'denied' | 'on' | 'off'

const pushKey = ['push'] as const

async function readState(): Promise<PushState> {
  if (!pushSupported()) return 'unsupported'
  try {
    await api.get('/push/key')
  } catch (error) {
    // 503 — на сервере нет ключей VAPID
    if (error instanceof ApiError && error.status === 503) return 'unavailable'
    throw error
  }
  if (Notification.permission === 'denied') return 'denied'
  const registration = await navigator.serviceWorker.ready
  return (await registration.pushManager.getSubscription()) ? 'on' : 'off'
}

export function usePushState() {
  return useQuery({ queryKey: pushKey, queryFn: readState })
}

async function enable() {
  const { data } = await api.get<{ public_key: string }>('/push/key')
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: keyBytes(data.public_key),
  })
  await api.post('/push/subscriptions', subscription.toJSON())
}

async function disable() {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) return
  await api.delete('/push/subscriptions', {
    params: { endpoint: subscription.endpoint },
  })
  await subscription.unsubscribe()
}

export function useTogglePush() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (on: boolean) => (on ? enable() : disable()),
    onSettled: () => queryClient.invalidateQueries({ queryKey: pushKey }),
  })
}
