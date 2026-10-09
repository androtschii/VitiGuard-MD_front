import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/atoms/Skeleton'
import { cn } from '@/lib/cn'

type CardSkeletonProps = {
  lines?: number
  className?: string
}

export function CardSkeleton({ lines = 3, className }: CardSkeletonProps) {
  const { t } = useTranslation()
  return (
    <div
      role="status"
      className={cn(
        'rounded-lg border border-stone-200 bg-white p-5 shadow-sm',
        className,
      )}
    >
      <span className="sr-only">{t('common.loading')}</span>
      <Skeleton className="mb-4 h-5 w-1/3" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }, (_, index) => (
          // Последняя строка короче, как у настоящего абзаца
          <Skeleton
            key={index}
            className={index === lines - 1 ? 'w-2/3' : ''}
          />
        ))}
      </div>
    </div>
  )
}
