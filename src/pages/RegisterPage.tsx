import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { useRegister } from '@/api/auth'
import { RegisterForm } from '@/components/organisms/RegisterForm'
import { AuthTemplate } from '@/components/templates/AuthTemplate'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutateAsync } = useRegister()

  useDocumentTitle(t('auth.register.title'))

  return (
    <AuthTemplate
      title={t('auth.register.title')}
      footer={
        <span className="flex flex-col items-center gap-2">
          <span>
            {t('auth.register.haveAccount')}{' '}
            <Link to="/login" className="font-medium text-accent underline">
              {t('auth.register.login')}
            </Link>
          </span>
          <Link to="/privacy" className="text-xs text-ink-muted underline">
            {t('privacy.title')}
          </Link>
        </span>
      }
    >
      <RegisterForm
        onSubmit={async (values) => {
          await mutateAsync(values)
          // Сообщение «Аккаунт создан» показывает страница входа
          await navigate('/login', { state: { registered: true } })
        }}
      />
    </AuthTemplate>
  )
}
