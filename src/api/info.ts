import { useQuery } from '@tanstack/react-query'
import { api } from './client'

export type ApiInfo = {
  name: string
  version: string
  environment: string
  // Включён ли демо-вход (только стенд на компьютере разработчика)
  demo_login?: boolean
}

export async function fetchApiInfo() {
  const { data } = await api.get<ApiInfo>('/info')
  return data
}

export function useApiInfo() {
  return useQuery({ queryKey: ['api-info'], queryFn: fetchApiInfo })
}
