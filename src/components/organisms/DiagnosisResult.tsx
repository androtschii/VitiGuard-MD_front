import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { Diagnosis } from '@/api/diagnosis'
import { Button } from '@/components/atoms/Button'
import { CountUp } from '@/components/atoms/CountUp'
import { Ring } from '@/components/atoms/Ring'
import { DownloadButton } from '@/components/molecules/DownloadButton'
import { cn } from '@/lib/cn'
import { diagnosisToRecord, useDiagnosisExport } from '@/lib/useDiagnosisExport'
import { DiseaseInfo } from './DiseaseInfo'

type DiagnosisResultProps = {
  diagnosis: Diagnosis
  photo?: Blob | null
  vineyardName?: string | null
}

export function DiagnosisResult({
  diagnosis,
  photo,
  vineyardName,
}: DiagnosisResultProps) {
  const { t, i18n } = useTranslation()
  const record = useMemo(
    () => diagnosisToRecord(diagnosis, vineyardName),
    [diagnosis, vineyardName],
  )
  const { busy, failed, isCopied, run } = useDiagnosisExport(record)
  const percent = new Intl.NumberFormat(i18n.language, {
    style: 'percent',
    maximumFractionDigits: 0,
  })
  const isHealthy = diagnosis.disease === 'healthy'

  // Модель знает только болезни винограда и на любом снимке выбрала бы одну
  // из них: для чужого снимка диагноз не показывается
  if (diagnosis.grape_leaf === false) {
    return (
      <div
        role="alert"
        className="flex flex-col gap-1 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 motion-safe:animate-rise dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
      >
        <p className="text-base font-semibold">
          {t('diagnosis.notALeafTitle')}
        </p>
        <p>{t('diagnosis.notALeaf')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 motion-safe:animate-rise">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ink-subtle">{t('diagnosis.verdict')}</p>
          {diagnosis.low_confidence ? (
            <>
              <p className="text-2xl font-semibold text-ink">
                {t('diagnosis.uncertain')}
              </p>
              <p className="text-sm text-ink-muted">
                {t('diagnosis.mostLikely', {
                  disease: t(`diseases.${diagnosis.disease}`),
                })}
              </p>
            </>
          ) : (
            <p
              className={cn(
                'text-2xl font-semibold',
                // Зелёный — растительность, как участки на карте; болезнь — красный
                isHealthy
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-danger',
              )}
            >
              {t(`diseases.${diagnosis.disease}`)}
            </p>
          )}
          <p className="text-sm text-ink-muted">
            {t('diagnosis.confidence', {
              value: percent.format(diagnosis.confidence),
            })}
          </p>
        </div>
        <Ring
          className="size-20"
          segments={[
            {
              percent: diagnosis.confidence * 100,
              className: diagnosis.low_confidence
                ? 'stroke-amber-500'
                : isHealthy
                  ? 'stroke-emerald-600 dark:stroke-emerald-400'
                  : 'stroke-red-600 dark:stroke-red-400',
            },
          ]}
        >
          <span
            aria-hidden="true"
            className="text-sm font-semibold text-ink tabular-nums"
          >
            <CountUp
              value={diagnosis.confidence}
              format={(value) => percent.format(value)}
            />
          </span>
        </Ring>
      </div>

      {diagnosis.low_confidence && (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          {t('diagnosis.lowConfidence')}
        </p>
      )}

      <section aria-labelledby="diagnosis-probabilities">
        <h3
          id="diagnosis-probabilities"
          className="mb-2 text-sm font-semibold text-ink"
        >
          {t('diagnosis.probabilities')}
        </h3>
        <ul className="flex flex-col gap-2">
          {diagnosis.top.map(({ disease, probability }, index) => (
            <li key={disease} className="text-sm">
              <div className="flex justify-between gap-2 text-ink-soft">
                <span>{t(`diseases.${disease}`)}</span>
                <span className="tabular-nums">
                  {percent.format(probability)}
                </span>
              </div>
              {/* Полоса дублирует число, поэтому скрыта от экранного диктора */}
              <div
                aria-hidden="true"
                className="mt-1 h-2 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className={cn(
                    'h-full origin-left rounded-full motion-safe:animate-fill',
                    index === 0 ? 'bg-brand-600' : 'bg-brand-300',
                  )}
                  style={{ width: `${Math.max(probability * 100, 1)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <DiseaseInfo disease={diagnosis.disease} />

      <p className="text-xs text-ink-subtle">
        {t('diagnosis.model', { name: diagnosis.model })}
        <br />
        {t('diagnosis.disclaimer')}
      </p>

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-2">
        {photo && (
          <>
            <DownloadButton
              size="sm"
              variant="secondary"
              aria-label={t('report.save')}
              className="px-2.5"
              isLoading={busy === 'pdf'}
              failed={failed === 'pdf'}
              disabled={busy !== null}
              onClick={() => void run('pdf', photo)}
            >
              PDF
            </DownloadButton>
            <Button
              size="sm"
              variant="secondary"
              title={t('share.open')}
              aria-label={t('share.open')}
              className="px-2.5"
              isLoading={busy === 'share'}
              disabled={busy !== null}
              onClick={() => void run('share', photo)}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM18 16a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
              </svg>
              <span className="sr-only">{t('share.open')}</span>
            </Button>
          </>
        )}
        <Link
          to="/history"
          className="hover:text-accent-hover text-sm font-medium text-accent underline"
        >
          {t('diagnosis.openHistory')}
        </Link>
      </div>

      {failed && (
        <p role="alert" className="text-xs text-danger">
          {t(failed === 'pdf' ? 'report.failed' : 'share.failed')}
        </p>
      )}
      <p role="status" className="text-xs text-accent empty:hidden">
        {isCopied ? t('share.copied') : ''}
      </p>
    </div>
  )
}
