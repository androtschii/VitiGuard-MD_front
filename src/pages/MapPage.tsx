import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toMultiPolygon, useCreateVineyard } from '@/api/vineyards'
import { useNavItems } from '@/app/navigation'
import { OsmToggle } from '@/components/molecules/OsmToggle'
import { DrawPolygonControl } from '@/components/organisms/DrawPolygonControl'
import { MapRiskLegend } from '@/components/organisms/MapRiskLegend'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { MapExportControl } from '@/components/organisms/MapExportControl'
import { MapSearch } from '@/components/organisms/MapSearch'
import { MapToolbar } from '@/components/organisms/MapToolbar'
import { MeasureControl } from '@/components/organisms/MeasureControl'
import { MapView } from '@/components/organisms/MapView'
import { OsmVineyardsLayer } from '@/components/organisms/OsmVineyardsLayer'
import { VineyardFilters } from '@/components/organisms/VineyardFilters'
import { VineyardForm } from '@/components/organisms/VineyardForm'
import { VineyardPopups } from '@/components/organisms/VineyardPopups'
import { VineyardsLayer } from '@/components/organisms/VineyardsLayer'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'

export function MapPage() {
  const { t } = useTranslation()
  const navItems = useNavItems()
  const { mutateAsync: createVineyard } = useCreateVineyard()
  const [savedName, setSavedName] = useState<string | null>(null)

  return (
    <DashboardTemplate navItems={navItems} headerActions={<LogoutButton />}>
      <h1 className="mb-3 text-xl font-semibold text-ink">{t('map.title')}</h1>
      {/* Высота экрана без шапки, заголовка и подвала; на низких экранах — не меньше 24rem */}
      <p role="status" className="mb-3 min-h-5 text-sm text-accent">
        {savedName && t('vineyard.created', { name: savedName })}
      </p>
      <MapView className="h-[calc(100svh-14rem)] min-h-96">
        <VineyardsLayer />
        <OsmVineyardsLayer />
        <VineyardPopups />
        <MapRiskLegend />
        {/* Панель инструментов: поиск и рисование — столбиком под подложками */}
        <MapToolbar
          tools={
            <>
              <MapSearch />
              <DrawPolygonControl
                onChange={(polygon) => polygon && setSavedName(null)}
                renderDrawn={({ polygon, areaHa, reset }) => (
                  <VineyardForm
                    areaHa={areaHa}
                    submitLabel={t('vineyard.create')}
                    onCancel={reset}
                    onSubmit={async ({ name, varietyId, plantingYear }) => {
                      const vineyard = await createVineyard({
                        name,
                        geometry: toMultiPolygon(polygon),
                        variety_id: varietyId || null,
                        planting_year: plantingYear
                          ? Number(plantingYear)
                          : null,
                      })
                      reset()
                      setSavedName(vineyard.name)
                    }}
                  />
                )}
              />
              <MeasureControl />
              <MapExportControl />
            </>
          }
          layers={
            <>
              <VineyardFilters />
              <OsmToggle />
            </>
          }
        />
      </MapView>
    </DashboardTemplate>
  )
}
