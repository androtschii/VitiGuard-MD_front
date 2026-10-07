import type { ComponentProps } from 'react'
import { controlStyles } from '@/components/atoms/controlStyles'
import { cn } from '@/lib/cn'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(controlStyles, 'h-10', className)} {...props} />
}
