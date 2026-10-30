import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  harvestAllowedFrom,
  useCreateTreatment,
  useDeleteTreatment,
  useTreatmentPlan,
  useTreatments,
  type Fungicide,
} from '@/api/treatments'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Select } from '@/components/atoms/Select'
import { Field } from '@/components/molecules/Field'
import { Modal } from '@/components/organisms/Modal'
import { dayTime, localToday } from '@/lib/riskSeries'

type TreatmentsDialogProps = {
  vineyardId: string
  vineyardName: string
  open: boolean
  onClose: () => void
}

export function TreatmentsDialog({
  vineyardId,
  vineyardName,
  open,
  onClose,
}: TreatmentsDialogProps) {
  const { t, i18n } = useTranslation()
  const today = localToday()
  const day = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  })
  const format = (d: string) => day.format(dayTime(d))

  const treatments = useTreatments(vineyardId, open)
  const plan = useTreatmentPlan(vineyardId, open)
  const createMutation = useCreateTreatment(vineyardId)
  const deleteMutation = useDeleteTreatment(vineyardId)

  const [isAdding, setIsAdding] = useState(false)
  const [appliedOn, setAppliedOn] = useState(today)
  const [fungicide, setFungicide] = useState<Fungicide>('contact')
  const [product, setProduct] = useState('')
  const [waitingDays, setWaitingDays] = useState('')
  const [dateError, setDateError] = useState<string | null>(null)
  // Удаление в два касания, как у участка: на телефоне кнопку легко задеть
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const handleCreate = (e: FormEvent) => {
    e.preventDefault()
    if (appliedOn > today) {
      setDateError(t('treatments.futureDateError'))
      return
    }
    setDateError(null)
    createMutation.mutate(
      {
        applied_on: appliedOn,
        fungicide,
        product: product.trim() || null,
        waiting_days: waitingDays === '' ? null : Number(waitingDays),
      },
      {
        onSuccess: () => {
          setIsAdding(false)
          setProduct('')
          setWaitingDays('')
          setAppliedOn(today)
          setDateError(null)
        },
      },
    )
  }

  const items = treatments.data ?? []
  const planData = plan.data
  const harvestFrom = harvestAllowedFrom(items, today)
  const recommendations = planData?.recommendations ?? []

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={t('treatments.title', { name: vineyardName })}
      description={t('treatments.description')}
    >
      <div aria-live="polite" className="flex flex-col gap-6 text-sm">
        {/* План на неделю */}
        <section
          aria-labelledby="treatments-plan-heading"
          className="flex flex-col gap-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id="treatments-plan-heading" className="font-semibold text-ink">
              {t('treatments.planTitle')}
            </h3>
          </div>

          {plan.isPending ? (
            <p className="text-ink-muted">{t('common.loading')}</p>
          ) : plan.isError ? (
            <p role="alert" className="text-danger">
              {plan.error.message}
            </p>
          ) : (
            <>
              {/* Статус защиты участка */}
              <div className="flex flex-col gap-1.5 rounded-lg border border-line bg-surface p-3">
                <h4 className="text-xs font-medium text-ink-subtle uppercase">
                  {t('treatments.protectionStatus')}
                </h4>
                <div className="flex flex-wrap items-center gap-6 text-xs text-ink-soft">
                  <div>
                    <span className="text-ink-muted">{t('risk.downy')}: </span>
                    <span className="font-medium text-ink">
                      {planData?.protected_until.downy_mildew
                        ? t('treatments.protectedUntil', {
                            date: format(planData.protected_until.downy_mildew),
                          })
                        : t('treatments.notProtected')}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-muted">
                      {t('risk.powdery')}:{' '}
                    </span>
                    <span className="font-medium text-ink">
                      {planData?.protected_until.powdery_mildew
                        ? t('treatments.protectedUntil', {
                            date: format(
                              planData.protected_until.powdery_mildew,
                            ),
                          })
                        : t('treatments.notProtected')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Таблица рекомендаций */}
              {recommendations.length === 0 ? (
                <p className="text-xs text-ink-muted">
                  {t('treatments.noRecommendations')}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <caption className="sr-only">
                      {t('treatments.planTitle')}
                    </caption>
                    <thead className="text-ink-muted">
                      <tr>
                        <th scope="col" className="py-1 pr-2">
                          {t('treatments.columns.action')}
                        </th>
                        <th scope="col" className="py-1 pr-2">
                          {t('treatments.columns.disease')}
                        </th>
                        <th scope="col" className="py-1 pr-2">
                          {t('treatments.columns.fungicide')}
                        </th>
                        <th scope="col" className="py-1 pr-2">
                          {t('treatments.columns.dueBy')}
                        </th>
                        <th scope="col" className="py-1">
                          {t('treatments.columns.reason')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {recommendations.map((rec, index) => (
                        <tr
                          key={`${rec.disease}-${rec.due_by}-${index}`}
                          className="align-top"
                        >
                          <td className="py-1.5 pr-2 font-medium whitespace-nowrap text-ink">
                            {t(`treatments.actions.${rec.action}`)}
                          </td>
                          <td className="py-1.5 pr-2 whitespace-nowrap">
                            {t(
                              rec.disease === 'downy_mildew'
                                ? 'risk.downy'
                                : 'risk.powdery',
                            )}
                          </td>
                          <td className="py-1.5 pr-2 whitespace-nowrap">
                            {rec.fungicide
                              ? t(`treatments.fungicideShort.${rec.fungicide}`)
                              : '—'}
                          </td>
                          <td className="py-1.5 pr-2 whitespace-nowrap">
                            {format(rec.due_by)}
                          </td>
                          <td className="py-1.5 text-ink-soft">
                            {t(`treatments.reasons.${rec.reason}`, {
                              defaultValue: rec.reason,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>

        {/* Журнал обработок */}
        <section
          aria-labelledby="treatments-journal-heading"
          className="flex flex-col gap-3 border-t border-line pt-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3
              id="treatments-journal-heading"
              className="font-semibold text-ink"
            >
              {t('treatments.journalTitle')}
            </h3>
            <Button
              size="sm"
              variant={isAdding ? 'ghost' : 'secondary'}
              onClick={() => {
                setIsAdding(!isAdding)
                setDateError(null)
              }}
            >
              {isAdding ? t('treatments.cancel') : t('treatments.addTreatment')}
            </Button>
          </div>

          {deleteMutation.isError && (
            <p role="alert" className="text-danger">
              {deleteMutation.error.message}
            </p>
          )}

          {/* Форма добавления */}
          {isAdding && (
            <form
              onSubmit={handleCreate}
              noValidate
              className="flex flex-col gap-3 rounded-lg border border-line bg-muted/30 p-3"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field
                  label={t('treatments.appliedOn')}
                  error={dateError ?? undefined}
                  required
                >
                  {(control) => (
                    <Input
                      type="date"
                      value={appliedOn}
                      max={today}
                      onChange={(e) => {
                        setAppliedOn(e.target.value)
                        setDateError(null)
                      }}
                      required
                      {...control}
                    />
                  )}
                </Field>

                <Field label={t('treatments.fungicideLabel')} required>
                  {(control) => (
                    <Select
                      value={fungicide}
                      onChange={(e) =>
                        setFungicide(e.target.value as Fungicide)
                      }
                      {...control}
                    >
                      <option value="contact">
                        {t('treatments.fungicides.contact')}
                      </option>
                      <option value="systemic">
                        {t('treatments.fungicides.systemic')}
                      </option>
                      <option value="sulfur">
                        {t('treatments.fungicides.sulfur')}
                      </option>
                    </Select>
                  )}
                </Field>

                <Field label={t('treatments.productLabel')}>
                  {(control) => (
                    <Input
                      type="text"
                      value={product}
                      placeholder={t('treatments.productPlaceholder')}
                      maxLength={200}
                      onChange={(e) => setProduct(e.target.value)}
                      {...control}
                    />
                  )}
                </Field>

                <Field
                  label={t('treatments.waitingLabel')}
                  hint={t('treatments.waitingHint')}
                >
                  {(control) => (
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={365}
                      value={waitingDays}
                      onChange={(e) => setWaitingDays(e.target.value)}
                      {...control}
                    />
                  )}
                </Field>
              </div>

              {createMutation.isError && (
                <p role="alert" className="text-xs text-danger">
                  {createMutation.error.message}
                </p>
              )}

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  type="submit"
                  isLoading={createMutation.isPending}
                >
                  {t('treatments.save')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => setIsAdding(false)}
                >
                  {t('treatments.cancel')}
                </Button>
              </div>
            </form>
          )}

          {harvestFrom && (
            <p className="rounded-lg border border-accent/30 bg-accent-soft px-3 py-2 font-medium text-accent">
              {t('treatments.harvestFrom', { date: format(harvestFrom) })}
            </p>
          )}

          {/* Список обработок */}
          {treatments.isPending ? (
            <p className="text-ink-muted">{t('common.loading')}</p>
          ) : treatments.isError ? (
            <p role="alert" className="text-danger">
              {treatments.error.message}
            </p>
          ) : items.length === 0 ? (
            <p className="text-xs text-ink-muted">
              {t('treatments.emptyJournal')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">
                  {t('treatments.journalTitle')}
                </caption>
                <thead className="text-ink-muted">
                  <tr>
                    <th scope="col" className="py-1 pr-2">
                      {t('treatments.columns.date')}
                    </th>
                    <th scope="col" className="py-1 pr-2">
                      {t('treatments.columns.fungicide')}
                    </th>
                    <th scope="col" className="py-1 pr-2">
                      {t('treatments.columns.product')}
                    </th>
                    <th scope="col" className="py-1 pr-2">
                      {t('treatments.columns.waiting')}
                    </th>
                    <th scope="col" className="py-1 text-right">
                      {t('treatments.columns.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {items.map((item) => (
                    <tr key={item.id} className="align-middle">
                      <td className="py-1.5 pr-2 whitespace-nowrap">
                        {format(item.applied_on)}
                      </td>
                      <td className="py-1.5 pr-2 whitespace-nowrap">
                        {t(`treatments.fungicides.${item.fungicide}`)}
                      </td>
                      <td className="py-1.5 pr-2 text-ink-soft">
                        {item.product || '—'}
                      </td>
                      <td className="py-1.5 pr-2 whitespace-nowrap text-ink-soft">
                        {item.waiting_days === null
                          ? '—'
                          : t('treatments.waitingValue', {
                              count: item.waiting_days,
                            })}
                      </td>
                      <td className="py-1.5 text-right whitespace-nowrap">
                        {confirmingId === item.id ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-xs text-ink">
                              {t('treatments.confirmDelete')}
                            </span>
                            <Button
                              size="sm"
                              variant="danger"
                              className="min-h-7 text-xs"
                              aria-label={t(
                                'treatments.confirmDeleteTreatment',
                                {
                                  date: format(item.applied_on),
                                },
                              )}
                              isLoading={
                                deleteMutation.isPending &&
                                deleteMutation.variables === item.id
                              }
                              onClick={() =>
                                deleteMutation.mutate(item.id, {
                                  onSettled: () => setConfirmingId(null),
                                })
                              }
                            >
                              {t('treatments.delete')}
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="min-h-7 text-xs"
                              onClick={() => setConfirmingId(null)}
                            >
                              {t('treatments.cancel')}
                            </Button>
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="min-h-7 text-xs text-danger [--fill-ink:var(--color-white)] [--fill:var(--color-red-700)]"
                            aria-label={t('treatments.deleteTreatment', {
                              date: format(item.applied_on),
                            })}
                            onClick={() => setConfirmingId(item.id)}
                          >
                            {t('treatments.delete')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-xs text-ink-subtle">{t('treatments.note')}</p>
      </div>
    </Modal>
  )
}
