import { useQuery } from '@tanstack/react-query'
import { api } from './client'

export type ApiInfo = {
  name: string
  version: string
  environment: string
}

export async function fetchApiInfo() {
  const { data } = await api.get<ApiInfo>('/info')
  return data
}

export function useApiInfo() {
  return useQuery({ queryKey: ['api-info'], queryFn: fetchApiInfo })
}
