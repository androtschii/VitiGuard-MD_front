import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ApiError } from '@/api/client'
import { useVarieties } from '@/api/varieties'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Select } from '@/components/atoms/Select'
import { Field } from '@/components/molecules/Field'
import { vineyardSchema, type VineyardValues } from '@/schemas/vineyard'

type VineyardFormProps = {
  areaHa: number
  defaultValues?: Partial<VineyardValues>
  submitLabel: string
  onSubmit: (values: VineyardValues) => Promise<void>
  onCancel: () => void
}

// Одна форма для нового участка и для правки существующего: различаются
// только начальные значения и подпись кнопки
export function VineyardForm({
  areaHa,
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
}: VineyardFormProps) {
  const { t, i18n } = useTranslation()
  const { data: varieties = [] } = useVarieties()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VineyardValues>({
    resolver: zodResolver(vineyardSchema),
    defaultValues: {
      name: '',
      varietyId: '',
      plantingYear: '',
      ...defaultValues,
    },
  })

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      setError('root', {
        message:
          error instanceof ApiError ? error.message : t('vineyard.saveFailed'),
      })
    }
  })

  const area = new Intl.NumberFormat(i18n.resolvedLanguage, {
    maximumFractionDigits: 2,
  }).format(areaHa)

  return (
    <form
      onSubmit={(event) => void submit(event)}
      noValidate
      aria-label={t('vineyard.formLabel')}
      className="flex flex-col gap-3"
    >
      {/* Площадь пересчитывается при правке контура — озвучиваем изменения */}
      <p aria-live="polite" className="font-medium text-ink">
        {t('draw.area', { area })}
      </p>
      <p className="text-ink-muted">{t('draw.editHint')}</p>
      <Field label={t('vineyard.name')} error={errors.name?.message} required>
        {(control) => (
          <Input
            {...control}
            {...register('name')}
            autoComplete="off"
            placeholder={t('vineyard.namePlaceholder')}
          />
        )}
      </Field>
      <Field label={t('vineyard.variety')} error={errors.varietyId?.message}>
        {(control) => (
          <Select {...control} {...register('varietyId')}>
            <option value="">{t('vineyard.varietyNone')}</option>
            {varieties.map((variety) => (
              <option key={variety.id} value={variety.id}>
                {variety.name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field
        label={t('vineyard.plantingYear')}
        error={errors.plantingYear?.message}
      >
        {(control) => (
          <Input
            {...control}
            {...register('plantingYear')}
            inputMode="numeric"
            placeholder={t('vineyard.plantingYearPlaceholder')}
          />
        )}
      </Field>
      {errors.root && (
        <p role="alert" className="text-danger">
          {errors.root.message}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={onCancel}>
          {t('draw.remove')}
        </Button>
      </div>
    </form>
  )
}
