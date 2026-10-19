import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useDeleteDiagnosis,
  useDiagnosisImage,
  type DiagnosisRecord,
} from '@/api/diagnoses'
import { Button } from '@/components/atoms/Button'
import { cn } from '@/lib/cn'
import { useObjectUrl } from '@/lib/useObjectUrl'

type DiagnosisCardProps = {
  record: DiagnosisRecord
}

// Проверка в галерее истории (pr-045): фото, диагноз, участок и дата
export function DiagnosisCard({ record }: DiagnosisCardProps) {
  const { t, i18n } = useTranslation()
  const image = useDiagnosisImage(record.id)
  const photoUrl = useObjectUrl(image.data)
  const remove = useDeleteDiagnosis()
  const [isConfirming, setIsConfirming] = useState(false)
  const percent = new Intl.NumberFormat(i18n.resolvedLanguage, {
    style: 'percent',
    maximumFractionDigits: 0,
  })
  const date = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const isHealthy = record.disease === 'healthy'

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
        <div className="mt-auto flex gap-2 pt-2">
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
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsConfirming(true)}
            >
              {t('history.delete')}
            </Button>
          )}
        </div>
        {remove.isError && (
          <p role="alert" className="text-xs text-danger">
            {t('history.deleteFailed')}
          </p>
        )}
      </div>
    </article>
  )
}
