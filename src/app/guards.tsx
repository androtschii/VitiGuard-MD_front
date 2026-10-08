import { Navigate, Outlet, useLocation } from 'react-router'
import { LoadingScreen } from '@/components/templates/LoadingScreen'
import { useSessionStore } from '@/store/session'

type FromState = { from?: unknown } | null

// Адрес для возврата допускается только внутри приложения: «//сайт.рф» или
// «https://…» превратили бы страницу входа в способ отправить пользователя на чужой сайт
function getReturnPath(state: unknown) {
  const from = (state as FromState)?.from
  return typeof from === 'string' &&
    from.startsWith('/') &&
    !from.startsWith('//')
    ? from
    : '/'
}

// Страницы только для вошедших. Пока сессия восстанавливается после загрузки
// страницы (refresh-запрос ещё не завершён), показывается загрузка: иначе вошедшего
// пользователя на мгновение перекинуло бы на вход
export function ProtectedRoute() {
  const status = useSessionStore((state) => state.status)
  const location = useLocation()

  if (status === 'unknown') return <LoadingScreen />
  if (status === 'anonymous') {
    // После входа пользователь вернётся на страницу, которую открывал
    const from = location.pathname + location.search
    return <Navigate to="/login" replace state={{ from }} />
  }
  return <Outlet />
}

// Вход, регистрация и восстановление пароля нужны только тем, кто не вошёл:
// вошедшего уводят на страницу, с которой его перекинуло на вход, или на главную
export function GuestRoute() {
  const status = useSessionStore((state) => state.status)
  const location = useLocation()

  if (status === 'unknown') return <LoadingScreen />
  if (status === 'authenticated') {
    return <Navigate to={getReturnPath(location.state)} replace />
  }
  return <Outlet />
}
