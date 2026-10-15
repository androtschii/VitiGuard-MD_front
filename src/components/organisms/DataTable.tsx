import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/atoms/Skeleton'
import { cn } from '@/lib/cn'

export type Column<Row> = {
  key: string
  header: string
  cell: (row: Row) => ReactNode
  align?: 'left' | 'right'
  // Значение для сортировки; без него столбец не сортируется
  sortValue?: (row: Row) => number | string
}

export type SortState = {
  key: string
  direction: 'ascending' | 'descending'
}

type DataTableProps<Row> = {
  caption: string
  columns: Column<Row>[]
  rows: Row[]
  getRowKey: (row: Row) => string
  isLoading?: boolean
  emptyMessage?: string
  initialSort?: SortState
}

const SKELETON_ROWS = 5

function sortRows<Row>(
  rows: Row[],
  column: Column<Row> | undefined,
  direction: SortState['direction'],
  locale: string,
) {
  const value = column?.sortValue
  if (!value) return rows
  const sign = direction === 'ascending' ? 1 : -1
  return [...rows].sort((a, b) => {
    const left = value(a)
    const right = value(b)
    // Строки — по правилам языка интерфейса: «Bălți» рядом с «Basarabeasca»
    const order =
      typeof left === 'string' && typeof right === 'string'
        ? left.localeCompare(right, locale)
        : Number(left) - Number(right)
    return order * sign
  })
}

export function DataTable<Row>({
  caption,
  columns,
  rows,
  getRowKey,
  isLoading = false,
  emptyMessage,
  initialSort,
}: DataTableProps<Row>) {
  const { t, i18n } = useTranslation()
  const [sort, setSort] = useState<SortState | null>(initialSort ?? null)
  const alignment = (align: Column<Row>['align']) =>
    align === 'right' ? 'text-right' : 'text-left'
  const sorted = sort
    ? sortRows(
        rows,
        columns.find((column) => column.key === sort.key),
        sort.direction,
        i18n.language,
      )
    : rows

  const toggleSort = (key: string) =>
    setSort((current) =>
      current?.key === key
        ? {
            key,
            direction:
              current.direction === 'ascending' ? 'descending' : 'ascending',
          }
        : { key, direction: 'ascending' },
    )

  return (
    // Узкий экран прокручивает таблицу по горизонтали, а не ломает вёрстку
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table
        aria-busy={isLoading || undefined}
        className="w-full border-collapse text-sm"
      >
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-canvas text-xs text-ink-muted uppercase">
          <tr>
            {columns.map((column) => {
              const direction =
                sort?.key === column.key ? sort.direction : undefined
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    column.sortValue ? (direction ?? 'none') : undefined
                  }
                  className={cn(
                    'px-4 py-3 font-medium',
                    alignment(column.align),
                  )}
                >
                  {column.sortValue ? (
                    // Кнопка в заголовке: сортировка доступна с клавиатуры,
                    // а направление озвучивает aria-sort
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={cn(
                        'inline-flex items-center gap-1 uppercase hover:text-ink',
                        column.align === 'right' && 'flex-row-reverse',
                        direction && 'text-ink',
                      )}
                    >
                      {column.header}
                      <span aria-hidden="true" className="w-2">
                        {direction === 'ascending'
                          ? '↑'
                          : direction === 'descending'
                            ? '↓'
                            : ''}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <tr key={index} aria-hidden="true">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    <Skeleton />
                  </td>
                ))}
              </tr>
            ))
          ) : sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-ink-subtle"
              >
                {emptyMessage ?? t('common.noData')}
              </td>
            </tr>
          ) : (
            sorted.map((row) => (
              <tr key={getRowKey(row)} className="hover:bg-canvas">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-ink',
                      alignment(column.align),
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {isLoading && (
        <p role="status" className="sr-only">
          {t('common.loading')}
        </p>
      )}
    </div>
  )
}
