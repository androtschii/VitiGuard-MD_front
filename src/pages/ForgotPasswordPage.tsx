import { Trans, useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Link } from 'react-router'
import { useRequestPasswordReset } from '@/api/auth'
import { ForgotPasswordForm } from '@/components/organisms/ForgotPasswordForm'
import { AuthTemplate } from '@/components/templates/AuthTemplate'

export function ForgotPasswordPage() {
  const { mutateAsync } = useRequestPasswordReset()
  const [sentTo, setSentTo] = useState<string | null>(null)
  const { t } = useTranslation()

  const backToLogin = (
    <Link to="/login" className="font-medium text-accent underline">
      {t('auth.forgot.backToLogin')}
    </Link>
  )

  return (
    <AuthTemplate title={t('auth.forgot.title')} footer={backToLogin}>
      {sentTo === null ? (
        <ForgotPasswordForm
          onSubmit={async (values) => {
            await mutateAsync(values)
            setSentTo(values.email)
          }}
        />
      ) : (
        // Текст не подтверждает, что такой аккаунт есть: сервер отвечает одинаково
        // в любом случае, иначе по форме можно было бы узнавать зарегистрированные email
        <p role="status" className="text-sm text-ink-soft">
          <Trans
            i18nKey="auth.forgot.sent"
            values={{ email: sentTo }}
            components={{ strong: <strong /> }}
          />
        </p>
      )}
    </AuthTemplate>
  )
}
