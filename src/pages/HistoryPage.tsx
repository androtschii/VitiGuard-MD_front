import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { DISEASES } from '@/api/diagnosis'
import { useDiagnoses, type DiagnosisFilters } from '@/api/diagnoses'
import { useVineyards } from '@/api/vineyards'
import { useNavItems } from '@/app/navigation'
import { Input } from '@/components/atoms/Input'
import { Select } from '@/components/atoms/Select'
import { CardSkeleton } from '@/components/molecules/CardSkeleton'
import { Pagination } from '@/components/molecules/Pagination'
import { DiagnosisCard } from '@/components/organisms/DiagnosisCard'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'

// История проверок по фото (pr-045) с фильтрами по болезни, участку и
// датам (pr-046)
export function HistoryPage() {
  const { t } = useTranslation()
  const navItems = useNavItems()
  const ids = { disease: useId(), plot: useId(), from: useId(), to: useId() }
  const [filters, setFilters] = useState<DiagnosisFilters>({})
  const [page, setPage] = useState(1)
  const history = useDiagnoses(filters, page)
  const { data: vineyards = [] } = useVineyards()
  const isFiltered = Object.values(filters).some(Boolean)

  // Новые условия — с первой страницы
  const change = (patch: DiagnosisFilters) => {
    setFilters((current) => ({ ...current, ...patch }))
    setPage(1)
  }

  return (
    <DashboardTemplate navItems={navItems} headerActions={<LogoutButton />}>
      <h1 className="mb-1 text-xl font-semibold text-ink">
        {t('history.title')}
      </h1>
      <p className="mb-4 max-w-2xl text-sm text-ink-muted">
        {t('history.intro')}
      </p>

      <form
        aria-label={t('history.filters')}
        onSubmit={(event) => event.preventDefault()}
        className="mb-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor={ids.disease} className="text-ink-soft">
            {t('history.disease')}
          </label>
          <Select
            id={ids.disease}
            value={filters.disease ?? ''}
            onChange={(event) =>
              change({
                disease: event.target.value as DiagnosisFilters['disease'],
              })
            }
          >
            <option value="">{t('history.any')}</option>
            {DISEASES.map((disease) => (
              <option key={disease} value={disease}>
                {t(`diseases.${disease}`)}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={ids.plot} className="text-ink-soft">
            {t('history.plot')}
          </label>
          <Select
            id={ids.plot}
            value={filters.vineyardId ?? ''}
            onChange={(event) => change({ vineyardId: event.target.value })}
          >
            <option value="">{t('history.any')}</option>
            {vineyards.map((vineyard) => (
              <option key={vineyard.id} value={vineyard.id}>
                {vineyard.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={ids.from} className="text-ink-soft">
            {t('history.from')}
          </label>
          <Input
            id={ids.from}
            type="date"
            value={filters.dateFrom ?? ''}
            max={filters.dateTo || undefined}
            onChange={(event) => change({ dateFrom: event.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={ids.to} className="text-ink-soft">
            {t('history.to')}
          </label>
          <Input
            id={ids.to}
            type="date"
            value={filters.dateTo ?? ''}
            min={filters.dateFrom || undefined}
            onChange={(event) => change({ dateTo: event.target.value })}
          />
        </div>
      </form>

      <div aria-live="polite">
        {history.isPending ? (
          <CardSkeleton />
        ) : history.isError ? (
          <p role="alert" className="text-sm text-danger">
            {t('history.loadError')}
          </p>
        ) : history.data.total === 0 ? (
          <p className="text-sm text-ink-muted">
            {isFiltered ? (
              t('history.nothingFound')
            ) : (
              <>
                {t('history.empty')}{' '}
                <Link to="/diagnosis" className="text-accent underline">
                  {t('history.check')}
                </Link>
              </>
            )}
          </p>
        ) : (
          <>
            <p className="mb-3 text-sm text-ink-muted">
              {t('history.count', { count: history.data.total })}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {history.data.items.map((record) => (
                <DiagnosisCard key={record.id} record={record} />
              ))}
            </div>
            <div className="mt-4">
              <Pagination
                page={page}
                pageCount={history.data.pages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </DashboardTemplate>
  )
}
