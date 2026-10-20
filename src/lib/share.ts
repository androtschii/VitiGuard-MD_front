import type { TFunction } from 'i18next'
import type { DiagnosisRecord } from '@/api/diagnoses'

export type ShareOutcome = 'shared' | 'copied' | 'cancelled'

// Короткое описание проверки для мессенджера или письма: ссылкой поделиться
// нельзя — история проверок видна только владельцу
export function shareText(
  record: DiagnosisRecord,
  t: TFunction,
  language: string | undefined,
) {
  const percent = new Intl.NumberFormat(language, {
    style: 'percent',
    maximumFractionDigits: 0,
  })
  const date = new Intl.DateTimeFormat(language, { dateStyle: 'long' })
  return t('share.text', {
    disease: t(`diseases.${record.disease}`),
    confidence: percent.format(record.confidence),
    place: record.vineyard_name ?? t('history.noPlot'),
    date: date.format(new Date(record.created_at)),
  })
}

// Системное меню «Поделиться» (Web Share): с файлом, если браузер умеет
// отправлять файлы, иначе только текст. Без Web Share текст копируется
export async function share(
  title: string,
  text: string,
  file: File | null,
): Promise<ShareOutcome> {
  if (typeof navigator.share === 'function') {
    const withFile = file && navigator.canShare?.({ files: [file] })
    try {
      await navigator.share(
        withFile ? { title, text, files: [file] } : { title, text },
      )
      return 'shared'
    } catch (error) {
      // Пользователь закрыл меню — это не ошибка
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled'
      }
      throw error
    }
  }
  await navigator.clipboard.writeText(text)
  return 'copied'
}
