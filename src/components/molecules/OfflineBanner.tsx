import { useTranslation } from 'react-i18next'
import { useOnlineStatus } from '@/lib/useOnlineStatus'

// Полоса под шапкой, пока нет сети: что работает и что нет
export function OfflineBanner() {
  const { t } = useTranslation()
  const isOnline = useOnlineStatus()

  if (isOnline) return null
  return (
    <p
      role="status"
      className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
    >
      {t('network.offline')}
    </p>
  )
}
