import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Vineyard } from '@/api/vineyards'
import * as exifGps from '@/lib/exifGps'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { PhotoLocation } from './PhotoLocation'

const plot: Vineyard = {
  id: 'vineyard-1',
  name: 'Криково',
  area_ha: 1.7,
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [28.86, 47.14],
          [28.87, 47.14],
          [28.87, 47.15],
          [28.86, 47.15],
          [28.86, 47.14],
        ],
      ],
    ],
  },
  variety: null,
  planting_year: null,
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
}

const photo = () => new File(['jpeg'], 'leaf.jpg', { type: 'image/jpeg' })

function servePlots() {
  server.use(
    http.get('/api/v1/vineyards', () =>
      HttpResponse.json({
        items: [plot],
        total: 1,
        page: 1,
        size: 100,
        pages: 1,
      }),
    ),
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('PhotoLocation', () => {
  it('называет участок, на котором снято фото', async () => {
    servePlots()
    vi.spyOn(exifGps, 'readPhotoGps').mockResolvedValue({
      latitude: 47.145,
      longitude: 28.865,
    })
    renderWithQueryClient(<PhotoLocation file={photo()} />)

    expect(await screen.findByText(/на участке «Криково»/)).toHaveTextContent(
      'Снято в точке 47,14500, 28,86500',
    )
  })

  it('точка вне участков', async () => {
    servePlots()
    vi.spyOn(exifGps, 'readPhotoGps').mockResolvedValue({
      latitude: 46.9,
      longitude: 28.6,
    })
    renderWithQueryClient(<PhotoLocation file={photo()} />)

    expect(await screen.findByText(/вне ваших участков/)).toBeInTheDocument()
  })

  it('без GPS в фото ничего не показывает', async () => {
    const read = vi.spyOn(exifGps, 'readPhotoGps').mockResolvedValue(null)
    const { container } = renderWithQueryClient(
      <PhotoLocation file={photo()} />,
    )

    await waitFor(() => expect(read).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })

  it('координаты прежнего фото не показывает у нового', async () => {
    const read = vi
      .spyOn(exifGps, 'readPhotoGps')
      .mockResolvedValueOnce({ latitude: 46.9, longitude: 28.6 })
      .mockResolvedValueOnce(null)
    const queryClient = new QueryClient()
    const { rerender } = render(<PhotoLocation file={photo()} />, {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    })
    await screen.findByText(/Снято в точке/)

    rerender(<PhotoLocation file={photo()} />)

    await waitFor(() => expect(read).toHaveBeenCalledTimes(2))
    expect(screen.queryByText(/Снято в точке/)).toBeNull()
  })

  it('без фото не читает файл', () => {
    const read = vi.spyOn(exifGps, 'readPhotoGps')
    renderWithQueryClient(<PhotoLocation file={null} />)

    expect(read).not.toHaveBeenCalled()
  })
})
