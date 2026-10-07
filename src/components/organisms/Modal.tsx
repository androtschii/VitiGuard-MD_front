import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Button } from '@/components/atoms/Button'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  footer?: ReactNode
  children?: ReactNode
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
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
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
      className="m-auto w-full max-w-lg rounded-lg bg-white p-0 shadow-xl backdrop:bg-stone-900/50"
    >
      <div className="flex flex-col gap-4 p-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-stone-900">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-stone-500">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Закрыть"
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
