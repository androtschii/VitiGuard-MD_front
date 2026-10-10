import { act, render, screen } from '@testing-library/react'
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
import { DrawPolygonControl } from './DrawPolygonControl'

type Listener = (...args: unknown[]) => void

// Заглушка Terra Draw: запоминает режимы и подписки, а «нарисованные» фигуры
// тест кладёт в features сам
class FakeDraw {
  listeners: Record<string, Listener> = {}
  features: Record<string, unknown> = {}
  mode = 'static'
  start = vi.fn()
  stop = vi.fn()
  clear = vi.fn()
  selectFeature = vi.fn()
  setMode = vi.fn((mode: string) => {
    this.mode = mode
  })
  on = vi.fn((event: string, listener: Listener) => {
    this.listeners[event] = listener
  })
  getSnapshotFeature = vi.fn((id: string) => this.features[id])

  emit(event: string, ...args: unknown[]) {
    act(() => this.listeners[event]?.(...args))
  }
}

vi.mock('terra-draw', () => ({
  TerraDraw: vi.fn(function () {
    return new FakeDraw()
  }),
  TerraDrawPolygonMode: vi.fn(class {}),
  TerraDrawSelectMode: vi.fn(class {}),
  ValidateNotSelfIntersecting: vi.fn(() => ({ valid: true })),
}))
vi.mock('terra-draw-maplibre-gl-adapter', () => ({
  TerraDrawMapLibreGLAdapter: vi.fn(class {}),
}))

const parcel = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [28.8, 47.0],
        [28.81, 47.0],
        [28.81, 47.01],
        [28.8, 47.01],
        [28.8, 47.0],
      ],
    ],
  },
}

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

const lastDraw = () =>
  vi.mocked(TerraDraw).mock.results.at(-1)?.value as FakeDraw

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

  it('останавливает рисование при уходе со страницы', () => {
    const { unmount } = renderControl()

    unmount()

    expect(lastDraw().stop).toHaveBeenCalledOnce()
  })
})
