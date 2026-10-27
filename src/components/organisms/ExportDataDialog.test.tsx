import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as mapImage from '@/lib/mapImage'
import { renderWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { ExportDataDialog } from './ExportDataDialog'

function renderDialog(onClose = vi.fn()) {
  renderWithQueryClient(
    <ExportDataDialog
      vineyardId="v-1"
      vineyardName="Криково"
      open
      onClose={onClose}
    />,
  )
  return { user: userEvent.setup(), onClose }
}

describe('ExportDataDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-06-10T12:00:00Z'))
    vi.spyOn(mapImage, 'saveBlob').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('отображает окно выгрузки с форматом XLSX и датами сезона по умолчанию', () => {
    renderDialog()

    expect(
      screen.getByRole('dialog', { name: 'Выгрузка данных: Криково' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: 'XLSX (электронная таблица)' }),
    ).toBeChecked()
    expect(
      screen.getByRole('radio', { name: 'CSV (архив ZIP)' }),
    ).not.toBeChecked()

    const startInput = screen.getByLabelText('Начало периода')
    const endInput = screen.getByLabelText('Конец периода')
    expect(startInput).toHaveValue('2026-03-01')
    expect(endInput).toHaveValue('2026-06-10')
  })

  it('скачивает данные в формате XLSX и закрывает окно', async () => {
    let capturedUrl = ''
    server.use(
      http.get('/api/v1/vineyards/v-1/data', ({ request }) => {
        capturedUrl = request.url
        return new HttpResponse(new Uint8Array([1, 2, 3]), {
          headers: {
            'Content-Type':
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition':
              'attachment; filename="vitiguard-data-2026-03-01-2026-06-10.xlsx"',
          },
        })
      }),
    )

    const { user, onClose } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Скачать' }))

    expect(capturedUrl).toContain('format=xlsx')
    expect(capturedUrl).toContain('start=2026-03-01')
    expect(capturedUrl).toContain('end=2026-06-10')
    expect(onClose).toHaveBeenCalled()
    expect(mapImage.saveBlob).toHaveBeenCalled()
  })

  it('позволяет выбрать CSV и скачать архив', async () => {
    let capturedUrl = ''
    server.use(
      http.get('/api/v1/vineyards/v-1/data', ({ request }) => {
        capturedUrl = request.url
        return new HttpResponse(new Uint8Array([4, 5]), {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition':
              'attachment; filename="vitiguard-data-2026-03-01-2026-06-10.zip"',
          },
        })
      }),
    )

    const { user, onClose } = renderDialog()

    await user.click(screen.getByRole('radio', { name: 'CSV (архив ZIP)' }))
    await user.click(screen.getByRole('button', { name: 'Скачать' }))

    expect(capturedUrl).toContain('format=csv')
    expect(onClose).toHaveBeenCalled()
  })

  it('отправляет выбранный период и формат после смены решения', async () => {
    let capturedUrl = ''
    server.use(
      http.get('/api/v1/vineyards/v-1/data', ({ request }) => {
        capturedUrl = request.url
        return new HttpResponse(new Uint8Array([1]), {
          headers: { 'Content-Type': 'application/octet-stream' },
        })
      }),
    )

    const { user } = renderDialog()

    await user.click(screen.getByRole('radio', { name: 'CSV (архив ZIP)' }))
    await user.click(
      screen.getByRole('radio', { name: 'XLSX (электронная таблица)' }),
    )
    fireEvent.change(screen.getByLabelText('Конец периода'), {
      target: { value: '2026-05-31' },
    })
    await user.click(screen.getByRole('button', { name: 'Скачать' }))

    const params = new URL(capturedUrl).searchParams
    expect(params.get('format')).toBe('xlsx')
    expect(params.get('start')).toBe('2026-03-01')
    expect(params.get('end')).toBe('2026-05-31')
  })

  it('проверяет, что начало периода не позже конца', async () => {
    const { user } = renderDialog()

    const startInput = screen.getByLabelText('Начало периода')
    fireEvent.change(startInput, { target: { value: '2026-07-01' } })

    expect(screen.getByText('Начало периода позже конца')).toBeInTheDocument()

    const submitBtn = screen.getByRole('button', { name: 'Скачать' })
    expect(submitBtn).toBeDisabled()

    await user.click(submitBtn)
    expect(mapImage.saveBlob).not.toHaveBeenCalled()
  })

  it('не отправляет запрос с неверным периодом даже при отправке формы', () => {
    let requested = false
    server.use(
      http.get('/api/v1/vineyards/v-1/data', () => {
        requested = true
        return new HttpResponse(new Uint8Array([1]))
      }),
    )
    renderDialog()
    fireEvent.change(screen.getByLabelText('Начало периода'), {
      target: { value: '2026-07-01' },
    })

    // Enter в поле даты отправляет форму и при неактивной кнопке
    const form = screen.getByLabelText('Начало периода').closest('form')
    if (!form) throw new Error('form not found')
    fireEvent.submit(form)

    expect(requested).toBe(false)
  })

  it('проверяет, что период не длиннее 3 лет', () => {
    renderDialog()

    const startInput = screen.getByLabelText('Начало периода')
    fireEvent.change(startInput, { target: { value: '2020-01-01' } })

    expect(
      screen.getByText('Период длиннее трёх лет: выгрузите его частями'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Скачать' })).toBeDisabled()
  })

  it('отображает ошибку сервера при неудачной выгрузке', async () => {
    server.use(
      http.get('/api/v1/vineyards/v-1/data', () =>
        HttpResponse.json(
          { detail: 'Сервер временно недоступен' },
          { status: 400 },
        ),
      ),
    )

    const { user, onClose } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Скачать' }))

    expect(
      await screen.findByText('Сервер временно недоступен'),
    ).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('закрывает окно по кнопке Отмена', async () => {
    const { user, onClose } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Отмена' }))
    expect(onClose).toHaveBeenCalled()
  })
})
