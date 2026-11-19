import { useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  ForgotPasswordValues,
  LoginValues,
  RegisterValues,
} from '@/schemas/auth'
import { useSessionStore } from '@/store/session'
import { api } from './client'

// Refresh-токен в ответе не приходит: сервер кладёт его в HttpOnly-cookie
export type AccessToken = {
  access_token: string
  token_type: 'bearer'
}

export async function login(values: LoginValues) {
  const { data } = await api.post<AccessToken>('/auth/login', values)
  return data
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: login,
    onSuccess: ({ access_token }) => {
      queryClient.clear()
      useSessionStore.getState().setAccessToken(access_token)
    },
  })
}

export type DemoRole = 'user' | 'agronomist' | 'admin'

// Демо-вход в роль без пароля (backend: /auth/demo); сервер разрешает его
// только на стенде, где он явно включён
export async function demoLogin(role: DemoRole) {
  const { data } = await api.post<AccessToken>('/auth/demo', { role })
  return data
}

export function useDemoLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: demoLogin,
    onSuccess: ({ access_token }) => {
      queryClient.clear()
      useSessionStore.getState().setAccessToken(access_token)
    },
  })
}

// Новый access-токен по refresh-cookie; тело запроса пустое
export async function refreshAccessToken() {
  const { data } = await api.post<AccessToken>('/auth/refresh')
  return data
}

export async function logout() {
  await api.post('/auth/logout')
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    // Сессия на устройстве заканчивается, даже если сервер не ответил: токен
    // в памяти нельзя оставлять, а cookie по таймеру перестанет действовать
    onSettled: () => {
      queryClient.clear()
      useSessionStore.getState().clear()
    },
  })
}

export type RegisteredUser = {
  id: string
  email: string
  full_name: string | null
  role: 'user' | 'agronomist' | 'admin'
}

// Подтверждение пароля нужно только форме, серверу его не отправляем.
// Роль не отправляется: регистрация создаёт виноградаря, роли агронома и
// администратора назначает администратор
export async function register(values: RegisterValues) {
  const { fullName, email, password } = values
  const { data } = await api.post<RegisteredUser>('/auth/register', {
    email,
    password,
    full_name: fullName,
  })
  return data
}

export function useRegister() {
  return useMutation({ mutationFn: register })
}

export async function requestPasswordReset(values: ForgotPasswordValues) {
  await api.post('/auth/password-reset', values)
}

export function useRequestPasswordReset() {
  return useMutation({ mutationFn: requestPasswordReset })
}

type ConfirmPasswordReset = {
  token: string
  password: string
}

export async function confirmPasswordReset({
  token,
  password,
}: ConfirmPasswordReset) {
  await api.post('/auth/password-reset/confirm', {
    token,
    new_password: password,
  })
}

export function useConfirmPasswordReset() {
  return useMutation({ mutationFn: confirmPasswordReset })
}

// Вход в мини-приложение Telegram по подписанным данным запуска (pr-090)
export async function telegramLogin(initData: string) {
  const { data } = await api.post<AccessToken>('/auth/telegram', {
    init_data: initData,
  })
  return data
}
