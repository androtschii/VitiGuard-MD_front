import { useEffect, useId, useMemo, useState, type DragEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  checkLeafPhoto,
  LEAF_PHOTO_TYPES,
  type LeafPhotoProblem,
} from '@/lib/leafPhoto'
import { cn } from '@/lib/cn'

type LeafUploadProps = {
  file: File | null
  onSelect: (file: File) => void
}

// Выбор фото листа: перетаскиванием или через диалог выбора файла. На телефоне
// тот же диалог предлагает и камеру
export function LeafUpload({ file, onSelect }: LeafUploadProps) {
  const { t } = useTranslation()
  const inputId = useId()
  const hintId = useId()
  const [isDragging, setIsDragging] = useState(false)
  const [problem, setProblem] = useState<LeafPhotoProblem | null>(null)

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  )
  // Ссылка на файл держит его в памяти, пока её не освободить
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl],
  )

  const pick = (picked: File | undefined) => {
    if (!picked) return
    const found = checkLeafPhoto(picked)
    setProblem(found)
    if (!found) onSelect(picked)
  }

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)
    pick(event.dataTransfer.files[0])
  }

  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex min-h-56 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-line-strong bg-muted/40 p-4 text-center text-sm text-ink-muted transition',
          'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-500 hover:border-brand-500',
          isDragging && 'border-brand-500 bg-accent-soft',
        )}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt={t('diagnosis.preview')}
              className="max-h-72 rounded-md object-contain motion-safe:animate-rise"
            />
            <span className="font-medium text-accent">
              {t('diagnosis.change')}
            </span>
          </>
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
              className="size-10 text-brand-500"
            >
              <path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
            <span>
              {t('diagnosis.drop')}{' '}
              <span className="font-medium text-accent underline">
                {t('diagnosis.choose')}
              </span>
            </span>
            <span id={hintId} className="text-xs text-ink-subtle">
              {t('diagnosis.formats')}
            </span>
          </>
        )}
        <input
          id={inputId}
          type="file"
          accept={LEAF_PHOTO_TYPES.join(',')}
          aria-describedby={hintId}
          aria-label={t('diagnosis.input')}
          className="sr-only"
          onChange={(event) => {
            pick(event.target.files?.[0])
            // Повторный выбор того же файла тоже должен сработать
            event.target.value = ''
          }}
        />
      </label>
      <p aria-live="polite" className="min-h-5 text-sm text-danger">
        {problem && t(`diagnosis.${problem}`)}
      </p>
    </div>
  )
}
