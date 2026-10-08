import type { RouteObject } from 'react-router'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { RouteErrorPage } from '@/pages/RouteErrorPage'

// errorElement у корневого маршрута — граница ошибок для всех страниц:
// ошибка в одной странице не оставляет пользователя с пустым экраном
export const routes: RouteObject[] = [
  {
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
