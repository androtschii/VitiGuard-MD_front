import { Link, useLocation, useNavigate } from 'react-router'
import { useLogin } from '@/api/auth'
import { LoginForm } from '@/components/organisms/LoginForm'
import { AuthTemplate } from '@/components/templates/AuthTemplate'

type LoginLocationState = { registered?: boolean } | null

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { mutateAsync } = useLogin()
  const state = location.state as LoginLocationState

  return (
    <AuthTemplate
      title="Вход"
      footer={
        <>
          Нет аккаунта?{' '}
          <Link
            to="/register"
            className="font-medium text-emerald-800 underline"
          >
            Зарегистрироваться
          </Link>
        </>
      }
    >
      {state?.registered && (
        <p
          role="status"
          className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
        >
          Аккаунт создан. Войдите, используя email и пароль.
        </p>
      )}
      <LoginForm
        onSubmit={async (values) => {
          // Токены сохранит модуль авторизации (pr-014)
          await mutateAsync(values)
          await navigate('/', { replace: true })
        }}
      />
    </AuthTemplate>
  )
}
