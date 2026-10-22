import type { ComponentType } from 'react'
import type { RouteObject } from 'react-router'
import { GuestRoute, ProtectedRoute } from '@/app/guards'
import { LoadingScreen } from '@/components/templates/LoadingScreen'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RouteErrorPage } from '@/pages/RouteErrorPage'

// Код страницы загружается, когда её открывают: в первую загрузку попадают
// только главная и страницы ошибок, а формы (zod, react-hook-form), карта
// (MapLibre) и графики приходят отдельными файлами
function page<Name extends string>(
  load: () => Promise<Record<Name, ComponentType>>,
  name: Name,
) {
  return async () => ({ Component: (await load())[name] })
}

// errorElement у корневого маршрута — граница ошибок для всех страниц:
// ошибка в одной странице не оставляет пользователя с пустым экраном
export const routes: RouteObject[] = [
  {
    errorElement: <RouteErrorPage />,
    // Пока при первом открытии загружается код страницы
    hydrateFallbackElement: <LoadingScreen />,
    children: [
      // Только для вошедших: новые страницы кабинета добавляются сюда
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/', element: <HomePage /> },
          {
            path: '/map',
            lazy: page(() => import('@/pages/MapPage'), 'MapPage'),
          },
          {
            path: '/diagnosis',
            lazy: page(() => import('@/pages/DiagnosisPage'), 'DiagnosisPage'),
          },
          // Быстрая диагностика для мини-приложения Telegram (pr-088)
          {
            path: '/diagnosis/quick',
            lazy: page(
              () => import('@/pages/QuickDiagnosisPage'),
              'QuickDiagnosisPage',
            ),
          },
          {
            path: '/history',
            lazy: page(() => import('@/pages/HistoryPage'), 'HistoryPage'),
          },
          {
            path: '/regions',
            lazy: page(() => import('@/pages/RegionsPage'), 'RegionsPage'),
          },
          {
            path: '/compare',
            lazy: page(() => import('@/pages/ComparePage'), 'ComparePage'),
          },
          {
            path: '/alerts',
            lazy: page(() => import('@/pages/AlertsPage'), 'AlertsPage'),
          },
          {
            path: '/tips',
            lazy: page(() => import('@/pages/TipsPage'), 'TipsPage'),
          },
          {
            path: '/profile',
            lazy: page(() => import('@/pages/ProfilePage'), 'ProfilePage'),
          },
        ],
      },
      // Только для гостей
      {
        element: <GuestRoute />,
        children: [
          {
            path: '/login',
            lazy: page(() => import('@/pages/LoginPage'), 'LoginPage'),
          },
          {
            path: '/register',
            lazy: page(() => import('@/pages/RegisterPage'), 'RegisterPage'),
          },
          {
            path: '/forgot-password',
            lazy: page(
              () => import('@/pages/ForgotPasswordPage'),
              'ForgotPasswordPage',
            ),
          },
        ],
      },
      // Ссылка из письма открывается независимо от того, вошёл ли пользователь
      {
        path: '/reset-password',
        lazy: page(
          () => import('@/pages/ResetPasswordPage'),
          'ResetPasswordPage',
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
