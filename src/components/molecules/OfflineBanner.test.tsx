import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OfflineBanner } from './OfflineBanner'

function setOnline(value: boolean) {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(value)
  act(() => {
    window.dispatchEvent(new Event(value ? 'online' : 'offline'))
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('OfflineBanner', () => {
  it('при сети ничего не показывает', () => {
    const { container } = render(<OfflineBanner />)

    expect(container).toBeEmptyDOMElement()
  })

  it('появляется без сети и пропадает, когда сеть вернулась', () => {
    render(<OfflineBanner />)

    setOnline(false)
    expect(screen.getByRole('status')).toHaveTextContent('Нет сети')

    setOnline(true)
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('отписывается от событий при уходе со страницы', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<OfflineBanner />)

    unmount()

    expect(remove).toHaveBeenCalledWith('online', expect.any(Function))
    expect(remove).toHaveBeenCalledWith('offline', expect.any(Function))
  })
})
