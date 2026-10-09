import { useTranslation } from 'react-i18next'
import { useLogout } from '@/api/auth'
import { Button } from '@/components/atoms/Button'
import { Logo } from '@/components/atoms/Logo'
import { ApiStatus } from '@/components/organisms/ApiStatus'
import { CenteredTemplate } from '@/components/templates/CenteredTemplate'

export function HomePage() {
  const { t } = useTranslation()
  const { mutate: logout, isPending } = useLogout()

  return (
    <CenteredTemplate>
      <Logo className="size-16" />
      <h1 className="text-4xl font-semibold text-accent">VitiGuard MD</h1>
      <p className="max-w-md text-ink-muted">{t('home.description')}</p>
      <ApiStatus />
      <Button
        variant="secondary"
        isLoading={isPending}
        onClick={() => logout()}
      >
        {t('common.logout')}
      </Button>
    </CenteredTemplate>
  )
}
