import { describe, expect, it } from 'vitest'
import { rankClasses, softmax, toTensorData } from './leafTensor'

describe('leafTensor', () => {
  it('раскладывает пиксели по каналам и нормализует', () => {
    // Квадрат 2×2: красный, зелёный, синий, белый (альфа не учитывается)
    const rgba = new Uint8ClampedArray([
      255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 0,
    ])

    const data = toTensorData(rgba, 2, [0.5, 0.5, 0.5], [0.5, 0.5, 0.5])

    // Канал R, затем G, затем B: (x / 255 - 0.5) / 0.5
    expect(Array.from(data)).toEqual([1, -1, -1, 1, -1, 1, -1, 1, -1, -1, 1, 1])
  })

  it('без нормализации по каналу берёт среднее 0 и разброс 1', () => {
    const data = toTensorData(
      new Uint8ClampedArray([51, 102, 153, 0]),
      1,
      [],
      [],
    )

    expect(Array.from(data)).toEqual([0.2, 0.4, 0.6].map(Math.fround))
  })

  it('softmax устойчив к большим логитам и даёт сумму 1', () => {
    const probabilities = softmax([1000, 1000, 998])

    expect(probabilities.reduce((a, b) => a + b)).toBeCloseTo(1)
    expect(probabilities[0]).toBeCloseTo(probabilities[1] ?? 0)
    expect(probabilities[2]).toBeLessThan(probabilities[0] ?? 0)
  })

  it('классы по убыванию вероятности', () => {
    expect(rankClasses(['healthy', 'esca', 'black_rot'], [0.2, 0.7])).toEqual([
      { disease: 'esca', probability: 0.7 },
      { disease: 'healthy', probability: 0.2 },
      { disease: 'black_rot', probability: 0 },
    ])
  })
})
