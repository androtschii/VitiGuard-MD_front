import { Link, useLocation } from 'react-router'
import { useLogin } from '@/api/auth'
import { LoginForm } from '@/components/organisms/LoginForm'
import { AuthTemplate } from '@/components/templates/AuthTemplate'

type LoginLocationState = {
  registered?: boolean
  passwordReset?: boolean
} | null

function getNotice(state: LoginLocationState) {
  if (state?.registered) {
    return 'Аккаунт создан. Войдите, используя email и пароль.'
  }
  if (state?.passwordReset) {
    return 'Пароль изменён. Войдите с новым паролем.'
  }
  return null
}

const linkClass = 'font-medium text-emerald-800 underline'

export function LoginPage() {
  const location = useLocation()
  const { mutateAsync } = useLogin()
  const notice = getNotice(location.state as LoginLocationState)

  return (
    <AuthTemplate
      title="Вход"
      footer={
        <>
          Нет аккаунта?{' '}
          <Link to="/register" className={linkClass}>
            Зарегистрироваться
          </Link>
        </>
      }
    >
      {notice && (
        <p
          role="status"
          className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
        >
          {notice}
        </p>
      )}
      <LoginForm
        onSubmit={async (values) => {
          // После входа GuestRoute сам перенаправит на нужную страницу
          await mutateAsync(values)
        }}
      />
      <p className="mt-4 text-center text-sm">
        <Link to="/forgot-password" className={linkClass}>
          Забыли пароль?
        </Link>
      </p>
    </AuthTemplate>
  )
}
