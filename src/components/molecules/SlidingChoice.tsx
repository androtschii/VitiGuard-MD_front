import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type SlidingOption<Value extends string> = {
  value: Value
  // Полное название: его читает диктор и показывает подсказка
  label: string
  content: ReactNode
  lang?: string
}

type SlidingChoiceProps<Value extends string> = {
  label: string
  value: Value
  options: SlidingOption<Value>[]
  onChange: (value: Value) => void
}

// Все варианты видны сразу, текущий отмечает подсветка, которая едет к выбранному.
// Настоящие радиокнопки дают управление стрелками без своего кода
export function SlidingChoice<Value extends string>({
  label,
  value,
  options,
  onChange,
}: SlidingChoiceProps<Value>) {
  const name = useId()
  const index = options.findIndex((option) => option.value === value)

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="relative inline-grid auto-cols-fr grid-flow-col rounded-lg border border-line-strong bg-surface p-0.5"
    >
      {index >= 0 && (
        <span
          aria-hidden="true"
          data-testid="sliding-pill"
          className="absolute inset-y-0.5 left-0.5 rounded-md bg-brand-700 shadow-sm motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.3,1.3,0.5,1)]"
          style={{
            width: `calc((100% - 0.25rem) / ${options.length})`,
            transform: `translateX(${index * 100}%)`,
          }}
        />
      )}
      {options.map((option) => {
        const isCurrent = option.value === value
        return (
          <label
            key={option.value}
            title={option.label}
            lang={option.lang}
            className={cn(
              'relative flex h-7 min-w-8 cursor-pointer items-center justify-center rounded-md px-1.5 text-xs font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-accent',
              isCurrent ? 'text-white' : 'text-ink-soft hover:text-accent',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isCurrent}
              aria-label={option.label}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span
              key={String(isCurrent)}
              className={cn(isCurrent && 'motion-safe:animate-grow-in')}
            >
              {option.content}
            </span>
          </label>
        )
      })}
    </div>
  )
}
