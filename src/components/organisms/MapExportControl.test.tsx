import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Map } from 'maplibre-gl'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MapContext } from '@/lib/mapContext'
import * as mapImage from '@/lib/mapImage'
import { MapExportControl } from './MapExportControl'

function renderControl(map: Map | null) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext value={map}>{children}</MapContext>
  )
  return render(<MapExportControl />, { wrapper })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('MapExportControl', () => {
  it('без карты кнопку не показывает', () => {
    const { container } = renderControl(null)

    expect(container).toBeEmptyDOMElement()
  })

  it('сохраняет видимую часть карты в PNG', async () => {
    const canvas = document.createElement('canvas')
    const png = new Blob(['png'], { type: 'image/png' })
    vi.spyOn(mapImage, 'captureMap').mockResolvedValue(canvas)
    vi.spyOn(mapImage, 'toPngBlob').mockResolvedValue(png)
    const save = vi.spyOn(mapImage, 'saveBlob').mockImplementation(() => {})
    renderControl({} as Map)

    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить карту в PNG' }),
    )

    expect(save).toHaveBeenCalledWith(
      png,
      expect.stringMatching(/^vitiguard-map-\d{4}-\d{2}-\d{2}\.png$/),
    )
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('сообщает, если сохранить не удалось', async () => {
    vi.spyOn(mapImage, 'captureMap').mockRejectedValue(new Error('tainted'))
    renderControl({} as Map)

    await userEvent.click(
      screen.getByRole('button', { name: 'Сохранить карту в PNG' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Не удалось сохранить карту',
    )
  })
})
