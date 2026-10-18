import type { Map } from 'maplibre-gl'

// Картинка карты для отчёта или письма (pr-033). Буфер WebGL после кадра
// очищается, поэтому пиксели читаются в обработчике 'render' того же кадра —
// без preserveDrawingBuffer, который замедлил бы карту постоянно

const PADDING = 6
const FONT_SIZE = 12

// Подпись источников из углового блока карты: лицензия OpenStreetMap требует
// указывать её и на сохранённом изображении
export function attributionText(container: HTMLElement) {
  const inner = container.querySelector('.maplibregl-ctrl-attrib-inner')
  return inner?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
}

export function mapFileName(now = new Date()) {
  const day = now.toISOString().slice(0, 10)
  return `vitiguard-map-${day}.png`
}

// Копия кадра с подписью источников в правом нижнем углу
export function withAttribution(source: HTMLCanvasElement, text: string) {
  const canvas = document.createElement('canvas')
  canvas.width = source.width
  canvas.height = source.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D недоступен')
  context.drawImage(source, 0, 0)
  if (text) {
    const scale = source.width / (source.clientWidth || source.width)
    const size = FONT_SIZE * scale
    const padding = PADDING * scale
    context.font = `${size}px sans-serif`
    const width = context.measureText(text).width + padding * 2
    const height = size + padding * 2
    context.fillStyle = 'rgba(255, 255, 255, 0.85)'
    context.fillRect(
      canvas.width - width,
      canvas.height - height,
      width,
      height,
    )
    context.fillStyle = '#1f2937'
    context.textBaseline = 'middle'
    context.fillText(
      text,
      canvas.width - width + padding,
      canvas.height - height / 2,
    )
  }
  return canvas
}

export function captureMap(map: Map) {
  return new Promise<HTMLCanvasElement>((resolve, reject) => {
    map.once('render', () => {
      try {
        resolve(
          withAttribution(map.getCanvas(), attributionText(map.getContainer())),
        )
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)))
      }
    })
    map.triggerRepaint()
  })
}

export function toPngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) =>
      blob ? resolve(blob) : reject(new Error('Не удалось сохранить PNG')),
    )
  })
}

export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}
