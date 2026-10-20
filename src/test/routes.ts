import type { RouteObject } from 'react-router'
import { routes as lazyRoutes } from '@/app/routes'

// Маршруты с уже загруженным кодом страниц: тесты страниц проверяют их
// поведение, а не ожидание ленивой загрузки (её проверяет routes.test)
async function eager(routes: RouteObject[]): Promise<RouteObject[]> {
  return Promise.all(
    routes.map(async (route) => {
      const { lazy, children, ...rest } = route
      const loaded = typeof lazy === 'function' ? await lazy() : {}
      return {
        ...rest,
        ...loaded,
        ...(children ? { children: await eager(children) } : {}),
      } as RouteObject
    }),
  )
}

export const routes = await eager(lazyRoutes)
