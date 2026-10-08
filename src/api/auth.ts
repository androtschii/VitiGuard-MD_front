import { useMutation } from '@tanstack/react-query'
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
  return useMutation({
    mutationFn: login,
    onSuccess: ({ access_token }) =>
      useSessionStore.getState().setAccessToken(access_token),
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
  return useMutation({
    mutationFn: logout,
    // Сессия на устройстве заканчивается, даже если сервер не ответил: токен
    // в памяти нельзя оставлять, а cookie по таймеру перестанет действовать
    onSettled: () => useSessionStore.getState().clear(),
  })
}

export type RegisteredUser = {
  id: string
  email: string
  full_name: string | null
  role: 'user' | 'agronomist'
}

// Подтверждение пароля нужно только форме, серверу его не отправляем
export async function register(values: RegisterValues) {
  const { fullName, email, password, role } = values
  const { data } = await api.post<RegisteredUser>('/auth/register', {
    email,
    password,
    full_name: fullName,
    role,
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
