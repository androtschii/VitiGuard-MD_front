import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { isFiltered } from '@/lib/vineyardFilter'
import { useMapStore } from '@/store/map'

type MapToolbarProps = {
  // Инструменты, которые нужны постоянно: поиск, рисование, измерение
  tools: ReactNode
  // Фильтры и слои: нужны реже, поэтому свёрнуты в отдельный блок
  layers: ReactNode
}

const chevron = (
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    className="size-4 transition group-open:rotate-180"
  >
    <path d="M5.2 7.2a.75.75 0 0 1 1.06 0L10 10.94l3.74-3.74a.75.75 0 1 1 1.06 1.06l-4.27 4.27a.75.75 0 0 1-1.06 0L5.2 8.26a.75.75 0 0 1 0-1.06Z" />
  </svg>
)

// Панель инструментов поверх карты. Она занимает часть карты, поэтому её можно
// скрыть целиком, а редко нужные фильтры и слои свёрнуты; если панель не
// помещается по высоте, она прокручивается, а не обрезается
export function MapToolbar({ tools, layers }: MapToolbarProps) {
  const { t } = useTranslation()
  // На телефоне раскрытая панель закрывает бóльшую часть карты: там она
  // сначала свёрнута до кнопки «Показать» (pr-077)
  const [isHidden, setIsHidden] = useState(
    () => window.matchMedia?.('(max-width: 639px)').matches ?? false,
  )
  // Включённый фильтр не прячется: иначе было бы непонятно, куда делись участки
  const [isLayersOpen, setIsLayersOpen] = useState(() =>
    isFiltered(useMapStore.getState().filter),
  )

  const buttonClass =
    'inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink shadow-sm transition hover:bg-muted'

  if (isHidden) {
    return (
      <div className="absolute top-14 left-2.5">
        <button
          type="button"
          aria-expanded="false"
          onClick={() => setIsHidden(false)}
          className={buttonClass}
        >
          {t('map.tools.show')}
        </button>
      </div>
    )
  }

  return (
    <div className="absolute top-14 bottom-10 left-2.5 flex w-64 max-w-[calc(100%-4.5rem)] flex-col gap-2 overflow-y-auto pb-1">
      <button
        type="button"
        aria-expanded="true"
        onClick={() => setIsHidden(true)}
        className={`${buttonClass} self-start`}
      >
        {t('map.tools.hide')}
      </button>
      {tools}
      <details
        open={isLayersOpen}
        onToggle={(event) => setIsLayersOpen(event.currentTarget.open)}
        className="group flex flex-col gap-2"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-ink shadow-sm hover:bg-muted [&::-webkit-details-marker]:hidden">
          {t('map.tools.layers')}
          {chevron}
        </summary>
        <div className="mt-2 flex flex-col gap-2">{layers}</div>
      </details>
    </div>
  )
}
