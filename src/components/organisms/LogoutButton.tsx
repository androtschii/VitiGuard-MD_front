import { useTranslation } from 'react-i18next'
import { useLogout } from '@/api/auth'
import { Button } from '@/components/atoms/Button'

export function LogoutButton() {
  const { t } = useTranslation()
  const { mutate: logout, isPending } = useLogout()

  return (
    <Button
      variant="secondary"
      size="sm"
      isLoading={isPending}
      onClick={() => logout()}
    >
      {t('common.logout')}
    </Button>
  )
}
