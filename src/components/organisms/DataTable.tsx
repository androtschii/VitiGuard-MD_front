import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import { Skeleton } from '@/components/atoms/Skeleton'
import { cn } from '@/lib/cn'

export type Column<Row> = {
  key: string
  header: string
  cell: (row: Row) => ReactNode
  align?: 'left' | 'right'
}

type DataTableProps<Row> = {
  caption: string
  columns: Column<Row>[]
  rows: Row[]
  getRowKey: (row: Row) => string
  isLoading?: boolean
  emptyMessage?: string
}

const SKELETON_ROWS = 5

export function DataTable<Row>({
  caption,
  columns,
  rows,
  getRowKey,
  isLoading = false,
  emptyMessage,
}: DataTableProps<Row>) {
  const { t } = useTranslation()
  const alignment = (align: Column<Row>['align']) =>
    align === 'right' ? 'text-right' : 'text-left'

  return (
    // Узкий экран прокручивает таблицу по горизонтали, а не ломает вёрстку
    <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <table
        aria-busy={isLoading || undefined}
        className="w-full border-collapse text-sm"
      >
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-stone-50 text-xs text-stone-600 uppercase">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn('px-4 py-3 font-medium', alignment(column.align))}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
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
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-stone-500"
              >
                {emptyMessage ?? t('common.noData')}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getRowKey(row)} className="hover:bg-stone-50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-stone-800',
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
