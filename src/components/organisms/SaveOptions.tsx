import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useVineyards } from '@/api/vineyards'
import { Select } from '@/components/atoms/Select'

type SaveOptionsProps = {
  save: boolean
  onSaveChange: (save: boolean) => void
  // '' — без участка
  vineyardId: string
  onVineyardChange: (id: string) => void
}

// Сохранять ли проверку в историю и к какому участку её отнести (pr-047).
// Участок подставляется по GPS из фото, но его можно сменить
export function SaveOptions({
  save,
  onSaveChange,
  vineyardId,
  onVineyardChange,
}: SaveOptionsProps) {
  const { t } = useTranslation()
  const saveId = useId()
  const plotId = useId()
  const { data: vineyards = [] } = useVineyards()

  return (
    <div className="flex flex-col gap-2 rounded-md border border-line bg-muted/40 p-3 text-sm">
      <label
        htmlFor={saveId}
        className="flex cursor-pointer items-center gap-2 text-ink"
      >
        <input
          id={saveId}
          type="checkbox"
          checked={save}
          onChange={(event) => onSaveChange(event.target.checked)}
          className="size-4 accent-brand-700"
        />
        {t('history.save')}
      </label>
      {save && vineyards.length > 0 && (
        <div className="flex flex-col gap-1">
          <label htmlFor={plotId} className="text-ink-soft">
            {t('history.plot')}
          </label>
          <Select
            id={plotId}
            value={vineyardId}
            onChange={(event) => onVineyardChange(event.target.value)}
          >
            <option value="">{t('history.noPlot')}</option>
            {vineyards.map((vineyard) => (
              <option key={vineyard.id} value={vineyard.id}>
                {vineyard.name}
              </option>
            ))}
          </Select>
        </div>
      )}
    </div>
  )
}
