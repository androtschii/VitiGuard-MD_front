import type { RouteObject } from 'react-router'
import { GuestRoute, ProtectedRoute } from '@/app/guards'
import { LoadingScreen } from '@/components/templates/LoadingScreen'
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
    // Пока при первом открытии загружается код страницы (например, карты)
    hydrateFallbackElement: <LoadingScreen />,
    children: [
      // Только для вошедших: новые страницы кабинета добавляются сюда
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/', element: <HomePage /> },
          // MapLibre весит больше всего остального приложения, поэтому код
          // карты загружается отдельно, только когда пользователь её открыл
          {
            path: '/map',
            lazy: async () => ({
              Component: (await import('@/pages/MapPage')).MapPage,
            }),
          },
        ],
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
