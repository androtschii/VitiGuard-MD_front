import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useDeleteVineCheck,
  useVineCheckImage,
  useVineChecks,
  type VineCheck,
} from '@/api/vine'
import { Button } from '@/components/atoms/Button'
import { CardSkeleton } from '@/components/molecules/CardSkeleton'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Pagination } from '@/components/molecules/Pagination'
import { VineOverlay } from '@/components/organisms/VineOverlay'
import { useObjectUrl } from '@/lib/useObjectUrl'

function VineCheckCard({ check }: { check: VineCheck }) {
  const { t, i18n } = useTranslation()
  const image = useVineCheckImage(check.id)
  const photoUrl = useObjectUrl(image.data)
  const remove = useDeleteVineCheck()
  const [confirming, setConfirming] = useState(false)
  const date = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
      {photoUrl ? (
        <VineOverlay photoUrl={photoUrl} detections={check.detections} />
      ) : (
        <div className="aspect-video animate-pulse bg-muted" />
      )}
      <div className="flex flex-1 flex-col gap-1 p-3 text-sm">
        <p className="font-semibold text-ink">
          {t('vine.count.trunk', { count: check.trunks })} ·{' '}
          {t('vine.count.bunch', { count: check.bunches })}
        </p>
        <p className="text-ink-soft">
          {check.vineyard_name ?? t('history.noPlot')}
        </p>
        <p className="text-xs text-ink-subtle">
          <time dateTime={check.created_at}>
            {date.format(new Date(check.created_at))}
          </time>
        </p>
        <div className="mt-auto flex gap-2 pt-2">
          {confirming ? (
            <>
              <Button
                size="sm"
                variant="danger"
                isLoading={remove.isPending}
                onClick={() => remove.mutate(check.id)}
              >
                {t('history.confirmDelete')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setConfirming(false)}
              >
                {t('history.cancel')}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setConfirming(true)}
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

// История анализов фото ряда: стволы и грозди поверх сохранённого фото
export function VineHistory() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const checks = useVineChecks(page)

  if (checks.isPending)
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    )
  if (checks.isError)
    return (
      <p role="alert" className="text-sm text-danger">
        {checks.error.message}
      </p>
    )
  if (checks.data.items.length === 0)
    return (
      <EmptyState
        icon="leaf"
        title={t('vineHistory.empty')}
        hint={t('vineHistory.emptyHint')}
      />
    )
  return (
    <>
      <p className="mb-3 text-sm text-ink-muted">
        {t('history.count', { count: checks.data.total })}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {checks.data.items.map((check) => (
          <VineCheckCard key={check.id} check={check} />
        ))}
      </div>
      <div className="mt-4">
        <Pagination
          page={page}
          pageCount={checks.data.pages}
          onPageChange={setPage}
        />
      </div>
    </>
  )
}
