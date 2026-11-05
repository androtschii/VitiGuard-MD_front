import type { ComponentProps, MouseEvent } from 'react'
import { controlStyles } from '@/components/atoms/controlStyles'
import { cn } from '@/lib/cn'

const PICKERS = new Set(['date', 'time', 'datetime-local', 'month'])

// У поля даты календарь открывается нажатием в любом месте поля, а не только
// по маленькому значку: в поле его ищут пальцем
function openPicker(event: MouseEvent<HTMLInputElement>) {
  const input = event.currentTarget
  if (!PICKERS.has(input.type) || input.readOnly || input.disabled) return
  try {
    input.showPicker()
  } catch {
    // Браузер без showPicker или без жеста пользователя — остаётся значок
  }
}

export function Input({
  className,
  onClick,
  ...props
}: ComponentProps<'input'>) {
  return (
    <input
      className={cn(controlStyles, 'h-10', className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) openPicker(event)
      }}
      {...props}
    />
  )
}
