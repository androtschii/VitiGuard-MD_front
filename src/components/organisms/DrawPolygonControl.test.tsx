import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Map } from 'maplibre-gl'
import type { ReactNode } from 'react'
import {
  TerraDraw,
  TerraDrawPolygonMode,
  ValidateNotSelfIntersecting,
} from 'terra-draw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MapContext } from '@/lib/mapContext'
import { useMapStore } from '@/store/map'
import { lastDraw, parcel } from '@/test/terraDraw'
import { DrawPolygonControl } from './DrawPolygonControl'

const fakeMap = {} as Map

function renderControl(
  map: Map | null = fakeMap,
  props: Partial<Parameters<typeof DrawPolygonControl>[0]> = {},
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MapContext value={map}>{children}</MapContext>
  )
  return render(<DrawPolygonControl {...props} />, { wrapper })
}

describe('DrawPolygonControl', () => {
  beforeEach(() => {
    vi.mocked(TerraDraw).mockClear()
  })

  it('пока карта не загружена, ничего не показывает', () => {
    const { container } = renderControl(null)

    expect(container).toBeEmptyDOMElement()
    expect(TerraDraw).not.toHaveBeenCalled()
  })

  it('включает режим рисования и подсказывает, как закончить', async () => {
    renderControl()

    await userEvent.click(
      screen.getByRole('button', { name: 'Нарисовать участок' }),
    )

    expect(lastDraw().start).toHaveBeenCalledOnce()
    expect(lastDraw().setMode).toHaveBeenCalledWith('polygon')
    expect(screen.getByText(/нажмите Enter/)).toBeInTheDocument()
  })

  it('после завершения показывает площадь и включает правку контура', async () => {
    const onChange = vi.fn()
    renderControl(fakeMap, { onChange })
    await userEvent.click(
      screen.getByRole('button', { name: 'Нарисовать участок' }),
    )
    const draw = lastDraw()
    draw.features.parcel = parcel

    draw.emit('finish', 'parcel')

    expect(screen.getByText('Площадь: 84,32 га')).toBeInTheDocument()
    expect(draw.setMode).toHaveBeenLastCalledWith('select')
    expect(draw.selectFeature).toHaveBeenCalledWith('parcel')
    expect(onChange).toHaveBeenCalledWith(parcel.geometry)
  })

  it('пересчитывает площадь при правке контура', async () => {
    renderControl()
    await userEvent.click(
      screen.getByRole('button', { name: 'Нарисовать участок' }),
    )
    const draw = lastDraw()
    draw.features.parcel = parcel
    draw.emit('finish', 'parcel')

    draw.features.parcel = {
      ...parcel,
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [28.8, 47.0],
            [28.805, 47.0],
            [28.805, 47.01],
            [28.8, 47.01],
            [28.8, 47.0],
          ],
        ],
      },
    }
    draw.emit('change', ['parcel'], 'update')

    expect(screen.getByText('Площадь: 42,16 га')).toBeInTheDocument()
  })

  it('не реагирует на чужие изменения и незавершённые фигуры', () => {
    const onChange = vi.fn()
    renderControl(fakeMap, { onChange })
    const draw = lastDraw()
    draw.features.line = { geometry: { type: 'LineString' } }

    draw.emit('finish', 'line')
    draw.emit('change', ['other'], 'update')

    expect(onChange).not.toHaveBeenCalled()
    expect(
      screen.getByRole('button', { name: 'Нарисовать участок' }),
    ).toBeInTheDocument()
  })

  it('отмена и удаление очищают карту и возвращают к началу', async () => {
    const onChange = vi.fn()
    renderControl(fakeMap, { onChange })
    await userEvent.click(
      screen.getByRole('button', { name: 'Нарисовать участок' }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Отменить' }))

    const draw = lastDraw()
    expect(draw.clear).toHaveBeenCalledOnce()
    expect(draw.setMode).toHaveBeenLastCalledWith('static')

    await userEvent.click(
      screen.getByRole('button', { name: 'Нарисовать участок' }),
    )
    draw.features.parcel = parcel
    draw.emit('finish', 'parcel')
    await userEvent.click(
      screen.getByRole('button', { name: 'Удалить контур' }),
    )

    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(
      screen.getByRole('button', { name: 'Нарисовать участок' }),
    ).toBeInTheDocument()
  })

  it('изменение уже удалённого контура не ломает площадь', async () => {
    renderControl()
    await userEvent.click(
      screen.getByRole('button', { name: 'Нарисовать участок' }),
    )
    const draw = lastDraw()
    draw.features.parcel = parcel
    draw.emit('finish', 'parcel')

    delete draw.features.parcel
    draw.emit('change', ['parcel'], 'update')

    expect(screen.getByText('Площадь: 84,32 га')).toBeInTheDocument()
  })

  it('не даёт завершить самопересекающийся контур', () => {
    renderControl()
    const options = vi.mocked(TerraDrawPolygonMode).mock.calls.at(-1)?.[0]
    vi.mocked(ValidateNotSelfIntersecting).mockReturnValueOnce({
      valid: false,
      reason: 'self-intersecting',
    })

    const result = options?.validation?.(parcel as never, {} as never)

    expect(result).toEqual({ valid: false, reason: 'self-intersecting' })
    expect(ValidateNotSelfIntersecting).toHaveBeenCalledWith(parcel)
  })

  it('изменения, которые Terra Draw присылает при удалении, контур не возвращают', async () => {
    const onChange = vi.fn()
    renderControl(fakeMap, { onChange })
    await userEvent.click(
      screen.getByRole('button', { name: 'Нарисовать участок' }),
    )
    const draw = lastDraw()
    draw.features.parcel = parcel
    draw.emit('finish', 'parcel')
    // Как настоящий Terra Draw: перед удалением снимает выделение — это «update»
    draw.clear.mockImplementation(() =>
      draw.listeners.change?.(['parcel'], 'update'),
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Удалить контур' }),
    )

    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(screen.queryByText(/Площадь/)).not.toBeInTheDocument()
  })

  it('на время рисования и правки отключает выбор участков', async () => {
    renderControl()

    await userEvent.click(
      screen.getByRole('button', { name: 'Нарисовать участок' }),
    )
    expect(useMapStore.getState().isDrawing).toBe(true)

    await userEvent.click(screen.getByRole('button', { name: 'Отменить' }))
    expect(useMapStore.getState().isDrawing).toBe(false)
  })

  it('недоступно, пока работает линейка', () => {
    useMapStore.setState({ isDrawing: true })
    renderControl()

    expect(
      screen.getByRole('button', { name: 'Нарисовать участок' }),
    ).toBeDisabled()
  })

  it('останавливает рисование при уходе со страницы', () => {
    const { unmount } = renderControl()

    useMapStore.setState({ isDrawing: true })

    unmount()

    expect(lastDraw().stop).toHaveBeenCalledOnce()
    expect(useMapStore.getState().isDrawing).toBe(false)
  })

  it('не падает, если карту удалили раньше рисования', () => {
    const { unmount } = renderControl()
    useMapStore.setState({ isDrawing: true })
    lastDraw().stop.mockImplementation(() => {
      throw new TypeError(
        "Cannot read properties of undefined (reading 'setData')",
      )
    })

    expect(() => unmount()).not.toThrow()
    expect(useMapStore.getState().isDrawing).toBe(false)
  })
})
