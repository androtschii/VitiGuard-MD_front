import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as mapImage from '@/lib/mapImage'
import { server } from '@/test/server'
import {
  defaultExportDates,
  downloadPdfReport,
  downloadVineyardData,
  parseFilenameFromDisposition,
  validateExportPeriod,
} from './reports'

describe('reports API', () => {
  beforeEach(() => {
    vi.spyOn(mapImage, 'saveBlob').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('parseFilenameFromDisposition', () => {
    it('возвращает fallback при отсутствии заголовка', () => {
      expect(parseFilenameFromDisposition(null, 'default.pdf')).toBe(
        'default.pdf',
      )
      expect(parseFilenameFromDisposition(undefined, 'default.pdf')).toBe(
        'default.pdf',
      )
    })

    it('извлекает имя в кавычках', () => {
      expect(
        parseFilenameFromDisposition(
          'attachment; filename="report-2026.pdf"',
          'fallback.pdf',
        ),
      ).toBe('report-2026.pdf')
    })

    it('извлекает имя без кавычек', () => {
      expect(
        parseFilenameFromDisposition(
          'attachment; filename=report-2026.pdf; size=123',
          'fallback.pdf',
        ),
      ).toBe('report-2026.pdf')
    })

    it('извлекает UTF-8 закодированное имя', () => {
      expect(
        parseFilenameFromDisposition(
          "attachment; filename*=UTF-8''%D0%BE%D1%82%D1%87%D1%91%D1%82.pdf",
          'fallback.pdf',
        ),
      ).toBe('отчёт.pdf')
    })

    it('обрабатывает некорректную последовательность UTF-8', () => {
      expect(
        parseFilenameFromDisposition(
          "attachment; filename*=UTF-8''%E0%A4%A",
          'fallback.pdf',
        ),
      ).toBe('%E0%A4%A')
    })
  })

  describe('defaultExportDates', () => {
    it('в сезон (после 1 марта) берёт текущий год', () => {
      const dates = defaultExportDates(new Date(2026, 9, 26))
      expect(dates).toEqual({
        start: '2026-03-01',
        end: '2026-10-26',
      })
    })

    it('до 1 марта берёт прошлый год для начала сезона', () => {
      const dates = defaultExportDates(new Date(2027, 0, 15))
      expect(dates).toEqual({
        start: '2026-03-01',
        end: '2027-01-15',
      })
    })
  })

  describe('validateExportPeriod', () => {
    it('корректный период возвращает null', () => {
      expect(validateExportPeriod('2026-03-01', '2026-10-26')).toBeNull()
    })

    it('пустые даты не вызывают ошибку валидации', () => {
      expect(validateExportPeriod('', '')).toBeNull()
      expect(validateExportPeriod('2026-03-01', '')).toBeNull()
    })

    it('невалидные даты не приводят к сбою', () => {
      expect(validateExportPeriod('not-a-date', '2026-03-01')).toBeNull()
    })

    it('начало позже конца даёт periodInvalid', () => {
      expect(validateExportPeriod('2026-10-26', '2026-03-01')).toBe(
        'periodInvalid',
      )
    })

    it('период длиннее 3 лет даёт periodTooLong', () => {
      expect(validateExportPeriod('2022-01-01', '2026-01-01')).toBe(
        'periodTooLong',
      )
    })
  })

  describe('downloadPdfReport', () => {
    it('запрашивает PDF-отчёт и сохраняет blob', async () => {
      server.use(
        http.get('/api/v1/vineyards/v-1/report.pdf', () => {
          return new HttpResponse(new Uint8Array([1, 2, 3]), {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition':
                'attachment; filename="vitiguard-report-2026-06-10.pdf"',
            },
          })
        }),
      )

      const filename = await downloadPdfReport('v-1')
      expect(filename).toBe('vitiguard-report-2026-06-10.pdf')
      expect(mapImage.saveBlob).toHaveBeenCalledWith(
        expect.any(Blob),
        'vitiguard-report-2026-06-10.pdf',
      )
    })
  })

  describe('downloadVineyardData', () => {
    it('запрашивает XLSX по умолчанию с параметрами', async () => {
      let requestedUrl = ''
      server.use(
        http.get('/api/v1/vineyards/v-1/data', ({ request }) => {
          requestedUrl = request.url
          return new HttpResponse(new Uint8Array([4, 5, 6]), {
            headers: {
              'Content-Type':
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'Content-Disposition':
                'attachment; filename="vitiguard-data-2026-03-01-2026-10-26.xlsx"',
            },
          })
        }),
      )

      const filename = await downloadVineyardData('v-1', {
        format: 'xlsx',
        start: '2026-03-01',
        end: '2026-10-26',
      })
      expect(filename).toBe('vitiguard-data-2026-03-01-2026-10-26.xlsx')
      expect(requestedUrl).toContain('format=xlsx')
      expect(requestedUrl).toContain('start=2026-03-01')
      expect(requestedUrl).toContain('end=2026-10-26')
      expect(mapImage.saveBlob).toHaveBeenCalled()
    })

    it('запрашивает CSV архив', async () => {
      server.use(
        http.get('/api/v1/vineyards/v-1/data', () => {
          return new HttpResponse(new Uint8Array([7, 8]), {
            headers: {
              'Content-Type': 'application/zip',
            },
          })
        }),
      )

      const filename = await downloadVineyardData('v-1', { format: 'csv' })
      expect(filename).toBe('vitiguard-data-v-1.zip')
      expect(mapImage.saveBlob).toHaveBeenCalled()
    })
  })
})
