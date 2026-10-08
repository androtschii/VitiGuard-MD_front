import { useNavigate } from 'react-router'
import { useLogin } from '@/api/auth'
import { LoginForm } from '@/components/organisms/LoginForm'
import { AuthTemplate } from '@/components/templates/AuthTemplate'

export function LoginPage() {
  const navigate = useNavigate()
  const { mutateAsync } = useLogin()

  return (
    <AuthTemplate title="Вход">
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
