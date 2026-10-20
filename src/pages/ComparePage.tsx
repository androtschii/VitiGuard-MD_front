import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useVineyards } from '@/api/vineyards'
import { useNavItems } from '@/app/navigation'
import { Select } from '@/components/atoms/Select'
import { PrintButton } from '@/components/molecules/PrintButton'
import { Field } from '@/components/molecules/Field'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { VineyardComparison } from '@/components/organisms/VineyardComparison'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'

export function ComparePage() {
  const { t } = useTranslation()
  const navItems = useNavItems()
  const { data: vineyards, isPending } = useVineyards()
  // Пока пользователь не выбрал сам — два первых участка по названию
  const [chosen, setChosen] = useState<[string | null, string | null]>([
    null,
    null,
  ])
  const list = vineyards ?? []
  const ids = [chosen[0] ?? list[0]?.id, chosen[1] ?? list[1]?.id]
  const a = list.find((vineyard) => vineyard.id === ids[0])
  const b = list.find((vineyard) => vineyard.id === ids[1])

  const picker = (position: 0 | 1) => (
    <Field label={t(position === 0 ? 'compare.first' : 'compare.second')}>
      {(control) => (
        <Select
          {...control}
          value={ids[position] ?? ''}
          onChange={(event) =>
            setChosen((current) =>
              position === 0
                ? [event.target.value, current[1]]
                : [current[0], event.target.value],
            )
          }
        >
          {list.map((vineyard) => (
            <option key={vineyard.id} value={vineyard.id}>
              {vineyard.name}
            </option>
          ))}
        </Select>
      )}
    </Field>
  )

  return (
    <DashboardTemplate navItems={navItems} headerActions={<LogoutButton />}>
      <div className="flex max-w-5xl flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold text-ink">
              {t('compare.title')}
            </h1>
            <p className="max-w-2xl text-sm text-ink-muted">
              {t('compare.intro')}
            </p>
          </div>
          <PrintButton />
        </div>
        {!isPending && list.length < 2 ? (
          <p className="text-sm text-ink-muted">
            {t('compare.needTwo')}{' '}
            <Link to="/map" className="font-medium text-accent underline">
              {t('home.openMap')}
            </Link>
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 print:hidden">
              {picker(0)}
              {picker(1)}
            </div>
            {a && b && a.id === b.id && (
              <p role="alert" className="text-sm text-danger">
                {t('compare.same')}
              </p>
            )}
            {a && b && a.id !== b.id && <VineyardComparison a={a} b={b} />}
          </>
        )}
      </div>
    </DashboardTemplate>
  )
}
