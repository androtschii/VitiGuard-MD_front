import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function Broken({ broken }: { broken: boolean }) {
  if (broken) throw new Error('сбой отрисовки')
  return <p>Всё хорошо</p>
}

describe('ErrorBoundary', () => {
  it('пока ошибок нет, показывает содержимое', () => {
    render(
      <ErrorBoundary fallback={() => <p>Ошибка</p>}>
        <Broken broken={false} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Всё хорошо')).toBeInTheDocument()
  })

  it('при ошибке показывает запасной экран и сообщает об ошибке', () => {
    // React сам пишет пойманную ошибку в консоль, в выводе тестов она лишняя
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const onError = vi.fn()

    render(
      <ErrorBoundary fallback={() => <p>Ошибка</p>} onError={onError}>
        <Broken broken />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Ошибка')).toBeInTheDocument()
    expect(onError).toHaveBeenCalledOnce()
    expect(onError.mock.calls[0]?.[0]).toHaveProperty(
      'message',
      'сбой отрисовки',
    )
  })

  it('после сброса снова пробует показать содержимое', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    function Harness() {
      const [broken, setBroken] = useState(true)
      return (
        <ErrorBoundary
          fallback={(reset) => (
            <button
              onClick={() => {
                setBroken(false)
                reset()
              }}
            >
              Повторить
            </button>
          )}
        >
          <Broken broken={broken} />
        </ErrorBoundary>
      )
    }
    render(<Harness />)

    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }))

    expect(screen.getByText('Всё хорошо')).toBeInTheDocument()
  })
})
