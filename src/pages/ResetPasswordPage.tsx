import { Link, useNavigate, useSearchParams } from 'react-router'
import { useConfirmPasswordReset } from '@/api/auth'
import { ResetPasswordForm } from '@/components/organisms/ResetPasswordForm'
import { AuthTemplate } from '@/components/templates/AuthTemplate'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { mutateAsync } = useConfirmPasswordReset()
  const token = searchParams.get('token')

  if (!token) {
    return (
      <AuthTemplate title="Ссылка недействительна">
        <p className="text-sm text-stone-700">
          В адресе нет ключа для смены пароля. Откройте ссылку из письма целиком
          или{' '}
          <Link
            to="/forgot-password"
            className="font-medium text-emerald-800 underline"
          >
            запросите новую
          </Link>
          .
        </p>
      </AuthTemplate>
    )
  }

  return (
    <AuthTemplate
      title="Новый пароль"
      footer={
        <Link
          to="/forgot-password"
          className="font-medium text-emerald-800 underline"
        >
          Запросить новую ссылку
        </Link>
      }
    >
      <ResetPasswordForm
        onSubmit={async ({ password }) => {
          await mutateAsync({ token, password })
          await navigate('/login', { state: { passwordReset: true } })
        }}
      />
    </AuthTemplate>
  )
}
