import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { DISEASES } from '@/api/diagnosis'
import { useDiagnoses, type DiagnosisFilters } from '@/api/diagnoses'
import { useVineyards } from '@/api/vineyards'
import { useNavItems } from '@/app/navigation'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Select } from '@/components/atoms/Select'
import { CardSkeleton } from '@/components/molecules/CardSkeleton'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Pagination } from '@/components/molecules/Pagination'
import { DiagnosisCard } from '@/components/organisms/DiagnosisCard'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'
import { cn } from '@/lib/cn'

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
  const active = Object.values(filters).filter(Boolean).length
  const isFiltered = active > 0
  // На телефоне четыре поля занимали полэкрана: фильтры свёрнуты в кнопку
  const [filtersOpen, setFiltersOpen] = useState(false)
  const formId = useId()

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

      <div className="mb-3 flex flex-wrap items-center gap-2 sm:hidden">
        <Button
          variant="secondary"
          size="sm"
          aria-expanded={filtersOpen}
          aria-controls={formId}
          onClick={() => setFiltersOpen((open) => !open)}
        >
          {active
            ? t('history.filtersButtonActive', { count: active })
            : t('history.filtersButton')}
        </Button>
      </div>
      <form
        id={formId}
        aria-label={t('history.filters')}
        onSubmit={(event) => event.preventDefault()}
        className={cn(
          'mb-4 grid-cols-2 gap-3 text-sm sm:grid lg:grid-cols-4',
          filtersOpen ? 'grid' : 'hidden',
        )}
      >
        <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
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
        <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
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
        {isFiltered && (
          <div className="col-span-2 lg:col-span-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters({})
                setPage(1)
              }}
            >
              {t('history.resetFilters')}
            </Button>
          </div>
        )}
      </form>

      <div aria-live="polite">
        {history.isPending ? (
          <CardSkeleton />
        ) : history.isError ? (
          <p role="alert" className="text-sm text-danger">
            {t('history.loadError')}
          </p>
        ) : history.data.total === 0 ? (
          isFiltered ? (
            <EmptyState icon="search" title={t('history.nothingFound')} />
          ) : (
            <EmptyState
              icon="leaf"
              title={t('history.empty')}
              action={
                <Link
                  to="/diagnosis"
                  className="inline-flex min-h-9 items-center rounded-lg bg-brand-700 px-4 text-sm font-medium text-white transition hover:bg-brand-800"
                >
                  {t('history.check')}
                </Link>
              }
            />
          )
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
