// Подготовка фото и разбор ответа классификатора в браузере (pr-073): то же,
// что делает сервер (app/ml/classifier.py), чтобы ответы совпадали

// Пиксели RGBA квадрата size×size → тензор NCHW float32 с нормализацией
// по каналам, как при обучении
export function toTensorData(
  rgba: Uint8ClampedArray,
  size: number,
  mean: number[],
  std: number[],
) {
  const plane = size * size
  const data = new Float32Array(3 * plane)
  for (let i = 0; i < plane; i++) {
    for (let c = 0; c < 3; c++) {
      const value = (rgba[i * 4 + c] ?? 0) / 255
      data[c * plane + i] = (value - (mean[c] ?? 0)) / (std[c] ?? 1)
    }
  }
  return data
}

export function softmax(logits: ArrayLike<number>) {
  const values = Array.from(logits)
  const peak = Math.max(...values)
  const exp = values.map((value) => Math.exp(value - peak))
  const sum = exp.reduce((total, value) => total + value, 0)
  return exp.map((value) => value / sum)
}

export type RankedClass = { disease: string; probability: number }

// Классы по убыванию вероятности
export function rankClasses(classes: string[], probabilities: number[]) {
  return classes
    .map((disease, i) => ({ disease, probability: probabilities[i] ?? 0 }))
    .sort((a, b) => b.probability - a.probability)
}
