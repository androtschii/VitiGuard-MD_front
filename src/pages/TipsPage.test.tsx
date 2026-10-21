import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '@/test/render'
import { TipsPage } from './TipsPage'

describe('TipsPage', () => {
  it('подсказки по съёмке, риску, работе без сети и безопасности', () => {
    renderWithRouter(<TipsPage />)

    for (const name of [
      'Как снимать лист',
      'Что значат уровни риска',
      'Работа без связи',
      'Безопасность при обработках',
      'Признаки болезней',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
    expect(screen.getByText(/Один лист крупным планом/)).toBeInTheDocument()
    // Признаки — те же, что в справке под результатом диагностики
    expect(screen.getByText('Эска')).toBeInTheDocument()
    expect(screen.getByText(/«Тигровые» полосы/)).toBeInTheDocument()
    expect(screen.queryByText('Здоровый лист')).toBeNull()
    expect(
      screen.getByRole('link', { name: 'Проверить лист по фото' }),
    ).toHaveAttribute('href', '/diagnosis')
  })
})
