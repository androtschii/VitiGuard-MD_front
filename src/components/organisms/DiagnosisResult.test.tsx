import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { diagnosis } from '@/test/handlers'
import { DiagnosisResult } from './DiagnosisResult'

describe('DiagnosisResult', () => {
  it('показывает диагноз, уверенность и вероятности по убыванию', () => {
    render(<DiagnosisResult diagnosis={diagnosis} />)

    expect(screen.getByText('Оидиум', { selector: 'p' })).toHaveClass(
      'text-danger',
    )
    expect(screen.getByText(/Уверенность модели: 93\s%/)).toBeInTheDocument()
    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items).toHaveLength(6)
    expect(items[0]).toHaveTextContent(/Оидиум93\s%/)
    expect(items[1]).toHaveTextContent(/Милдью4\s%/)
    expect(screen.getByText(/Модель: efficientnet_b0/)).toBeInTheDocument()
    expect(screen.queryByText(/не уверена/)).not.toBeInTheDocument()
  })

  it('здоровый лист выделен зелёным', () => {
    render(
      <DiagnosisResult
        diagnosis={{ ...diagnosis, disease: 'healthy', top: [] }}
      />,
    )

    expect(screen.getByText('Здоровый лист')).toHaveClass('text-emerald-700')
  })

  it('предупреждает, когда модель не уверена', () => {
    render(
      <DiagnosisResult
        diagnosis={{ ...diagnosis, confidence: 0.41, low_confidence: true }}
      />,
    )

    expect(screen.getByText(/Модель не уверена в ответе/)).toBeInTheDocument()
    expect(screen.getByText(/Уверенность модели: 41\s%/)).toBeInTheDocument()
  })
})
