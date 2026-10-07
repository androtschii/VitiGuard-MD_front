import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Card } from './Card'

describe('Card', () => {
  it('называет секцию по заголовку', () => {
    render(
      <Card title="Участок 1" description="Криково, 1,7 га">
        Содержимое
      </Card>,
    )

    expect(screen.getByRole('region', { name: 'Участок 1' })).toHaveTextContent(
      'Криково, 1,7 га',
    )
  })

  it('без заголовка не рисует шапку', () => {
    const { container } = render(<Card>Содержимое</Card>)

    expect(container.querySelector('header')).not.toBeInTheDocument()
  })

  it('показывает действия в шапке', () => {
    render(<Card title="Участок" actions={<button>Изменить</button>} />)

    expect(screen.getByRole('button', { name: 'Изменить' })).toBeInTheDocument()
  })
})
