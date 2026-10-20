// Квадратная рамка кадра в пикселях исходного фото. Квадрат — потому что
// модель видит снимок квадратом 224 × 224: прямоугольный кадр она сжимает,
// и лист искажается
export type Square = { x: number; y: number; size: number }

// Меньше пятой части короткой стороны лист уже не разглядеть
export const MIN_CROP_SHARE = 0.2
// Длинной стороны в 2048 пикселей модели хватает с запасом, а файл остаётся
// намного меньше ограничения в 10 МБ
export const MAX_CROP_SIDE = 2048

export function clampSquare(square: Square, width: number, height: number) {
  const side = Math.min(width, height)
  const size = Math.min(Math.max(square.size, side * MIN_CROP_SHARE), side)
  return {
    size,
    x: Math.min(Math.max(square.x, 0), width - size),
    y: Math.min(Math.max(square.y, 0), height - size),
  }
}

export function centeredSquare(width: number, height: number): Square {
  const size = Math.min(width, height)
  return { x: (width - size) / 2, y: (height - size) / 2, size }
}

// Новый размер — вокруг того же центра, насколько позволяют края фото
export function resizeSquare(
  square: Square,
  size: number,
  width: number,
  height: number,
) {
  const centerX = square.x + square.size / 2
  const centerY = square.y + square.size / 2
  return clampSquare(
    { x: centerX - size / 2, y: centerY - size / 2, size },
    width,
    height,
  )
}

export function croppedName(name: string) {
  return `${name.replace(/\.[^.]+$/, '')}-crop.jpg`
}

export function cropPhoto(
  image: HTMLImageElement,
  square: Square,
  name: string,
) {
  const side = Math.min(Math.round(square.size), MAX_CROP_SIDE)
  const canvas = document.createElement('canvas')
  canvas.width = side
  canvas.height = side
  const context = canvas.getContext('2d')
  if (!context) return Promise.reject(new Error('Canvas 2D недоступен'))
  context.drawImage(
    image,
    square.x,
    square.y,
    square.size,
    square.size,
    0,
    0,
    side,
    side,
  )
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(new File([blob], croppedName(name), { type: 'image/jpeg' }))
          : reject(new Error('Не удалось кадрировать фото')),
      'image/jpeg',
      0.92,
    )
  })
}
