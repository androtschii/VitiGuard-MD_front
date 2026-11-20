import { useTranslation } from 'react-i18next'
import { useDemoLogin, type DemoRole } from '@/api/auth'
import { Button } from '@/components/atoms/Button'

const ROLES: DemoRole[] = ['user', 'agronomist', 'admin']

type DemoLoginProps = {
  // Включается при сборке стенда (.env.local): страница входа гостя не ходит
  // на сервер заранее. Разрешён ли демо-вход, всё равно решает сервер
  enabled?: boolean
}

// Кнопки входа в роль одним нажатием — для показа проекта
export function DemoLogin({
  enabled = import.meta.env.VITE_DEMO_LOGIN === 'true',
}: DemoLoginProps) {
  const { t } = useTranslation()
  const demo = useDemoLogin()

  if (!enabled) return null

  return (
    <section
      aria-labelledby="demo-login"
      className="mt-6 border-t border-line pt-4"
    >
      <h2 id="demo-login" className="text-sm font-medium text-ink">
        {t('auth.demo.title')}
      </h2>
      <p className="mt-1 text-xs text-ink-muted">{t('auth.demo.hint')}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {ROLES.map((role) => (
          <Button
            key={role}
            size="sm"
            variant="secondary"
            className="min-w-0 flex-1"
            isLoading={demo.isPending && demo.variables === role}
            disabled={demo.isPending}
            onClick={() => demo.mutate(role)}
          >
            {t(`auth.roles.${role}`)}
          </Button>
        ))}
      </div>
      {demo.isError && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {demo.error.message}
        </p>
      )}
    </section>
  )
}
