import { afterEach, describe, expect, it, vi } from 'vitest'
import { BASEMAP_STORAGE_KEY, useMapStore } from './map'

async function freshStore() {
  vi.resetModules()
  return (await import('./map')).useMapStore
}

afterEach(() => {
  useMapStore.setState(useMapStore.getInitialState(), true)
})

describe('хранилище карты', () => {
  it('по умолчанию показывает схему', async () => {
    const store = await freshStore()

    expect(store.getState().basemap).toBe('scheme')
  })

  it('восстанавливает сохранённую подложку', async () => {
    localStorage.setItem(BASEMAP_STORAGE_KEY, 'hybrid')

    const store = await freshStore()

    expect(store.getState().basemap).toBe('hybrid')
  })

  it('неизвестное значение в хранилище заменяет схемой', async () => {
    localStorage.setItem(BASEMAP_STORAGE_KEY, 'terrain')

    const store = await freshStore()

    expect(store.getState().basemap).toBe('scheme')
  })

  it('без доступа к хранилищу показывает схему', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })

    const store = await freshStore()

    expect(store.getState().basemap).toBe('scheme')
  })

  it('сохраняет выбор', () => {
    useMapStore.getState().setBasemap('satellite')

    expect(useMapStore.getState().basemap).toBe('satellite')
    expect(localStorage.getItem(BASEMAP_STORAGE_KEY)).toBe('satellite')
  })

  it('меняет подложку, даже если сохранить её нельзя', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    useMapStore.getState().setBasemap('hybrid')

    expect(useMapStore.getState().basemap).toBe('hybrid')
  })
})
