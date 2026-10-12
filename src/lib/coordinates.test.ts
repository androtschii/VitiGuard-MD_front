import { describe, expect, it } from 'vitest'
import { parseCoordinates } from './coordinates'

describe('parseCoordinates', () => {
  it.each([
    '47.1405, 28.861',
    '47.1405,28.861',
    '47.1405 28.861',
    '  47.1405 ,  28.861  ',
    '47,1405; 28,861',
    '47,1405 28,861',
  ])('понимает «%s»', (text) => {
    expect(parseCoordinates(text)).toEqual({ lat: 47.1405, lon: 28.861 })
  })

  it('принимает отрицательные значения', () => {
    expect(parseCoordinates('-33.9, -70.6')).toEqual({ lat: -33.9, lon: -70.6 })
  })

  it.each([
    'Криково',
    '47.1405',
    '95, 28.86',
    '47.14, 200',
    '47.14, 28.86, 5',
    '',
  ])('не считает координатами «%s»', (text) => {
    expect(parseCoordinates(text)).toBeNull()
  })
})
