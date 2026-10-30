import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCountUp } from './useCountUp'

function stubMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', () => ({ matches }))
}

describe('useCountUp', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('без анимации сразу отдаёт цель', () => {
    stubMotion(false)
    const { result } = renderHook(() => useCountUp(42))

    expect(result.current).toBe(42)
  })

  it('без matchMedia сразу отдаёт цель', () => {
    vi.stubGlobal('matchMedia', undefined)
    const { result } = renderHook(() => useCountUp(7))

    expect(result.current).toBe(7)
  })

  it('доходит до цели и останавливается', () => {
    stubMotion(true)
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      frames.push(callback),
    )
    const cancel = vi.fn()
    vi.stubGlobal('cancelAnimationFrame', cancel)
    const start = performance.now()

    const { result, unmount } = renderHook(() => useCountUp(10, 100))
    expect(result.current).toBe(0)

    act(() => frames.shift()?.(start + 50))
    expect(result.current).toBeGreaterThan(0)
    expect(result.current).toBeLessThan(10)

    act(() => frames.shift()?.(start + 1000))
    expect(result.current).toBe(10)
    expect(frames).toHaveLength(0)

    unmount()
    expect(cancel).toHaveBeenCalled()
  })
})
