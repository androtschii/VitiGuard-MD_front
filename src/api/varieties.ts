import { useQuery } from '@tanstack/react-query'
import { api } from './client'

export type BerryColor = 'white' | 'rose' | 'red'

// Справочник сортов (backend/pr-034): десятки записей, отдаётся целиком по алфавиту
export type Variety = {
  id: string
  name: string
  berry_color: BerryColor
}

export async function fetchVarieties() {
  const { data } = await api.get<Variety[]>('/varieties')
  return data
}

export function useVarieties() {
  return useQuery({
    queryKey: ['varieties'],
    queryFn: fetchVarieties,
    // Справочник меняется редко — агрономом, а не в ходе работы с картой
    staleTime: 10 * 60_000,
  })
}
