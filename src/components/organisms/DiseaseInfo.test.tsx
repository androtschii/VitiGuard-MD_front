import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DiseaseInfo } from './DiseaseInfo'

describe('DiseaseInfo', () => {
  it('описывает признаки, условия и меры против болезни', () => {
    render(<DiseaseInfo disease="downy_mildew" />)

    const info = screen.getByRole('region', { name: 'О болезни' })
    expect(info).toHaveTextContent(/белый пушистый налёт/)
    expect(info).toHaveTextContent(/правило «трёх десяток»/)
    expect(info).toHaveTextContent(/риск милдью на карте/)
    expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual(
      ['Признаки', 'Когда развивается', 'Что делать'],
    )
    expect(screen.getByText(/государственному реестру/)).toBeInTheDocument()
  })

  it('для здорового листа советует осмотры без оговорки о препаратах', () => {
    render(<DiseaseInfo disease="healthy" />)

    expect(screen.getByText(/раз в неделю и после дождей/)).toBeInTheDocument()
    expect(screen.queryByText(/государственному реестру/)).toBeNull()
  })
})
