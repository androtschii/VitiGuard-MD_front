import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { useMapStore } from '@/store/map'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { VineyardFilters } from './VineyardFilters'

const merlot = { id: 'merlot', name: 'Merlot', berry_color: 'red' }

function serve(items: object[]) {
  server.use(
    http.get('/api/v1/vineyards', () =>
      HttpResponse.json({
        items,
        total: items.length,
        page: 1,
        size: 100,
        pages: 1,
      }),
    ),
  )
}

const item = (id: string, area: number, variety: object | null) => ({
  id,
  name: id,
  area_ha: area,
  variety,
  planting_year: null,
  geometry: { type: 'MultiPolygon', coordinates: [] },
  created_at: '2026-10-12T10:00:00Z',
  updated_at: '2026-10-12T10:00:00Z',
})

describe('VineyardFilters', () => {
  it('без участков не показывается', async () => {
    serve([])
    const { container } = renderWithQueryClient(<VineyardFilters />)

    await waitFor(() => expect(container).toBeEmptyDOMElement())
  })

  it('предлагает только сорта своих участков и считает найденные', async () => {
    const feteasca = {
      id: 'feteasca',
      name: 'Fetească Neagră',
      berry_color: 'red',
    }
    serve([
      item('a', 0.5, merlot),
      item('b', 12, merlot),
      item('c', 3, null),
      item('d', 2, feteasca),
    ])
    renderWithQueryClient(<VineyardFilters />)

    const variety = await screen.findByLabelText('Сорт')
    expect(
      [...variety.querySelectorAll('option')].map(
        (option) => option.textContent,
      ),
    ).toEqual(['Все сорта', 'Fetească Neagră', 'Merlot', 'Без сорта'])
    expect(screen.getByText('Показано 4 из 4')).toBeInTheDocument()

    await userEvent.selectOptions(variety, 'merlot')
    await userEvent.type(screen.getByLabelText('Площадь от, га'), '1,5')

    expect(useMapStore.getState().filter).toEqual({
      variety: 'merlot',
      minArea: 1.5,
      maxArea: null,
    })
    expect(screen.getByLabelText('Площадь от, га')).toHaveValue('1,5')
    expect(screen.getByText('Показано 1 из 4')).toBeInTheDocument()
  })

  it('сбрасывает фильтр и поля', async () => {
    serve([item('a', 0.5, merlot)])
    renderWithQueryClient(<VineyardFilters />)

    await userEvent.type(await screen.findByLabelText('до, га'), 'abc')
    expect(useMapStore.getState().filter.maxArea).toBeNull()
    await userEvent.clear(screen.getByLabelText('до, га'))
    await userEvent.type(screen.getByLabelText('до, га'), '-2')
    expect(useMapStore.getState().filter.maxArea).toBe(0)

    await userEvent.click(screen.getByRole('button', { name: 'Сбросить' }))

    expect(screen.getByLabelText('до, га')).toHaveValue('')
    expect(useMapStore.getState().filter.maxArea).toBeNull()
    expect(screen.getByRole('button', { name: 'Сбросить' })).toBeDisabled()
  })
})
