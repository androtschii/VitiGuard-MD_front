import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

export type UserRole = 'user' | 'agronomist' | 'admin'

// Профиль вошедшего пользователя (GET /users/me)
export type CurrentUser = {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  is_active: boolean
  // Привязан ли чат Telegram-бота (backend/pr-082)
  telegram_linked: boolean
  created_at: string
  updated_at: string
}

const meKey = ['users', 'me'] as const

export async function fetchMe() {
  const { data } = await api.get<CurrentUser>('/users/me')
  return data
}

export function useMe() {
  return useQuery({ queryKey: meKey, queryFn: fetchMe })
}

// Сервер меняет только имя: email и роль в профиле не редактируются
export async function updateMe(input: { full_name: string }) {
  const { data } = await api.patch<CurrentUser>('/users/me', input)
  return data
}

export function useUpdateMe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMe,
    onSuccess: (data) => queryClient.setQueryData(meKey, data),
  })
}

// С какого уровня риска присылать предупреждения; null — не присылать
// (backend/pr-084)
export type AlertLevel = 'medium' | 'high' | null

const notificationsKey = ['users', 'me', 'notifications'] as const

export function useNotificationSettings() {
  return useQuery({
    queryKey: notificationsKey,
    queryFn: async () => {
      const { data } = await api.get<{ alert_level: AlertLevel }>(
        '/users/me/notifications',
      )
      return data
    },
  })
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (level: AlertLevel) => {
      const { data } = await api.put<{ alert_level: AlertLevel }>(
        '/users/me/notifications',
        { alert_level: level },
      )
      return data
    },
    onSuccess: (data) => queryClient.setQueryData(notificationsKey, data),
  })
}

// Одноразовая ссылка на бота: переход по ней привязывает чат (backend/pr-082)
export type TelegramLink = { url: string; expires_in: number }

export function useTelegramLink() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<TelegramLink>('/users/me/telegram')
      return data
    },
  })
}

export function useUnlinkTelegram() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete('/users/me/telegram'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: meKey }),
  })
}
