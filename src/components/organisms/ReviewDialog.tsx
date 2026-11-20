import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DISEASES, type Disease } from '@/api/diagnosis'
import {
  useDeleteReview,
  useReviewDiagnosis,
  type DiagnosisRecord,
} from '@/api/diagnoses'
import { Button } from '@/components/atoms/Button'
import { Select } from '@/components/atoms/Select'
import { Textarea } from '@/components/atoms/Textarea'
import { Modal } from '@/components/organisms/Modal'

type ReviewDialogProps = {
  record: DiagnosisRecord
  open: boolean
  onClose: () => void
}

// Заключение агронома по проверке (pr-044): модель права или правильный
// диагноз другой. Заключение не меняет ответ модели — оно лежит рядом
export function ReviewDialog({ record, open, onClose }: ReviewDialogProps) {
  const { t } = useTranslation()
  const ids = {
    model: useId(),
    other: useId(),
    disease: useId(),
    comment: useId(),
  }
  const [verdict, setVerdict] = useState<'model' | 'other' | null>(() => {
    if (!record.review) return null
    return record.review.disease === record.disease ? 'model' : 'other'
  })
  const [disease, setDisease] = useState<Disease>(
    record.review?.disease && record.review.disease !== record.disease
      ? record.review.disease
      : otherThan(record.disease),
  )
  const [comment, setComment] = useState(record.review?.comment ?? '')
  const review = useReviewDiagnosis()
  const withdraw = useDeleteReview()

  const save = () => {
    if (!verdict) return
    review.mutate(
      {
        id: record.id,
        disease: verdict === 'model' ? record.disease : disease,
        comment: comment.trim() || null,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('review.title')}
      description={t('review.description', {
        disease: t(`diseases.${record.disease}`),
      })}
      footer={
        <>
          {record.review && (
            <Button
              variant="secondary"
              isLoading={withdraw.isPending}
              onClick={() => withdraw.mutate(record.id, { onSuccess: onClose })}
            >
              {t('review.withdraw')}
            </Button>
          )}
          <Button
            isLoading={review.isPending}
            disabled={verdict === null || review.isPending}
            onClick={save}
          >
            {t('review.save')}
          </Button>
        </>
      }
    >
      <form
        onSubmit={(event) => {
          event.preventDefault()
          save()
        }}
        className="flex flex-col gap-3 text-sm"
      >
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 font-medium text-ink">
            {t('review.question')}
          </legend>
          <label htmlFor={ids.model} className="flex items-center gap-2">
            <input
              id={ids.model}
              type="radio"
              name="verdict"
              checked={verdict === 'model'}
              onChange={() => setVerdict('model')}
              className="size-4 accent-brand-700"
            />
            {t('review.modelRight')}
          </label>
          <label htmlFor={ids.other} className="flex items-center gap-2">
            <input
              id={ids.other}
              type="radio"
              name="verdict"
              checked={verdict === 'other'}
              onChange={() => setVerdict('other')}
              className="size-4 accent-brand-700"
            />
            {t('review.modelWrong')}
          </label>
        </fieldset>
        {verdict === 'other' && (
          <div className="flex flex-col gap-1">
            <label htmlFor={ids.disease} className="text-ink-soft">
              {t('review.correct')}
            </label>
            <Select
              id={ids.disease}
              value={disease}
              onChange={(event) => setDisease(event.target.value as Disease)}
            >
              {DISEASES.filter((item) => item !== record.disease).map(
                (item) => (
                  <option key={item} value={item}>
                    {t(`diseases.${item}`)}
                  </option>
                ),
              )}
            </Select>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label htmlFor={ids.comment} className="text-ink-soft">
            {t('review.comment')}
          </label>
          <Textarea
            id={ids.comment}
            rows={3}
            maxLength={1000}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </div>
        {(review.isError || withdraw.isError) && (
          <p role="alert" className="text-danger">
            {t('review.failed')}
          </p>
        )}
      </form>
    </Modal>
  )
}

// Исправление по умолчанию — первый класс, отличный от ответа модели
function otherThan(disease: Disease): Disease {
  return DISEASES.find((item) => item !== disease) ?? disease
}
