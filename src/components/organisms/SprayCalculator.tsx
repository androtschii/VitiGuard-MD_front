import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/atoms/Input'
import { Field } from '@/components/molecules/Field'
import { calculateSpray } from '@/lib/sprayCalculator'

const FIELDS = ['rate', 'water', 'tank'] as const

// Расчёт раствора по норме, которую человек берёт с этикетки: норм препаратов
// в приложении нет намеренно, они зависят от препарата и страны
export function SprayCalculator({ areaHa }: { areaHa: number }) {
  const { t, i18n } = useTranslation()
  const number = new Intl.NumberFormat(i18n.resolvedLanguage, {
    maximumFractionDigits: 2,
  })
  const [area, setArea] = useState(String(areaHa))
  const [values, setValues] = useState({ rate: '', water: '', tank: '' })

  const result = calculateSpray({
    areaHa: Number(area),
    ratePerHa: Number(values.rate),
    waterPerHa: Number(values.water),
    tankLiters: Number(values.tank),
  })

  return (
    <section
      aria-labelledby="spray-calculator-heading"
      className="flex flex-col gap-3 border-t border-line pt-4"
    >
      <h3 id="spray-calculator-heading" className="font-semibold text-ink">
        {t('sprayCalculator.title')}
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label={t('sprayCalculator.area')}>
          {(control) => (
            <Input
              type="number"
              min={0}
              step="0.01"
              value={area}
              onChange={(event) => setArea(event.target.value)}
              {...control}
            />
          )}
        </Field>
        {FIELDS.map((field) => (
          <Field key={field} label={t(`sprayCalculator.${field}`)}>
            {(control) => (
              <Input
                type="number"
                min={0}
                step="0.01"
                value={values[field]}
                onChange={(event) =>
                  setValues({ ...values, [field]: event.target.value })
                }
                {...control}
              />
            )}
          </Field>
        ))}
      </div>
      {/* Результат появляется, только когда заполнено всё */}
      <p aria-live="polite" className="font-medium text-accent">
        {result &&
          t('sprayCalculator.result', {
            product: number.format(result.product),
            water: number.format(result.water),
            tanks: result.tanks,
            perTank: number.format(result.productPerTank),
          })}
      </p>
      <p className="text-xs text-ink-subtle">{t('sprayCalculator.note')}</p>
    </section>
  )
}
