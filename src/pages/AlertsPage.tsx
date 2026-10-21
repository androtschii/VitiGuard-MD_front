import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAlerts, useReadAllAlerts } from '@/api/alerts'
import { useNavItems } from '@/app/navigation'
import { Button } from '@/components/atoms/Button'
import { AlertItem } from '@/components/molecules/AlertItem'
import { CardSkeleton } from '@/components/molecules/CardSkeleton'
import { Pagination } from '@/components/molecules/Pagination'
import { SegmentedControl } from '@/components/molecules/SegmentedControl'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'

// Предупреждения о риске и их история (pr-064)
export function AlertsPage() {
  const { t } = useTranslation()
  const navItems = useNavItems()
  const [unread, setUnread] = useState(true)
  const [page, setPage] = useState(1)
  const alerts = useAlerts(unread, page)
  const readAll = useReadAllAlerts()

  return (
    <DashboardTemplate navItems={navItems} headerActions={<LogoutButton />}>
      <div className="flex max-w-3xl flex-col gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">
            {t('alerts.title')}
          </h1>
          <p className="text-sm text-ink-muted">{t('alerts.intro')}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SegmentedControl
            label={t('alerts.filter')}
            value={unread ? 'unread' : 'all'}
            onChange={(value) => {
              setUnread(value === 'unread')
              setPage(1)
            }}
            options={[
              { value: 'unread', label: t('alerts.unread') },
              { value: 'all', label: t('alerts.all') },
            ]}
          />
          <Button
            size="sm"
            variant="secondary"
            isLoading={readAll.isPending}
            disabled={!alerts.data?.items.some((alert) => !alert.read_at)}
            onClick={() => readAll.mutate()}
          >
            {t('alerts.markAllRead')}
          </Button>
        </div>
        <div aria-live="polite">
          {alerts.isPending ? (
            <CardSkeleton />
          ) : alerts.isError ? (
            <p role="alert" className="text-sm text-danger">
              {t('alerts.loadError')}
            </p>
          ) : alerts.data.total === 0 ? (
            <p className="text-sm text-ink-muted">
              {unread ? t('alerts.noneUnread') : t('alerts.none')}
            </p>
          ) : (
            <>
              <ul
                aria-label={t('alerts.title')}
                className="flex flex-col gap-2"
              >
                {alerts.data.items.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </ul>
              <div className="mt-4">
                <Pagination
                  page={page}
                  pageCount={alerts.data.pages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardTemplate>
  )
}
