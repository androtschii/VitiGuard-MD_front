// Камера телефона для съёмки листа (pr-078, pr-079): вспышка и зум есть не у
// всех камер и браузеров, поэтому сначала читаются возможности дорожки

export type CameraFeatures = {
  torch: boolean
  zoom: { min: number; max: number; step: number } | null
}

// Поля torch и zoom — расширение Image Capture, в типах DOM их нет
type ExtendedCapabilities = MediaTrackCapabilities & {
  torch?: boolean
  zoom?: { min: number; max: number; step?: number }
}

export function cameraFeatures(track: MediaStreamTrack): CameraFeatures {
  const capabilities = (track.getCapabilities?.() ?? {}) as ExtendedCapabilities
  const zoom = capabilities.zoom
  return {
    torch: capabilities.torch === true,
    zoom:
      zoom && zoom.max > zoom.min
        ? { min: zoom.min, max: zoom.max, step: zoom.step ?? 0.1 }
        : null,
  }
}

export function setTorch(track: MediaStreamTrack, on: boolean) {
  return track.applyConstraints({
    advanced: [{ torch: on } as MediaTrackConstraintSet],
  })
}

export function setZoom(track: MediaStreamTrack, zoom: number) {
  return track.applyConstraints({
    advanced: [{ zoom } as MediaTrackConstraintSet],
  })
}

export function canUseCamera() {
  return typeof navigator.mediaDevices?.getUserMedia === 'function'
}

// Задняя камера, если она есть; разрешение — побольше: лист снимают крупно
export function openCamera() {
  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: { ideal: 'environment' },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
  })
}

export type CameraProblem = 'denied' | 'missing' | 'failed'

export function cameraProblem(error: unknown): CameraProblem {
  const name = error instanceof DOMException ? error.name : ''
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'denied'
  if (name === 'NotFoundError' || name === 'OverconstrainedError')
    return 'missing'
  return 'failed'
}

// Кадр с видео — в JPEG-файл, как фото из галереи
export function captureFrame(video: HTMLVideoElement) {
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d')?.drawImage(video, 0, 0)
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(new File([blob], 'leaf-camera.jpg', { type: 'image/jpeg' }))
          : reject(new Error('frame')),
      'image/jpeg',
      0.92,
    )
  })
}
