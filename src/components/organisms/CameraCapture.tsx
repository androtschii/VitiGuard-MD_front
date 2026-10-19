import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/atoms/Button'
import { Modal } from '@/components/organisms/Modal'
import {
  cameraFeatures,
  cameraProblem,
  captureFrame,
  openCamera,
  setTorch,
  setZoom,
  type CameraFeatures,
  type CameraProblem,
} from '@/lib/camera'

type CameraCaptureProps = {
  open: boolean
  onClose: () => void
  onCapture: (file: File) => void
}

// Съёмка листа камерой телефона прямо в приложении (pr-078): рамка-подсказка,
// вспышка и зум, если камера их умеет (pr-079)
export function CameraCapture({
  open,
  onClose,
  onCapture,
}: CameraCaptureProps) {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  // Дорожка камеры вместе с тем, что она умеет
  const [camera, setCamera] = useState<
    (CameraFeatures & { track: MediaStreamTrack }) | null
  >(null)
  const [problem, setProblem] = useState<CameraProblem | null>(null)
  const [isTorchOn, setIsTorchOn] = useState(false)
  const [zoom, setZoomValue] = useState<number | null>(null)
  const [isTaking, setIsTaking] = useState(false)

  useEffect(() => {
    if (!open) return
    let stream: MediaStream | null = null
    let isCurrent = true
    openCamera().then(
      (opened) => {
        stream = opened
        if (!isCurrent) {
          opened.getTracks().forEach((item) => item.stop())
          return
        }
        const [video] = opened.getVideoTracks()
        const element = videoRef.current
        if (element) element.srcObject = opened
        if (video) {
          const found = cameraFeatures(video)
          setCamera({ ...found, track: video })
          setZoomValue(found.zoom?.min ?? null)
        }
      },
      (error: unknown) => {
        if (isCurrent) setProblem(cameraProblem(error))
      },
    )
    // Камера выключается, как только окно закрыли: иначе горит индикатор
    // и садится батарея
    return () => {
      isCurrent = false
      stream?.getTracks().forEach((item) => item.stop())
      setCamera(null)
      setIsTorchOn(false)
      setProblem(null)
    }
  }, [open])

  const toggleTorch = (track: MediaStreamTrack) => {
    const next = !isTorchOn
    setIsTorchOn(next)
    void setTorch(track, next).catch(() => setIsTorchOn(!next))
  }

  // Зум, который камера не приняла, просто не меняет картинку
  const changeZoom = (track: MediaStreamTrack, value: number) => {
    setZoomValue(value)
    void setZoom(track, value).catch(() => {})
  }

  const take = async () => {
    const video = videoRef.current
    if (!video?.videoWidth) return
    setIsTaking(true)
    try {
      onCapture(await captureFrame(video))
      onClose()
    } catch {
      setProblem('failed')
    } finally {
      setIsTaking(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('camera.title')}
      footer={
        <Button
          isLoading={isTaking}
          disabled={!camera}
          onClick={() => void take()}
        >
          {t('camera.take')}
        </Button>
      }
    >
      <div className="flex flex-col gap-3 text-sm">
        {problem ? (
          <p role="alert" className="text-danger">
            {t(`camera.${problem}`)}
          </p>
        ) : (
          <>
            <div className="relative overflow-hidden rounded-md bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                aria-label={t('camera.preview')}
                className="block max-h-[60svh] w-full object-contain"
              />
              {/* Рамка: лист целиком и крупно — так модель ошибается реже */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <div className="aspect-square h-3/4 rounded-lg border-2 border-dashed border-white/80" />
              </div>
            </div>
            <p className="text-ink-muted">{t('camera.hint')}</p>
          </>
        )}
        {camera && (camera.torch || camera.zoom) && (
          <div className="flex flex-wrap items-center gap-3">
            {camera.torch && (
              <Button
                size="sm"
                variant="secondary"
                aria-pressed={isTorchOn}
                onClick={() => toggleTorch(camera.track)}
              >
                {isTorchOn ? t('camera.torchOff') : t('camera.torchOn')}
              </Button>
            )}
            {camera.zoom && zoom !== null && (
              <label className="flex flex-1 items-center gap-2 text-ink-soft">
                {t('camera.zoom')}
                <input
                  type="range"
                  min={camera.zoom.min}
                  max={camera.zoom.max}
                  step={camera.zoom.step}
                  value={zoom}
                  onChange={(event) =>
                    changeZoom(camera.track, Number(event.target.value))
                  }
                  className="flex-1 accent-brand-700"
                />
              </label>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
