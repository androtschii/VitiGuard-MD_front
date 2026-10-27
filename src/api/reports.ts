import { api } from './client'
import { saveBlob } from '@/lib/mapImage'
import { localToday } from '@/lib/riskSeries'

export type DataExportFormat = 'xlsx' | 'csv'

export type DataExportOptions = {
  format?: DataExportFormat
  start?: string
  end?: string
}

// Извлечение имени файла из заголовка Content-Disposition:
// поддерживает RFC 5987 (filename*=UTF-8''...) и обычный параметр filename="..."
export function parseFilenameFromDisposition(
  disposition: unknown,
  fallback: string,
): string {
  if (typeof disposition !== 'string' || !disposition) return fallback
  const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(disposition)
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].trim())
    } catch {
      return utfMatch[1].trim()
    }
  }
  const match = /filename="?([^";]+)"?/i.exec(disposition)
  if (match?.[1]) {
    return match[1].trim()
  }
  return fallback
}

// Даты по умолчанию — как на сервере: сезон с 1 марта по сегодня. «Сегодня»
// по Кишинёву, а не по часам устройства (как и в остальном клиенте)
export function defaultExportDates(now = new Date()): {
  start: string
  end: string
} {
  const end = localToday(now)
  const [year, month] = end.split('-').map(Number)
  const seasonYear = month >= 3 ? year : year - 1
  return { start: `${seasonYear}-03-01`, end }
}

// Тот же предел, что на сервере (MAX_DAYS = 3 * 366): иначе клиент отказал бы
// в периоде, который сервер принимает
const MAX_EXPORT_DAYS = 3 * 366

export type ExportValidationError = 'periodInvalid' | 'periodTooLong'

export function validateExportPeriod(
  start: string,
  end: string,
): ExportValidationError | null {
  if (!start || !end) return null
  const startTime = Date.parse(start)
  const endTime = Date.parse(end)
  if (Number.isNaN(startTime) || Number.isNaN(endTime)) return null
  if (startTime > endTime) {
    return 'periodInvalid'
  }
  const days = Math.round((endTime - startTime) / (1000 * 60 * 60 * 24))
  if (days > MAX_EXPORT_DAYS) {
    return 'periodTooLong'
  }
  return null
}

// Скачивание PDF-отчёта участка (backend/pr-086) через axios с Bearer-токеном
export async function downloadPdfReport(vineyardId: string): Promise<string> {
  const response = await api.get<Blob>(`/vineyards/${vineyardId}/report.pdf`, {
    responseType: 'blob',
  })
  const disposition =
    typeof response.headers?.get === 'function'
      ? response.headers.get('content-disposition')
      : (response.headers?.['content-disposition'] as string | undefined)
  const filename = parseFilenameFromDisposition(
    disposition,
    `vitiguard-report-${vineyardId}.pdf`,
  )
  saveBlob(response.data, filename)
  return filename
}

// Выгрузка истории участка таблицами (XLSX или архив CSV) через axios с Bearer-токеном
export async function downloadVineyardData(
  vineyardId: string,
  options: DataExportOptions = {},
): Promise<string> {
  const { format = 'xlsx', start, end } = options
  const response = await api.get<Blob>(`/vineyards/${vineyardId}/data`, {
    params: {
      format,
      ...(start ? { start } : {}),
      ...(end ? { end } : {}),
    },
    responseType: 'blob',
  })
  const disposition =
    typeof response.headers?.get === 'function'
      ? response.headers.get('content-disposition')
      : (response.headers?.['content-disposition'] as string | undefined)
  const defaultExt = format === 'csv' ? 'zip' : 'xlsx'
  const filename = parseFilenameFromDisposition(
    disposition,
    `vitiguard-data-${vineyardId}.${defaultExt}`,
  )
  saveBlob(response.data, filename)
  return filename
}
