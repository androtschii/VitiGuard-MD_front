import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type CardProps = ComponentProps<'section'> & {
  title?: string
  description?: string
  actions?: ReactNode
}

export function Card({
  title,
  description,
  actions,
  className,
  children,
  ...props
}: CardProps) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        'rounded-lg border border-stone-200 bg-white p-5 shadow-sm',
        className,
      )}
      {...props}
    >
      {(title || actions) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2
                id={titleId}
                className="text-base font-semibold text-stone-900"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-stone-500">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  )
}
