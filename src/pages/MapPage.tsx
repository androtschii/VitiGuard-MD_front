import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toMultiPolygon, useCreateVineyard } from '@/api/vineyards'
import { useNavItems } from '@/app/navigation'
import { DrawPolygonControl } from '@/components/organisms/DrawPolygonControl'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { MapView } from '@/components/organisms/MapView'
import { VineyardForm } from '@/components/organisms/VineyardForm'
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
        <DrawPolygonControl
          className="absolute top-14 left-2.5"
          onChange={(polygon) => polygon && setSavedName(null)}
          renderDrawn={({ polygon, areaHa, reset }) => (
            <VineyardForm
              areaHa={areaHa}
              submitLabel={t('vineyard.create')}
              onCancel={reset}
              onSubmit={async ({ name }) => {
                const vineyard = await createVineyard({
                  name,
                  geometry: toMultiPolygon(polygon),
                })
                reset()
                setSavedName(vineyard.name)
              }}
            />
          )}
        />
      </MapView>
    </DashboardTemplate>
  )
}
