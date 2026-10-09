import { Trans, useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useConfirmPasswordReset } from '@/api/auth'
import { ResetPasswordForm } from '@/components/organisms/ResetPasswordForm'
import { AuthTemplate } from '@/components/templates/AuthTemplate'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { mutateAsync } = useConfirmPasswordReset()
  const token = searchParams.get('token')
  const { t } = useTranslation()

  if (!token) {
    return (
      <AuthTemplate title={t('auth.reset.invalidTitle')}>
        <p className="text-sm text-ink-soft">
          <Trans
            i18nKey="auth.reset.invalidText"
            components={{
              request: (
                <Link
                  to="/forgot-password"
                  className="font-medium text-accent underline"
                />
              ),
            }}
          />
        </p>
      </AuthTemplate>
    )
  }

  return (
    <AuthTemplate
      title={t('auth.reset.title')}
      footer={
        <Link
          to="/forgot-password"
          className="font-medium text-accent underline"
        >
          {t('auth.reset.requestNew')}
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
