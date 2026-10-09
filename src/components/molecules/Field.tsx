import { useTranslation } from 'react-i18next'
import { useId, type ReactNode } from 'react'

export type FieldControlProps = {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: true
}

type FieldProps = {
  label: string
  hint?: string
  error?: string
  required?: boolean
  // Поле само выдаёт id и связи для доступности, а элемент ввода выбирает страница
  children: (control: FieldControlProps) => ReactNode
}

export function Field({ label, hint, error, required, children }: FieldProps) {
  const { t } = useTranslation()
  const id = useId()
  // Ошибки валидации приходят ключами перевода, ошибки сервера — готовым текстом
  const message = error?.startsWith('validation.') ? t(error) : error
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy =
    [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-danger">
            *
          </span>
        )}
      </label>
      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })}
      {hint && (
        <p id={hintId} className="text-xs text-ink-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {message}
        </p>
      )}
    </div>
  )
}
