import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/atoms/Logo'

export function LoadingScreen() {
  const { t } = useTranslation()
  return (
    <main className="flex min-h-svh items-center justify-center bg-canvas">
      <div
        role="status"
        className="flex flex-col items-center gap-4 text-ink-muted"
      >
        <Logo className="size-20 motion-safe:animate-breathe" />
        <span>{t('common.loading')}</span>
      </div>
    </main>
  )
}
