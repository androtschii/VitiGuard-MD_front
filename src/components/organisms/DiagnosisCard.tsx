import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  fetchLesionMask,
  useDeleteDiagnosis,
  useDiagnosisImage,
  type DiagnosisRecord,
} from '@/api/diagnoses'
import { useMe } from '@/api/users'
import { Button } from '@/components/atoms/Button'
import { ReviewDialog } from '@/components/organisms/ReviewDialog'
import { cn } from '@/lib/cn'
import { diagnosisPdf, reportFileName } from '@/lib/diagnosisReport'
import { saveBlob } from '@/lib/mapImage'
import { share, shareText } from '@/lib/share'
import { useObjectUrl } from '@/lib/useObjectUrl'

type DiagnosisCardProps = {
  record: DiagnosisRecord
}

type CardAction = 'pdf' | 'share'

// Проверка в галерее истории (pr-045): фото, диагноз, участок и дата
export function DiagnosisCard({ record }: DiagnosisCardProps) {
  const { t, i18n } = useTranslation()
  const image = useDiagnosisImage(record.id)
  const photoUrl = useObjectUrl(image.data)
  const remove = useDeleteDiagnosis()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [busy, setBusy] = useState<CardAction | null>(null)
  const [failed, setFailed] = useState<CardAction | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  // Заключение дают агроном и администратор (pr-044)
  const { data: me } = useMe()
  const canReview = me?.role === 'agronomist' || me?.role === 'admin'
  const review = record.review
  const percent = new Intl.NumberFormat(i18n.resolvedLanguage, {
    style: 'percent',
    maximumFractionDigits: 0,
  })
  const date = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const isHealthy = record.disease === 'healthy'
  const photo = image.data

  // Карточка в PDF — и для скачивания, и чтобы поделиться файлом
  const run = async (action: CardAction, file: Blob) => {
    setBusy(action)
    setFailed(null)
    setIsCopied(false)
    try {
      const lesion = record.overlays.includes('lesion')
        ? await fetchLesionMask(record.id)
        : null
      const language = i18n.resolvedLanguage
      const pdf = await diagnosisPdf(record, file, lesion, t, language)
      const name = reportFileName(record)
      if (action === 'pdf') {
        saveBlob(pdf, name)
      } else {
        const outcome = await share(
          t('report.title'),
          shareText(record, t, language),
          new File([pdf], name, { type: pdf.type }),
        )
        setIsCopied(outcome === 'copied')
      }
    } catch {
      setFailed(action)
    } finally {
      setBusy(null)
    }
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
      <div className="aspect-square bg-muted">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={t('history.photo', {
              disease: t(`diseases.${record.disease}`),
            })}
            className="size-full object-cover"
          />
        ) : (
          <p className="flex size-full items-center justify-center p-3 text-center text-xs text-ink-subtle">
            {image.isError ? t('history.photoMissing') : t('common.loading')}
          </p>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 text-sm">
        <h3
          className={cn(
            'font-semibold',
            isHealthy
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-danger',
          )}
        >
          {t(`diseases.${record.disease}`)}
        </h3>
        <p className="text-ink-muted">
          {t('diagnosis.confidence', {
            value: percent.format(record.confidence),
          })}
        </p>
        <p className="text-ink-soft">
          {record.vineyard_name ?? t('history.noPlot')}
        </p>
        <p className="text-xs text-ink-subtle">
          <time dateTime={record.created_at}>
            {date.format(new Date(record.created_at))}
          </time>
        </p>
        {review && (
          <div className="mt-1 rounded-md border border-line bg-muted/40 p-2 text-xs text-ink-soft">
            <p className="font-medium text-ink">
              {review.disease === record.disease
                ? t('review.confirmed', {
                    reviewer: review.reviewer ?? t('review.expert'),
                  })
                : t('review.corrected', {
                    reviewer: review.reviewer ?? t('review.expert'),
                    disease: t(`diseases.${review.disease}`),
                  })}
            </p>
            {review.comment && <p>{review.comment}</p>}
          </div>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {isConfirming ? (
            <>
              <Button
                size="sm"
                variant="danger"
                isLoading={remove.isPending}
                onClick={() => remove.mutate(record.id)}
              >
                {t('history.confirmDelete')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsConfirming(false)}
              >
                {t('history.cancel')}
              </Button>
            </>
          ) : (
            <>
              {canReview && (
                <Button size="sm" onClick={() => setIsReviewing(true)}>
                  {t('review.open')}
                </Button>
              )}
              {photo && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    aria-label={t('report.save')}
                    isLoading={busy === 'pdf'}
                    disabled={busy !== null}
                    onClick={() => void run('pdf', photo)}
                  >
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    isLoading={busy === 'share'}
                    disabled={busy !== null}
                    onClick={() => void run('share', photo)}
                  >
                    {t('share.open')}
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsConfirming(true)}
              >
                {t('history.delete')}
              </Button>
            </>
          )}
        </div>
        {remove.isError && (
          <p role="alert" className="text-xs text-danger">
            {t('history.deleteFailed')}
          </p>
        )}
        {failed && (
          <p role="alert" className="text-xs text-danger">
            {t(failed === 'pdf' ? 'report.failed' : 'share.failed')}
          </p>
        )}
        <p role="status" className="text-xs text-accent empty:hidden">
          {isCopied ? t('share.copied') : ''}
        </p>
      </div>
      {/* Окно — только открытым: при каждом открытии оно начинается с текущего
          заключения */}
      {isReviewing && (
        <ReviewDialog
          record={record}
          open
          onClose={() => setIsReviewing(false)}
        />
      )}
    </article>
  )
}
