import { useId } from 'react'
import { cn } from '@/lib/cn'

type SegmentedControlProps<T extends string> = {
  label: string
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
}

// Группа радиокнопок, оформленная как переключатель: стрелки клавиатуры
// и озвучивание «выбрано, 1 из 3» браузер даёт сам
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const name = useId()

  return (
    <fieldset
      className={cn(
        'flex rounded-md border border-line bg-surface p-0.5 shadow-sm',
        className,
      )}
    >
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'cursor-pointer rounded px-2.5 py-1 text-sm font-medium transition-colors',
            'has-focus-visible:outline-2 has-focus-visible:outline-brand-500',
            value === option.value
              ? 'bg-brand-700 text-white'
              : 'fill-hover fill-hover-soft text-ink-soft',
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  )
}
