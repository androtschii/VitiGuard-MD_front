import { useTranslation } from 'react-i18next'
import { useDemoLogin, type DemoRole } from '@/api/auth'
import { useApiInfo } from '@/api/info'
import { Button } from '@/components/atoms/Button'

const ROLES: DemoRole[] = ['user', 'agronomist', 'admin']

// Кнопки входа в роль одним нажатием — для показа проекта. Видны, только если
// сервер сообщил, что демо-вход включён: в production его нет
export function DemoLogin() {
  const { t } = useTranslation()
  const info = useApiInfo()
  const demo = useDemoLogin()

  if (!info.data?.demo_login) return null

  return (
    <section
      aria-labelledby="demo-login"
      className="mt-4 rounded-lg border border-dashed border-line-strong bg-muted/40 p-4"
    >
      <h2 id="demo-login" className="text-sm font-medium text-ink">
        {t('auth.demo.title')}
      </h2>
      <p className="mt-1 text-xs text-ink-muted">{t('auth.demo.hint')}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {ROLES.map((role) => (
          <Button
            key={role}
            size="sm"
            variant="secondary"
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
