import type { RouteObject } from 'react-router'
import { GuestRoute, ProtectedRoute } from '@/app/guards'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { RouteErrorPage } from '@/pages/RouteErrorPage'

// errorElement у корневого маршрута — граница ошибок для всех страниц:
// ошибка в одной странице не оставляет пользователя с пустым экраном
export const routes: RouteObject[] = [
  {
    errorElement: <RouteErrorPage />,
    children: [
      // Только для вошедших: новые страницы кабинета добавляются сюда
      {
        element: <ProtectedRoute />,
        children: [{ path: '/', element: <HomePage /> }],
      },
      // Только для гостей
      {
        element: <GuestRoute />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
        ],
      },
      // Ссылка из письма открывается независимо от того, вошёл ли пользователь
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
