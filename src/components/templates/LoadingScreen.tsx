import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/atoms/Spinner'

export function LoadingScreen() {
  const { t } = useTranslation()
  return (
    <main className="flex min-h-svh items-center justify-center bg-canvas">
      <div role="status" className="flex items-center gap-3 text-ink-muted">
        <Spinner className="size-6 text-accent" />
        <span>{t('common.loading')}</span>
      </div>
    </main>
  )
}
