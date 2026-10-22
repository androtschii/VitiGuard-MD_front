import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { api } from './client'
import type { CurrentUser, UserRole } from './users'
import type { Page } from './vineyards'

// Управление пользователями и ролями (pr-091, backend: /admin/users)
export const ADMIN_PAGE_SIZE = 20
const adminUsersKey = ['admin', 'users'] as const

export function useAdminUsers(query: string, page: number) {
  return useQuery({
    queryKey: [...adminUsersKey, query, page],
    queryFn: async () => {
      const { data } = await api.get<Page<CurrentUser>>('/admin/users', {
        params: { q: query || undefined, page, size: ADMIN_PAGE_SIZE },
      })
      return data
    },
    placeholderData: keepPreviousData,
  })
}

export type UserChange = {
  id: string
  role?: UserRole
  is_active?: boolean
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...change }: UserChange) => {
      const { data } = await api.patch<CurrentUser>(
        `/admin/users/${id}`,
        change,
      )
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminUsersKey }),
  })
}
