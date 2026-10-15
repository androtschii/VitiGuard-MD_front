import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { diagnosis } from '@/test/handlers'
import { DiagnosisOverlay } from './DiagnosisOverlay'

function overlaySrc(container: HTMLElement) {
  // Наложение декоративное (alt=""), поэтому ищется не по роли
  return container.querySelector('img[alt=""]')?.getAttribute('src') ?? null
}

describe('DiagnosisOverlay', () => {
  it('сначала показывает тепловую карту поверх фото', () => {
    const { container } = render(
      <DiagnosisOverlay photoUrl="blob:leaf" diagnosis={diagnosis} />,
    )

    expect(
      screen.getByRole('img', { name: 'Выбранное фото листа' }),
    ).toHaveAttribute('src', 'blob:leaf')
    expect(screen.getByRole('radio', { name: 'Тепловая карта' })).toBeChecked()
    expect(overlaySrc(container)).toBe(diagnosis.heatmap)
    expect(screen.getByText(/Яркие области/)).toBeInTheDocument()
  })

  it('переключается на маску поражения и только фото', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <DiagnosisOverlay photoUrl="blob:leaf" diagnosis={diagnosis} />,
    )

    await user.click(screen.getByRole('radio', { name: 'Поражение' }))

    expect(overlaySrc(container)).toBe(diagnosis.lesion?.mask)
    expect(
      screen.getByText(/Поражено около 18\s% площади листа/),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Только фото' }))

    expect(overlaySrc(container)).toBeNull()
  })

  it('без тепловой карты начинает с маски', () => {
    render(
      <DiagnosisOverlay
        photoUrl="blob:leaf"
        diagnosis={{ ...diagnosis, heatmap: null }}
      />,
    )

    expect(
      screen.queryByRole('radio', { name: 'Тепловая карта' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Поражение' })).toBeChecked()
  })

  it('без наложений ничего не показывает', () => {
    const { container } = render(
      <DiagnosisOverlay
        photoUrl="blob:leaf"
        diagnosis={{ ...diagnosis, heatmap: null, lesion: null }}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
