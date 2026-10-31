import { describe, expect, it } from 'vitest'
import { directionsUrl, orderStops, routeLengthKm } from './wineRoute'

const a = { name: 'A', lat: 47, lon: 28 }
const far = { name: 'Далеко', lat: 46, lon: 29 }
const near = { name: 'Рядом', lat: 47.01, lon: 28.01 }

describe('wineRoute', () => {
  it('оставляет начало и едет к ближайшей точке', () => {
    expect(orderStops([a, far, near]).map((stop) => stop.name)).toEqual([
      'A',
      'Рядом',
      'Далеко',
    ])
    expect(orderStops([a, near, far]).map((stop) => stop.name)).toEqual([
      'A',
      'Рядом',
      'Далеко',
    ])
    expect(orderStops([])).toEqual([])
  })

  it('считает длину по прямой', () => {
    expect(routeLengthKm([a])).toBe(0)
    const length = routeLengthKm([a, near])
    expect(length).toBeGreaterThan(1)
    expect(length).toBeLessThan(2)
  })

  it('собирает ссылку для навигатора', () => {
    expect(directionsUrl([a, near])).toBe(
      'https://www.google.com/maps/dir/47,28/47.01,28.01',
    )
    expect(
      directionsUrl([{ name: 'B', lat: 47.1385303, lon: 28.8541397 }]),
    ).toBe('https://www.google.com/maps/dir/47.13853,28.85414')
  })
})
