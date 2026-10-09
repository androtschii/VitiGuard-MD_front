import { useTranslation } from 'react-i18next'
import { Button } from '@/components/atoms/Button'
import { getPageItems } from '@/lib/pagination'

type PaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  const { t } = useTranslation()
  if (pageCount <= 1) return null

  return (
    <nav aria-label={t('pagination.label')} className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        {t('pagination.previous')}
      </Button>
      {getPageItems(page, pageCount).map((item, index) =>
        item === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden="true"
            className="px-1 text-stone-400"
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? 'primary' : 'ghost'}
            size="sm"
            aria-label={t('pagination.page', { page: item })}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onPageChange(item)}
            className="min-w-8 px-2"
          >
            {item}
          </Button>
        ),
      )}
      <Button
        variant="ghost"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        {t('pagination.next')}
      </Button>
    </nav>
  )
}
