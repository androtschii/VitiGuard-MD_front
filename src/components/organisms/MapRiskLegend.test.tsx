import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { MapRiskLegend } from './MapRiskLegend'

describe('MapRiskLegend', () => {
  it('вне сезона без оценок легенду не показывает', async () => {
    const { container } = renderWithQueryClient(<MapRiskLegend />)

    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(container).toBeEmptyDOMElement()
  })

  it('с оценками показывает, что цвет — худший из двух рисков', async () => {
    server.use(
      http.get('/api/v1/risks/today', () =>
        HttpResponse.json([
          {
            vineyard_id: 'vineyard-1',
            day: '2026-06-10',
            downy: 'high',
            powdery: 'low',
          },
        ]),
      ),
    )
    renderWithQueryClient(<MapRiskLegend />)

    expect(
      await screen.findByText('Худший из милдью и оидиума'),
    ).toBeInTheDocument()
  })
})
