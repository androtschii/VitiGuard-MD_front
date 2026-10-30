import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DownloadButton } from './DownloadButton'

const state = () =>
  screen.getByRole('button').querySelector('svg')?.getAttribute('data-state')

describe('DownloadButton', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('во время загрузки занята и недоступна', () => {
    render(<DownloadButton isLoading>Скачать</DownloadButton>)

    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    expect(state()).toBe('loading')
  })

  it('после загрузки ненадолго показывает галочку', () => {
    const { rerender } = render(
      <DownloadButton isLoading>Скачать</DownloadButton>,
    )

    rerender(<DownloadButton>Скачать</DownloadButton>)
    expect(state()).toBe('done')
    expect(screen.getByRole('button')).toBeEnabled()

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(state()).toBe('idle')
  })

  it('при ошибке галочки нет', () => {
    const { rerender } = render(
      <DownloadButton isLoading>Скачать</DownloadButton>,
    )

    rerender(<DownloadButton failed>Скачать</DownloadButton>)

    expect(state()).toBe('idle')
  })

  it('остаётся недоступной, когда это задано снаружи', () => {
    render(<DownloadButton disabled>Скачать</DownloadButton>)

    expect(screen.getByRole('button')).toBeDisabled()
    expect(state()).toBe('idle')
  })
})
