import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/atoms/Button'
import { Modal } from '@/components/organisms/Modal'
import {
  centeredSquare,
  clampSquare,
  cropPhoto,
  MIN_CROP_SHARE,
  resizeSquare,
  type Square,
} from '@/lib/crop'

type CropDialogProps = {
  open: boolean
  photoUrl: string
  fileName: string
  onClose: () => void
  onCrop: (file: File) => void
}

type Drag = { pointerId: number; x: number; y: number; square: Square }

// Шаг стрелки — 2 % короткой стороны фото
const KEY_STEP = 0.02
const KEYS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

// Кадрирование фото листа квадратной рамкой: рамку двигают мышью, пальцем или
// стрелками, размер задаёт слайдер
export function CropDialog({
  open,
  photoUrl,
  fileName,
  onClose,
  onCrop,
}: CropDialogProps) {
  const { t } = useTranslation()
  const sizeId = useId()
  const imageRef = useRef<HTMLImageElement>(null)
  const dragRef = useRef<Drag | null>(null)
  const [natural, setNatural] = useState<{ width: number; height: number }>()
  const [square, setSquare] = useState<Square>()
  const [isCropping, setIsCropping] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)

  const onLoad = () => {
    const image = imageRef.current
    if (!image) return
    const size = { width: image.naturalWidth, height: image.naturalHeight }
    setNatural(size)
    setSquare(centeredSquare(size.width, size.height))
  }

  const side = natural ? Math.min(natural.width, natural.height) : 0
  const place = (next: Square) => {
    if (natural) setSquare(clampSquare(next, natural.width, natural.height))
  }

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!square) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      square,
    }
  }

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    const image = imageRef.current
    if (!drag || drag.pointerId !== event.pointerId || !image || !natural)
      return
    // Сдвиг на экране — в пиксели исходного фото
    const scale = natural.width / (image.clientWidth || natural.width)
    place({
      ...drag.square,
      x: drag.square.x + (event.clientX - drag.x) * scale,
      y: drag.square.y + (event.clientY - drag.y) * scale,
    })
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const direction = KEYS[event.key]
    if (!direction || !square) return
    event.preventDefault()
    place({
      ...square,
      x: square.x + direction[0] * side * KEY_STEP,
      y: square.y + direction[1] * side * KEY_STEP,
    })
  }

  const apply = async () => {
    const image = imageRef.current
    if (!image || !square) return
    setIsCropping(true)
    setHasFailed(false)
    try {
      onCrop(await cropPhoto(image, square, fileName))
    } catch {
      setHasFailed(true)
    } finally {
      setIsCropping(false)
    }
  }

  const percent = (value: number, total: number) => `${(value / total) * 100}%`

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('diagnosis.crop.title')}
      description={t('diagnosis.crop.description')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('diagnosis.crop.cancel')}
          </Button>
          <Button
            disabled={!square}
            isLoading={isCropping}
            onClick={() => void apply()}
          >
            {t('diagnosis.crop.apply')}
          </Button>
        </>
      }
    >
      <div className="relative mx-auto w-fit touch-none overflow-hidden rounded-md select-none">
        <img
          ref={imageRef}
          src={photoUrl}
          alt={t('diagnosis.preview')}
          onLoad={onLoad}
          draggable={false}
          className="block max-h-[60svh] max-w-full"
        />
        {natural && square && (
          <button
            type="button"
            aria-label={t('diagnosis.crop.frame')}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => (dragRef.current = null)}
            onPointerCancel={() => (dragRef.current = null)}
            onKeyDown={onKeyDown}
            className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgb(0_0_0/0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            style={{
              left: percent(square.x, natural.width),
              top: percent(square.y, natural.height),
              width: percent(square.size, natural.width),
              height: percent(square.size, natural.height),
            }}
          />
        )}
      </div>
      {natural && square && (
        <div className="flex flex-col gap-1">
          <label htmlFor={sizeId} className="text-sm text-ink">
            {t('diagnosis.crop.size')}
          </label>
          <input
            id={sizeId}
            type="range"
            min={MIN_CROP_SHARE * 100}
            max={100}
            step={1}
            value={Math.round((square.size / side) * 100)}
            onChange={(event) =>
              setSquare(
                resizeSquare(
                  square,
                  (Number(event.target.value) / 100) * side,
                  natural.width,
                  natural.height,
                ),
              )
            }
            className="accent-brand-700"
          />
        </div>
      )}
      {hasFailed && (
        <p role="alert" className="text-sm text-danger">
          {t('diagnosis.crop.failed')}
        </p>
      )}
    </Modal>
  )
}
