import { cn } from '@/lib/cn'

type SkeletonProps = {
  className?: string
}

// Заглушка скрыта от дикторов: о загрузке сообщает контейнер с role="status"
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('skeleton h-4 rounded bg-muted-strong', className)}
    />
  )
}
