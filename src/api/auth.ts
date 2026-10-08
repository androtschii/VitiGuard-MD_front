import { useMutation } from '@tanstack/react-query'
import type { LoginValues, RegisterValues } from '@/schemas/auth'
import { api } from './client'

export type TokenPair = {
  access_token: string
  refresh_token: string
  token_type: 'bearer'
}

export async function login(values: LoginValues) {
  const { data } = await api.post<TokenPair>('/auth/login', values)
  return data
}

export function useLogin() {
  return useMutation({ mutationFn: login })
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
