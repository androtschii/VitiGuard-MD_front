import { useId, useState, type DragEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/atoms/Button'
import { CameraCapture } from '@/components/organisms/CameraCapture'
import { CropDialog } from '@/components/organisms/CropDialog'
import { canUseCamera } from '@/lib/camera'
import { cn } from '@/lib/cn'
import {
  checkLeafPhoto,
  LEAF_PHOTO_TYPES,
  type LeafPhotoProblem,
} from '@/lib/leafPhoto'
import { useObjectUrl } from '@/lib/useObjectUrl'

type LeafUploadProps = {
  file: File | null
  onSelect: (file: File) => void
  // Кадрированная копия выбранного фото
  onCrop?: (file: File) => void
}

// Выбор фото листа: перетаскиванием или через диалог выбора файла. На
// сенсорном экране перетаскивать нечего — там отдельная кнопка камеры (pr-049)
export function LeafUpload({ file, onSelect, onCrop }: LeafUploadProps) {
  const { t } = useTranslation()
  const inputId = useId()
  const cameraId = useId()
  const hintId = useId()
  const [isDragging, setIsDragging] = useState(false)
  const [problem, setProblem] = useState<LeafPhotoProblem | null>(null)
  const [hasCamera] = useState(canUseCamera)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isCropOpen, setIsCropOpen] = useState(false)

  const previewUrl = useObjectUrl(file)

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
          'flex min-h-44 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-line-strong bg-muted/40 p-4 text-center text-sm text-ink-muted transition sm:min-h-56',
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
            <span className="pointer-coarse:hidden">
              {t('diagnosis.drop')}{' '}
              <span className="font-medium text-accent underline">
                {t('diagnosis.choose')}
              </span>
            </span>
            <span className="hidden font-medium text-accent underline pointer-coarse:inline">
              {t('diagnosis.chooseTouch')}
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
      {file && previewUrl && onCrop && (
        <>
          <Button
            variant="secondary"
            size="sm"
            className="self-center"
            onClick={() => setIsCropOpen(true)}
          >
            {t('diagnosis.crop.open')}
          </Button>
          {/* Окно создаётся открытым: рамка каждый раз начинается по центру фото */}
          {isCropOpen && (
            <CropDialog
              open
              photoUrl={previewUrl}
              fileName={file.name}
              onClose={() => setIsCropOpen(false)}
              onCrop={(cropped) => {
                setIsCropOpen(false)
                onCrop(cropped)
              }}
            />
          )}
        </>
      )}
      {/* Камера в приложении — с рамкой, вспышкой и зумом (pr-078). Где
          браузер её не даёт, capture открывает системную съёмку */}
      {hasCamera ? (
        <>
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="hidden h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-line-strong bg-surface px-3 text-sm font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 pointer-coarse:flex"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
              className="size-5 text-brand-500"
            >
              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            {t('diagnosis.camera')}
          </button>
          <CameraCapture
            open={isCameraOpen}
            onClose={() => setIsCameraOpen(false)}
            onCapture={pick}
          />
        </>
      ) : (
        <label
          htmlFor={cameraId}
          className="hidden h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-line-strong bg-surface px-3 text-sm font-medium text-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-500 pointer-coarse:flex"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            className="size-5 text-brand-500"
          >
            <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
          {t('diagnosis.camera')}
          <input
            id={cameraId}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(event) => {
              pick(event.target.files?.[0])
              event.target.value = ''
            }}
          />
        </label>
      )}
      <p aria-live="polite" className="min-h-5 text-sm text-danger">
        {problem && t(`diagnosis.${problem}`)}
      </p>
    </div>
  )
}
