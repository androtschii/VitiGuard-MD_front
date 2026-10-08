import { useMutation } from '@tanstack/react-query'
import type { LoginValues } from '@/schemas/auth'
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
