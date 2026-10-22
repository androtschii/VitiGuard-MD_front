import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useDiagnose } from '@/api/diagnosis'
import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'
import { DiagnosisResult } from '@/components/organisms/DiagnosisResult'
import { LeafUpload } from '@/components/organisms/LeafUpload'
import { useTelegramStore } from '@/lib/telegram'
import { useTelegramMainButton } from '@/lib/useTelegramMainButton'

// Быстрая диагностика (pr-088): экран для мини-приложения Telegram — одно
// фото, один ответ, без навигации кабинета. Проверка сохраняется в историю,
// подробности (тепловая карта, участок) — в полной версии
export function QuickDiagnosisPage() {
  const { t } = useTranslation()
  const telegram = useTelegramStore((state) => state.webApp)
  const [file, setFile] = useState<File | null>(null)
  const diagnose = useDiagnose()
  const analyze = () => {
    if (file) diagnose.mutate({ image: file, save: true })
  }

  useTelegramMainButton(telegram, {
    text: t('quick.analyze'),
    visible: Boolean(file) && !diagnose.isSuccess,
    loading: diagnose.isPending,
    onClick: analyze,
  })

  // Ответ ощущается рукой: телефон в поле часто держат, не глядя на экран
  useEffect(() => {
    const haptic = telegram?.HapticFeedback
    if (diagnose.isSuccess)
      haptic?.notificationOccurred(
        diagnose.data.disease === 'healthy' ? 'success' : 'warning',
      )
    if (diagnose.isError) haptic?.notificationOccurred('error')
  }, [telegram, diagnose.isSuccess, diagnose.isError, diagnose.data])

  const choose = (picked: File) => {
    setFile(picked)
    diagnose.reset()
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-4 bg-canvas p-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">{t('quick.title')}</h1>
        <p className="text-sm text-ink-muted">{t('quick.intro')}</p>
      </div>
      <LeafUpload file={file} onSelect={choose} onCrop={choose} />
      {!telegram && (
        <Button
          className="w-full"
          disabled={!file || diagnose.isSuccess}
          isLoading={diagnose.isPending}
          onClick={analyze}
        >
          {t('quick.analyze')}
        </Button>
      )}
      <div aria-live="polite" className="flex flex-col gap-3">
        {diagnose.isPending && (
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <Spinner className="text-accent" />
            {t('diagnosis.analyzing')}
          </p>
        )}
        {diagnose.isError && (
          <p role="alert" className="text-sm text-danger">
            {diagnose.error.message}
          </p>
        )}
        {diagnose.isSuccess && (
          <>
            <DiagnosisResult diagnosis={diagnose.data} />
            <p className="text-sm text-ink-soft">
              {t('quick.saved')}{' '}
              <Link to="/history" className="text-accent underline">
                {t('quick.history')}
              </Link>
            </p>
          </>
        )}
      </div>
      <Link
        to="/"
        className="mt-auto text-center text-sm text-accent underline"
      >
        {t('quick.fullApp')}
      </Link>
    </main>
  )
}
