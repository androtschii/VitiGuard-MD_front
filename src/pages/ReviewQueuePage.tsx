import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError } from '@/api/client'
import { useReviewQueue } from '@/api/diagnoses'
import { useNavItems } from '@/app/navigation'
import { CardSkeleton } from '@/components/molecules/CardSkeleton'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Pagination } from '@/components/molecules/Pagination'
import { DiagnosisCard } from '@/components/organisms/DiagnosisCard'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'
import { cn } from '@/lib/cn'

const TABS = [
  { reviewed: false, labelKey: 'reviewQueue.waiting' },
  { reviewed: true, labelKey: 'reviewQueue.done' },
] as const

// Очередь агронома: проверки всех виноградарей. Заключение даётся прямо на
// карточке — тем же блоком, что в истории
export function ReviewQueuePage() {
  const { t } = useTranslation()
  const navItems = useNavItems()
  const [reviewed, setReviewed] = useState(false)
  const [page, setPage] = useState(1)
  const queue = useReviewQueue(reviewed, page)
  const forbidden =
    queue.error instanceof ApiError && queue.error.status === 403

  return (
    <DashboardTemplate navItems={navItems} headerActions={<LogoutButton />}>
      <h1 className="mb-1 text-xl font-semibold text-ink">
        {t('reviewQueue.title')}
      </h1>
      <p className="mb-4 max-w-2xl text-sm text-ink-muted">
        {t('reviewQueue.intro')}
      </p>
      <div
        role="tablist"
        aria-label={t('reviewQueue.tabs')}
        className="mb-4 inline-flex rounded-lg border border-line bg-muted/60 p-1"
      >
        {TABS.map((tab) => (
          <button
            key={tab.labelKey}
            type="button"
            role="tab"
            aria-selected={reviewed === tab.reviewed}
            onClick={() => {
              setReviewed(tab.reviewed)
              setPage(1)
            }}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              reviewed === tab.reviewed
                ? 'bg-surface text-ink shadow-sm'
                : 'text-ink-muted hover:text-ink',
            )}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {queue.isPending ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : queue.isError ? (
        <p role="alert" className="text-sm text-danger">
          {forbidden ? t('reviewQueue.forbidden') : queue.error.message}
        </p>
      ) : queue.data.items.length === 0 ? (
        reviewed ? (
          <EmptyState icon="search" title={t('reviewQueue.emptyDone')} />
        ) : (
          <EmptyState
            icon="leaf"
            title={t('reviewQueue.emptyWaiting')}
            hint={t('reviewQueue.emptyWaitingHint')}
          />
        )
      ) : (
        <>
          <p className="mb-3 text-sm text-ink-muted">
            {t('reviewQueue.count', { count: queue.data.total })}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {queue.data.items.map((record) => (
              <DiagnosisCard key={record.id} record={record} />
            ))}
          </div>
          <div className="mt-4">
            <Pagination
              page={page}
              pageCount={queue.data.pages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </DashboardTemplate>
  )
}
