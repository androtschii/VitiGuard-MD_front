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
