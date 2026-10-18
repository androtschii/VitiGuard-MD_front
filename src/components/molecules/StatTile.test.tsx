import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatTile } from './StatTile'

describe('StatTile', () => {
  it('показывает подпись, число и пояснение', () => {
    render(
      <dl>
        <StatTile label="Участков" value={3} hint="всего" />
      </dl>,
    )

    expect(screen.getByRole('term')).toHaveTextContent('Участков')
    expect(screen.getAllByRole('definition').map((d) => d.textContent)).toEqual(
      ['3', 'всего'],
    )
  })

  it('без пояснения — только число', () => {
    render(
      <dl>
        <StatTile label="Площадь" value="7,3 га" />
      </dl>,
    )

    expect(screen.getAllByRole('definition')).toHaveLength(1)
  })
})
