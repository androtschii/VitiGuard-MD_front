import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchLesionMask, type DiagnosisRecord } from '@/api/diagnoses'
import type { Diagnosis } from '@/api/diagnosis'
import { diagnosisPdf, reportFileName } from '@/lib/diagnosisReport'
import { saveBlob } from '@/lib/mapImage'
import { share, shareText } from '@/lib/share'

export type ExportAction = 'pdf' | 'share'

export function diagnosisToRecord(
  diagnosis: Diagnosis,
  vineyardName?: string | null,
): DiagnosisRecord {
  return {
    id: diagnosis.id ?? 'result',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vineyard_id: null,
    vineyard_name: vineyardName ?? null,
    model: diagnosis.model,
    model_version: '',
    disease: diagnosis.disease,
    confidence: diagnosis.confidence,
    top: diagnosis.top,
    severity: diagnosis.lesion?.severity ?? null,
    overlays: diagnosis.lesion ? ['lesion'] : [],
    location: null,
    review: null,
  }
}

// Карточка в PDF и системное меню «Поделиться» (pr-045)
export function useDiagnosisExport(record: DiagnosisRecord) {
  const { t, i18n } = useTranslation()
  const [busy, setBusy] = useState<ExportAction | null>(null)
  const [failed, setFailed] = useState<ExportAction | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  const run = async (action: ExportAction, file: Blob) => {
    setBusy(action)
    setFailed(null)
    setIsCopied(false)
    try {
      const lesion =
        record.id &&
        record.id !== 'result' &&
        record.overlays.includes('lesion')
          ? await fetchLesionMask(record.id)
          : null
      const language = i18n.resolvedLanguage
      const pdf = await diagnosisPdf(record, file, lesion, t, language)
      const name = reportFileName(record)
      if (action === 'pdf') {
        saveBlob(pdf, name)
      } else {
        const outcome = await share(
          t('report.title'),
          shareText(record, t, language),
          new File([pdf], name, { type: pdf.type }),
        )
        setIsCopied(outcome === 'copied')
      }
    } catch {
      setFailed(action)
    } finally {
      setBusy(null)
    }
  }

  return {
    busy,
    failed,
    isCopied,
    run,
  }
}
