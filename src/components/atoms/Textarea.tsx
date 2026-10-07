import type { ComponentProps } from 'react'
import { controlStyles } from '@/components/atoms/controlStyles'
import { cn } from '@/lib/cn'

export function Textarea({
  rows = 4,
  className,
  ...props
}: ComponentProps<'textarea'>) {
  return (
    <textarea
      rows={rows}
      className={cn(controlStyles, 'resize-y py-2', className)}
      {...props}
    />
  )
}
