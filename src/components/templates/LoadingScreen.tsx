import { useTranslation } from 'react-i18next'
import { GrapeFill } from '@/components/atoms/GrapeFill'

export function LoadingScreen() {
  const { t } = useTranslation()
  return (
    <main className="flex min-h-svh items-center justify-center bg-canvas">
      <div
        role="status"
        className="flex flex-col items-center gap-4 text-ink-muted"
      >
        <GrapeFill className="size-24" />
        <span>{t('common.loading')}</span>
      </div>
    </main>
  )
}
