import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { SaveOptions } from './SaveOptions'

const plot = (id: string, name: string) => ({
  id,
  name,
  geometry: { type: 'MultiPolygon', coordinates: [] },
  area_ha: 1,
  variety: null,
  planting_year: null,
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
})

function setup(save = true) {
  server.use(
    http.get('/api/v1/vineyards', () =>
      HttpResponse.json({
        items: [plot('v-1', 'Криково'), plot('v-2', 'Пуркарь')],
        total: 2,
        page: 1,
        size: 100,
        pages: 1,
      }),
    ),
  )
  const onSaveChange = vi.fn()
  const onVineyardChange = vi.fn()
  renderWithQueryClient(
    <SaveOptions
      save={save}
      onSaveChange={onSaveChange}
      vineyardId="v-1"
      onVineyardChange={onVineyardChange}
    />,
  )
  return { onSaveChange, onVineyardChange }
}

describe('SaveOptions', () => {
  it('меняет участок и выключает сохранение', async () => {
    const { onSaveChange, onVineyardChange } = setup()
    const select = await screen.findByLabelText('Участок')
    expect(select).toHaveValue('v-1')

    await userEvent.selectOptions(select, 'v-2')
    await userEvent.selectOptions(select, '')
    await userEvent.click(screen.getByRole('checkbox'))

    expect(onVineyardChange.mock.calls).toEqual([['v-2'], ['']])
    expect(onSaveChange).toHaveBeenCalledWith(false)
  })

  it('без сохранения участок не спрашивает', async () => {
    setup(false)

    expect(await screen.findByRole('checkbox')).not.toBeChecked()
    expect(screen.queryByLabelText('Участок')).toBeNull()
  })
})
