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

type CropFrameProps = {
  image: HTMLImageElement
  square: Square
  onChange: (square: Square) => void
}

// Рамка поверх загруженного фото
function CropFrame({ image, square, onChange }: CropFrameProps) {
  const { t } = useTranslation()
  const dragRef = useRef<Drag | null>(null)
  const width = image.naturalWidth
  const height = image.naturalHeight
  const side = Math.min(width, height)
  const place = (next: Square) => onChange(clampSquare(next, width, height))
  const percent = (value: number, total: number) => `${(value / total) * 100}%`

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
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
    if (drag?.pointerId !== event.pointerId) return
    // Сдвиг на экране — в пиксели исходного фото
    const scale = width / (image.clientWidth || width)
    place({
      ...drag.square,
      x: drag.square.x + (event.clientX - drag.x) * scale,
      y: drag.square.y + (event.clientY - drag.y) * scale,
    })
  }

  const endDrag = () => {
    dragRef.current = null
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const direction = KEYS[event.key]
    if (!direction) return
    event.preventDefault()
    place({
      ...square,
      x: square.x + direction[0] * side * KEY_STEP,
      y: square.y + direction[1] * side * KEY_STEP,
    })
  }

  return (
    <button
      type="button"
      aria-label={t('diagnosis.crop.frame')}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgb(0_0_0/0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      style={{
        left: percent(square.x, width),
        top: percent(square.y, height),
        width: percent(square.size, width),
        height: percent(square.size, height),
      }}
    />
  )
}

// Размер рамки — доля короткой стороны фото, вокруг центра рамки
function CropSize({ image, square, onChange }: CropFrameProps) {
  const { t } = useTranslation()
  const id = useId()
  const width = image.naturalWidth
  const height = image.naturalHeight
  const side = Math.min(width, height)

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-ink">
        {t('diagnosis.crop.size')}
      </label>
      <input
        id={id}
        type="range"
        min={MIN_CROP_SHARE * 100}
        max={100}
        step={1}
        value={Math.round((square.size / side) * 100)}
        onChange={(event) =>
          onChange(
            resizeSquare(
              square,
              (Number(event.target.value) / 100) * side,
              width,
              height,
            ),
          )
        }
        className="accent-brand-700"
      />
    </div>
  )
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
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [square, setSquare] = useState<Square | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)

  const apply = async (loaded: HTMLImageElement, frame: Square) => {
    setIsCropping(true)
    setHasFailed(false)
    try {
      onCrop(await cropPhoto(loaded, frame, fileName))
    } catch {
      setHasFailed(true)
    } finally {
      setIsCropping(false)
    }
  }

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
          {image && square && (
            <Button
              isLoading={isCropping}
              onClick={() => void apply(image, square)}
            >
              {t('diagnosis.crop.apply')}
            </Button>
          )}
        </>
      }
    >
      <div className="relative mx-auto w-fit touch-none overflow-hidden rounded-md select-none">
        <img
          src={photoUrl}
          alt={t('diagnosis.preview')}
          draggable={false}
          onLoad={(event) => {
            const loaded = event.currentTarget
            setImage(loaded)
            setSquare(centeredSquare(loaded.naturalWidth, loaded.naturalHeight))
          }}
          className="block max-h-[60svh] max-w-full"
        />
        {image && square && (
          <CropFrame image={image} square={square} onChange={setSquare} />
        )}
      </div>
      {image && square && (
        <CropSize image={image} square={square} onChange={setSquare} />
      )}
      {hasFailed && (
        <p role="alert" className="text-sm text-danger">
          {t('diagnosis.crop.failed')}
        </p>
      )}
    </Modal>
  )
}
