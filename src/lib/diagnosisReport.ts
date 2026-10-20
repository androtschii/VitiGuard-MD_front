import type { TFunction } from 'i18next'
import type { DiagnosisRecord } from '@/api/diagnoses'
import { toJpegBytes } from '@/lib/mapImage'
import { imagePdf, PORTRAIT } from '@/lib/pdf'

// Страница A4 при 150 точках на дюйм: текст в PDF не пишется (pdf.ts), поэтому
// карточка рисуется картинкой с достаточной для печати чёткостью
export const SHEET = { width: 1240, height: 1754, margin: 90 }
const PHOTO_HEIGHT = 760
const LESION_ALPHA = 0.55
const INK = '#1f2937'
const MUTED = '#4b5563'

type Line = { text: string; size: number; color: string; weight?: number }

export type ReportPhoto = {
  image: CanvasImageSource
  width: number
  height: number
}

type Measure = Pick<CanvasRenderingContext2D, 'measureText'>

// Перенос по словам в пределах ширины; слово длиннее строки остаётся целым
export function wrapText(context: Measure, text: string, maxWidth: number) {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word
    if (line && context.measureText(next).width > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

export function reportLines(
  record: DiagnosisRecord,
  t: TFunction,
  language: string | undefined,
): Line[] {
  const percent = new Intl.NumberFormat(language, {
    style: 'percent',
    maximumFractionDigits: 0,
  })
  const date = new Intl.DateTimeFormat(language, {
    dateStyle: 'long',
    timeStyle: 'short',
  })
  const body = (text: string): Line => ({ text, size: 30, color: INK })
  const note = (text: string): Line => ({ text, size: 24, color: MUTED })
  const review = record.review
  const reviewer = review?.reviewer ?? t('review.expert')

  return [
    {
      text: t(`diseases.${record.disease}`),
      size: 52,
      color: record.disease === 'healthy' ? '#047857' : '#b91c1c',
      weight: 700,
    },
    body(
      t('diagnosis.confidence', { value: percent.format(record.confidence) }),
    ),
    ...(record.severity === null
      ? []
      : [
          body(
            t('report.severity', { value: percent.format(record.severity) }),
          ),
        ]),
    ...(review
      ? [
          body(
            review.disease === record.disease
              ? t('review.confirmed', { reviewer })
              : t('review.corrected', {
                  reviewer,
                  disease: t(`diseases.${review.disease}`),
                }),
          ),
          ...(review.comment ? [note(`«${review.comment}»`)] : []),
        ]
      : []),
    body(
      record.vineyard_name
        ? t('report.vineyard', { name: record.vineyard_name })
        : t('history.noPlot'),
    ),
    body(t('report.date', { date: date.format(new Date(record.created_at)) })),
    ...(record.location
      ? [
          body(
            t('report.location', {
              lat: record.location.lat.toFixed(5),
              lon: record.location.lon.toFixed(5),
            }),
          ),
        ]
      : []),
    { text: t('report.probabilities'), size: 30, color: INK, weight: 600 },
    ...record.top.map((item) =>
      body(
        `${t(`diseases.${item.disease}`)} — ${percent.format(item.probability)}`,
      ),
    ),
    note(
      t('report.model', {
        model: record.model,
        version: record.model_version,
      }),
    ),
    note(t('report.disclaimer')),
  ]
}

// Страница карточки: заголовок, фото с маской поражения и строки отчёта
export function drawReport(
  title: string,
  photo: ReportPhoto,
  lesion: CanvasImageSource | null,
  lines: Line[],
) {
  const canvas = document.createElement('canvas')
  canvas.width = SHEET.width
  canvas.height = SHEET.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D недоступен')
  const inner = SHEET.width - SHEET.margin * 2

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, SHEET.width, SHEET.height)
  context.textBaseline = 'top'
  context.fillStyle = '#622ac3'
  context.font = '600 34px sans-serif'
  context.fillText(title, SHEET.margin, SHEET.margin)

  const top = SHEET.margin + 70
  const scale = Math.min(inner / photo.width, PHOTO_HEIGHT / photo.height)
  const width = photo.width * scale
  const height = photo.height * scale
  const left = SHEET.margin + (inner - width) / 2
  context.drawImage(photo.image, left, top, width, height)
  if (lesion) {
    context.globalAlpha = LESION_ALPHA
    context.drawImage(lesion, left, top, width, height)
    context.globalAlpha = 1
  }

  let y = top + height + 50
  for (const line of lines) {
    context.font = `${line.weight ?? 400} ${line.size}px sans-serif`
    context.fillStyle = line.color
    for (const part of wrapText(context, line.text, inner)) {
      if (y + line.size > SHEET.height - SHEET.margin) return canvas
      context.fillText(part, SHEET.margin, y)
      y += line.size * 1.35
    }
    y += line.size * 0.25
  }
  return canvas
}

export function reportFileName(record: DiagnosisRecord) {
  return `vitiguard-diagnosis-${record.created_at.slice(0, 10)}-${record.id.slice(0, 8)}.pdf`
}

export async function diagnosisPdf(
  record: DiagnosisRecord,
  photo: Blob,
  lesion: Blob | null,
  t: TFunction,
  language: string | undefined,
) {
  const image = await createImageBitmap(photo)
  const mask = lesion ? await createImageBitmap(lesion) : null
  const sheet = drawReport(
    t('report.title'),
    { image, width: image.width, height: image.height },
    mask,
    reportLines(record, t, language),
  )
  const pdf = imagePdf(
    await toJpegBytes(sheet),
    sheet.width,
    sheet.height,
    PORTRAIT,
  )
  return new Blob([pdf], { type: 'application/pdf' })
}
