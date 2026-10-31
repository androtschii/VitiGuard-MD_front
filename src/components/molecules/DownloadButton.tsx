import { useEffect, useState, type ComponentProps } from 'react'
import { Button } from '@/components/atoms/Button'

const DONE_MS = 2000

type DownloadButtonProps = ComponentProps<typeof Button> & {
  // Скачать не удалось: вместо галочки значок сразу возвращается к стрелке
  failed?: boolean
}

// Кнопка скачивания: стрелка падает на линию, пока идёт загрузка, а по её
// окончании линия превращается в галочку
export function DownloadButton({
  isLoading = false,
  failed = false,
  disabled,
  children,
  ...props
}: DownloadButtonProps) {
  const [wasLoading, setWasLoading] = useState(isLoading)
  const [isDone, setIsDone] = useState(false)

  if (wasLoading !== isLoading) {
    setWasLoading(isLoading)
    setIsDone(wasLoading && !failed)
  }

  useEffect(() => {
    if (!isDone) return
    const timer = setTimeout(() => setIsDone(false), DONE_MS)
    return () => clearTimeout(timer)
  }, [isDone])

  return (
    <Button
      {...props}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        data-state={isLoading ? 'loading' : isDone ? 'done' : 'idle'}
        className="download-icon size-4 shrink-0 overflow-visible"
      >
        <path className="download-arrow" d="M8 1.5v8.5M4.5 6.5 8 10l3.5-3.5" />
        <path className="download-line" d="M2.5 14h11" />
        <path
          className="download-check"
          pathLength={1}
          d="M3 8.5 6.5 12 13 4.5"
        />
      </svg>
      {children}
    </Button>
  )
}
