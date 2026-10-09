import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { useRegister } from '@/api/auth'
import { RegisterForm } from '@/components/organisms/RegisterForm'
import { AuthTemplate } from '@/components/templates/AuthTemplate'

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutateAsync } = useRegister()

  return (
    <AuthTemplate
      title={t('auth.register.title')}
      footer={
        <>
          {t('auth.register.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-emerald-800 underline">
            {t('auth.register.login')}
          </Link>
        </>
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
