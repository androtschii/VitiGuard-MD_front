import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  defaultExportDates,
  downloadVineyardData,
  validateExportPeriod,
  type DataExportFormat,
} from '@/api/reports'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Field } from '@/components/molecules/Field'
import { Modal } from '@/components/organisms/Modal'

type ExportDataDialogProps = {
  vineyardId: string
  vineyardName: string
  open: boolean
  onClose: () => void
}

// Окно экспорта истории участка (backend/pr-086): выбор формата XLSX / CSV
// и периода выгрузки с валидацией интервала (не более 3 лет)
export function ExportDataDialog({
  vineyardId,
  vineyardName,
  open,
  onClose,
}: ExportDataDialogProps) {
  const { t } = useTranslation()
  const [{ start: initialStart, end: initialEnd }] =
    useState(defaultExportDates)
  const [format, setFormat] = useState<DataExportFormat>('xlsx')
  const [start, setStart] = useState(initialStart)
  const [end, setEnd] = useState(initialEnd)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const validationCode = validateExportPeriod(start, end)
  const validationError = validationCode ? t(`reports.${validationCode}`) : null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (validationCode) return

    setIsLoading(true)
    setServerError(null)
    try {
      await downloadVineyardData(vineyardId, { format, start, end })
      onClose()
    } catch (err: unknown) {
      setServerError(
        err instanceof Error && err.message
          ? err.message
          : t('reports.exportFailed'),
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('reports.exportDialogTitle', { name: vineyardName })}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {t('reports.cancel')}
          </Button>
          <Button
            type="submit"
            form="export-data-form"
            variant="primary"
            isLoading={isLoading}
            disabled={Boolean(validationError) || isLoading}
          >
            {t('reports.download')}
          </Button>
        </div>
      }
    >
      <form
        id="export-data-form"
        onSubmit={(event) => void handleSubmit(event)}
        noValidate
        className="flex flex-col gap-4"
      >
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-ink">
            {t('reports.format')}
          </legend>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="export-format"
                value="xlsx"
                checked={format === 'xlsx'}
                onChange={() => setFormat('xlsx')}
                className="accent-primary"
              />
              {t('reports.formatXlsx')}
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="export-format"
                value="csv"
                checked={format === 'csv'}
                onChange={() => setFormat('csv')}
                className="accent-primary"
              />
              {t('reports.formatCsv')}
            </label>
          </div>
        </fieldset>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label={t('reports.periodStart')}
            error={validationError ?? undefined}
          >
            {(control) => (
              <Input
                type="date"
                value={start}
                onChange={(e) => {
                  setStart(e.target.value)
                  setServerError(null)
                }}
                required
                {...control}
              />
            )}
          </Field>
          <Field label={t('reports.periodEnd')}>
            {(control) => (
              <Input
                type="date"
                value={end}
                onChange={(e) => {
                  setEnd(e.target.value)
                  setServerError(null)
                }}
                required
                {...control}
              />
            )}
          </Field>
        </div>

        {serverError && (
          <p role="alert" className="text-sm text-danger">
            {serverError}
          </p>
        )}
      </form>
    </Modal>
  )
}
