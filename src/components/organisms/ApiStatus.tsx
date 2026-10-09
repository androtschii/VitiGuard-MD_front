import { useTranslation } from 'react-i18next'
import { useApiInfo } from '@/api/info'

export function ApiStatus() {
  const { t } = useTranslation()
  const { data, isPending, isError } = useApiInfo()

  if (isPending) {
    return (
      <p role="status" className="text-sm text-stone-500">
        {t('api.connecting')}
      </p>
    )
  }
  if (isError) {
    return (
      <p role="status" className="text-sm text-red-700">
        {t('api.unavailable')}
      </p>
    )
  }
  return (
    <p role="status" className="text-sm text-stone-500">
      {t('api.status', {
        version: data.version,
        environment: data.environment,
      })}
    </p>
  )
}
