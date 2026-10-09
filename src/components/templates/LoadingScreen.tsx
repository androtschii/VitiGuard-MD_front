import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/atoms/Spinner'

export function LoadingScreen() {
  const { t } = useTranslation()
  return (
    <main className="flex min-h-svh items-center justify-center bg-stone-50">
      <div role="status" className="flex items-center gap-3 text-stone-600">
        <Spinner className="size-6 text-emerald-700" />
        <span>{t('common.loading')}</span>
      </div>
    </main>
  )
}
