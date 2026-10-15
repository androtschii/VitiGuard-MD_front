import { useTranslation } from 'react-i18next'
import { SegmentedControl } from '@/components/molecules/SegmentedControl'
import { BASEMAPS, type Basemap } from '@/lib/basemaps'

type BasemapSwitcherProps = {
  value: Basemap
  onChange: (basemap: Basemap) => void
  className?: string
}

export function BasemapSwitcher({
  value,
  onChange,
  className,
}: BasemapSwitcherProps) {
  const { t } = useTranslation()

  return (
    <SegmentedControl
      label={t('map.basemap.label')}
      options={BASEMAPS.map((basemap) => ({
        value: basemap,
        label: t(`map.basemap.${basemap}`),
      }))}
      value={value}
      onChange={onChange}
      className={className}
    />
  )
}
