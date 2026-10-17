import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RiskLegend } from './RiskLegend'

describe('RiskLegend', () => {
  it('подписывает три уровня риска', () => {
    render(<RiskLegend />)

    const legend = screen.getByRole('region', {
      name: 'Цвет участков — риск на сегодня',
    })
    expect(legend).toHaveTextContent('низкий')
    expect(legend).toHaveTextContent('средний')
    expect(legend).toHaveTextContent('высокий')
    expect(legend).toHaveTextContent('Худший из милдью и оидиума')
  })
})
