import { describe, expect, it } from 'vitest'
import {
  CHART,
  labeledTicks,
  spreadLabels,
  timeScales,
} from './timeSeriesChart'

describe('timeSeriesChart', () => {
  it('ось времени занимает ширину контейнера между полями', () => {
    const day = 86_400_000
    const { x, width } = timeScales(
      [0, 10 * day],
      { min: 0, max: 1, step: 0.5 },
      200,
      360,
    )

    expect(width).toBe(360)
    expect(x(0)).toBe(CHART.left)
    expect(x(10 * day)).toBe(360 - CHART.right)
  })

  it('на узком графике подписан каждый второй или третий месяц', () => {
    const months = [1, 2, 3, 4, 5, 6, 7, 8]

    expect(labeledTicks(months, 544)).toEqual(months)
    expect(labeledTicks(months, 200)).toEqual([1, 3, 5, 7])
    expect(labeledTicks(months, 100)).toEqual([1, 4, 7])
    expect(labeledTicks([1], 10)).toEqual([1])
  })

  it('близкие подписи концов линий раздвигаются, далёкие — на месте', () => {
    expect(spreadLabels([50, 52])).toEqual([50, 62])
    expect(spreadLabels([80, 20])).toEqual([80, 20])
    // Порядок серий не важен: сдвигается нижняя
    expect(spreadLabels([45, 40, 41])).toEqual([64, 40, 52])
  })
})
