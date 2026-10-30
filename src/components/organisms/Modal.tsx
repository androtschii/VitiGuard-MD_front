import { useTranslation } from 'react-i18next'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from '@/components/atoms/Button'
import { cn } from '@/lib/cn'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  footer?: ReactNode
  children?: ReactNode
  // lg — для графиков и таблиц
  size?: 'md' | 'lg'
}

// Нативный <dialog> с showModal(): браузер сам удерживает фокус внутри окна,
// делает фон недоступным и закрывает окно по Esc
export function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  children,
  size = 'md',
}: ModalProps) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (open && dialog && !dialog.open) dialog.showModal()
    if (!open && dialog?.open) dialog.close()
  }, [open])

  return (
    // С клавиатуры окно закрывается по Esc и кнопкой «Закрыть», клик по фону —
    // только дополнительный способ для мыши
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onClick={(event) => {
        // Клик по самому <dialog> — это клик по фону вокруг содержимого
        if (event.target === event.currentTarget) onClose()
      }}
      className={cn(
        'modal m-auto w-full rounded-lg bg-surface p-0 shadow-xl backdrop:bg-stone-900/50',
        size === 'lg' ? 'max-w-3xl' : 'max-w-lg',
      )}
    >
      <div className="flex flex-col gap-4 p-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-ink-subtle">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            aria-label={t('common.close')}
            onClick={onClose}
            className="-mt-1 -mr-2 text-lg"
          >
            ×
          </Button>
        </header>
        {children}
        {footer && <footer className="flex justify-end gap-2">{footer}</footer>}
      </div>
    </dialog>
  )
}
