import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { useMapStore } from '@/store/map'
import { scan, vineyard } from '@/test/ndviData'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { NdviTimeline } from './NdviTimeline'

function useHistory() {
  server.use(
    http.get('/api/v1/vineyards', () =>
      HttpResponse.json({
        items: [vineyard('v1', 'Криково'), vineyard('v2', 'Пуркарь')],
        total: 2,
        page: 1,
        size: 100,
        pages: 1,
      }),
    ),
    http.get('/api/v1/vineyards/:id/vegetation', ({ params }) =>
      HttpResponse.json(
        params.id === 'v1'
          ? [scan('june', '2026-06-25'), scan('cloudy', '2026-07-12', false)]
          : [scan('august', '2026-08-29')],
      ),
    ),
  )
}

describe('NdviTimeline', () => {
  it('пока слой выключен, не показывается', () => {
    useHistory()
    renderWithQueryClient(<NdviTimeline />)

    expect(screen.queryByRole('slider')).not.toBeInTheDocument()
  })

  it('по умолчанию — последний снимок, шкала по дням всех участков', async () => {
    useMapStore.setState({ showNdvi: true })
    useHistory()
    renderWithQueryClient(<NdviTimeline />)

    const slider = await screen.findByRole('slider', { name: /Дата снимка/ })
    expect(slider).toHaveAttribute('max', '1')
    expect(slider).toHaveValue('1')
    expect(screen.getByText('последний снимок')).toBeInTheDocument()
    expect(screen.getByText('25 июн. 2026 г.')).toBeInTheDocument()
  })

  it('выбор дня на шкале и возврат к последнему снимку', async () => {
    useMapStore.setState({ showNdvi: true })
    useHistory()
    renderWithQueryClient(<NdviTimeline />)
    const slider = await screen.findByRole('slider')

    fireEvent.change(slider, { target: { value: '0' } })
    expect(useMapStore.getState().ndviDay).toBe('2026-06-25')
    expect(slider).toHaveAttribute('aria-valuetext', '25 июн. 2026 г.')

    fireEvent.change(slider, { target: { value: '1' } })
    expect(useMapStore.getState().ndviDay).toBeNull()
  })

  it('с одним днём шкала не нужна', async () => {
    useMapStore.setState({ showNdvi: true })
    useHistory()
    const requested = vi.fn()
    server.use(
      http.get('/api/v1/vineyards/:id/vegetation', () => {
        requested()
        return HttpResponse.json([scan('june', '2026-06-25')])
      }),
    )
    renderWithQueryClient(<NdviTimeline />)

    await waitFor(() => expect(requested).toHaveBeenCalledTimes(2))
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()
  })
})
