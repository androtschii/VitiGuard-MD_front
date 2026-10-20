import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { vineyard } from '@/test/ndviData'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { ComparePage } from './ComparePage'

function useVineyards(count: number) {
  const items = [
    vineyard('v1', 'Криково'),
    vineyard('v2', 'Пуркарь'),
    vineyard('v3', 'Етулия'),
  ].slice(0, count)
  server.use(
    http.get('/api/v1/vineyards', () =>
      HttpResponse.json({ items, total: count, page: 1, size: 100, pages: 1 }),
    ),
    http.get('/api/v1/vineyards/:id/vegetation', () => HttpResponse.json([])),
    http.get('/api/v1/vineyards/:id/vegetation/anomalies', () =>
      HttpResponse.json([]),
    ),
  )
}

function renderPage() {
  renderWithQueryClient(
    <MemoryRouter initialEntries={['/compare']}>
      <ComparePage />
    </MemoryRouter>,
  )
}

describe('ComparePage', () => {
  it('по умолчанию сравнивает два первых участка', async () => {
    useVineyards(3)
    renderPage()

    expect(
      await screen.findByRole('columnheader', { name: 'Криково' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Пуркарь' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Участок A')).toHaveValue('v1')
    expect(screen.getByLabelText('Участок B')).toHaveValue('v2')
  })

  it('участки выбираются, одинаковые не сравниваются', async () => {
    useVineyards(3)
    renderPage()
    await screen.findByRole('columnheader', { name: 'Пуркарь' })

    await userEvent.selectOptions(screen.getByLabelText('Участок B'), 'v3')
    expect(
      screen.getByRole('columnheader', { name: 'Етулия' }),
    ).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText('Участок A'), 'v3')
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Выберите два разных участка',
    )
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('с одним участком предлагает нарисовать ещё', async () => {
    useVineyards(1)
    renderPage()

    expect(
      await screen.findByText(/нужно хотя бы два участка/),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Открыть карту' })).toHaveAttribute(
      'href',
      '/map',
    )
  })
})
