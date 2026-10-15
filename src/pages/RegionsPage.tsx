import { useTranslation } from 'react-i18next'
import { useDistrictStats, type DistrictStats } from '@/api/regions'
import { useNavItems } from '@/app/navigation'
import { Card } from '@/components/atoms/Card'
import { DataTable, type Column } from '@/components/organisms/DataTable'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'

// Сколько районов показывать на графике: остальные видны в таблице
const CHART_SIZE = 10

export function RegionsPage() {
  const { t, i18n } = useTranslation()
  const navItems = useNavItems()
  const { data: districts = [], isPending, isError, error } = useDistrictStats()

  const number = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 0,
  })
  const hectares = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 1,
  })
  const percent = new Intl.NumberFormat(i18n.language, {
    style: 'percent',
    maximumFractionDigits: 1,
  })

  const sum = (pick: (district: DistrictStats) => number) =>
    districts.reduce((total, district) => total + pick(district), 0)
  const summary = [
    {
      label: t('regions.summary.osmCount'),
      value: number.format(sum((d) => d.osm_vineyards)),
    },
    {
      label: t('regions.summary.osmArea'),
      value: t('regions.ha', {
        value: number.format(sum((d) => d.osm_vineyard_area_ha)),
      }),
    },
    {
      label: t('regions.summary.mine'),
      value: t('regions.mineValue', {
        count: sum((d) => d.my_vineyards),
        area: hectares.format(sum((d) => d.my_vineyard_area_ha)),
      }),
    },
  ]

  const top = [...districts]
    .sort((a, b) => b.osm_vineyard_area_ha - a.osm_vineyard_area_ha)
    .slice(0, CHART_SIZE)
  const maxArea = top[0]?.osm_vineyard_area_ha ?? 0

  const columns: Column<DistrictStats>[] = [
    {
      key: 'name',
      header: t('regions.columns.name'),
      cell: (d) => d.name,
      sortValue: (d) => d.name,
    },
    {
      key: 'area',
      header: t('regions.columns.area'),
      cell: (d) => number.format(d.area_ha),
      sortValue: (d) => d.area_ha,
      align: 'right',
    },
    {
      key: 'osmCount',
      header: t('regions.columns.osmCount'),
      cell: (d) => number.format(d.osm_vineyards),
      sortValue: (d) => d.osm_vineyards,
      align: 'right',
    },
    {
      key: 'osmArea',
      header: t('regions.columns.osmArea'),
      cell: (d) => hectares.format(d.osm_vineyard_area_ha),
      sortValue: (d) => d.osm_vineyard_area_ha,
      align: 'right',
    },
    {
      key: 'share',
      header: t('regions.columns.share'),
      cell: (d) => percent.format(d.osm_vineyard_share),
      sortValue: (d) => d.osm_vineyard_share,
      align: 'right',
    },
    {
      key: 'mine',
      header: t('regions.columns.mine'),
      cell: (d) =>
        d.my_vineyards
          ? `${d.my_vineyards} · ${hectares.format(d.my_vineyard_area_ha)}`
          : '—',
      sortValue: (d) => d.my_vineyard_area_ha,
      align: 'right',
    },
  ]

  return (
    <DashboardTemplate navItems={navItems} headerActions={<LogoutButton />}>
      <h1 className="mb-1 text-xl font-semibold text-ink">
        {t('regions.title')}
      </h1>
      <p className="mb-4 max-w-3xl text-sm text-ink-muted">
        {t('regions.intro')}
      </p>

      {isError ? (
        <p role="alert" className="text-sm text-danger">
          {error.message}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <dl className="grid gap-4 sm:grid-cols-3">
            {summary.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-line bg-surface p-4 shadow-sm motion-safe:animate-rise"
              >
                <dt className="text-sm text-ink-subtle">{item.label}</dt>
                <dd className="mt-1 text-2xl font-semibold text-ink">
                  {isPending ? '…' : item.value}
                </dd>
              </div>
            ))}
          </dl>

          {top.length > 0 && maxArea > 0 && (
            <Card title={t('regions.chart')}>
              <ul className="flex flex-col gap-2">
                {top.map((district) => (
                  <li key={district.iso} className="text-sm">
                    <div className="flex justify-between gap-2 text-ink-soft">
                      <span>{district.name}</span>
                      <span className="tabular-nums">
                        {t('regions.ha', {
                          value: number.format(district.osm_vineyard_area_ha),
                        })}
                      </span>
                    </div>
                    {/* Полоса дублирует число, поэтому скрыта от экранного диктора */}
                    <div
                      aria-hidden="true"
                      className="mt-1 h-2 overflow-hidden rounded-full bg-muted"
                    >
                      <div
                        className="h-full origin-left rounded-full bg-brand-600 motion-safe:animate-fill"
                        style={{
                          width: `${(district.osm_vineyard_area_ha / maxArea) * 100}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <DataTable
            caption={t('regions.table')}
            columns={columns}
            rows={districts}
            getRowKey={(d) => d.iso}
            isLoading={isPending}
            initialSort={{ key: 'osmArea', direction: 'descending' }}
          />
          <p className="text-xs text-ink-subtle">{t('regions.source')}</p>
        </div>
      )}
    </DashboardTemplate>
  )
}
