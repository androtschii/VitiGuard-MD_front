import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDiagnose } from '@/api/diagnosis'
import { useOfflineDiagnose, useStoredModel } from '@/api/offlineModel'
import { useNavItems } from '@/app/navigation'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Spinner } from '@/components/atoms/Spinner'
import { DiagnosisOverlay } from '@/components/organisms/DiagnosisOverlay'
import { DiagnosisResult } from '@/components/organisms/DiagnosisResult'
import { OfflineModelCard } from '@/components/organisms/OfflineModelCard'
import { LeafUpload } from '@/components/organisms/LeafUpload'
import { PhotoLocation } from '@/components/organisms/PhotoLocation'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { SaveOptions } from '@/components/organisms/SaveOptions'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'
import { useObjectUrl } from '@/lib/useObjectUrl'
import { useOnlineStatus } from '@/lib/useOnlineStatus'
import { usePhotoLocation } from '@/lib/usePhotoLocation'

export function DiagnosisPage() {
  const { t } = useTranslation()
  const navItems = useNavItems()
  const [file, setFile] = useState<File | null>(null)
  const server = useDiagnose()
  const device = useOfflineDiagnose()
  const isOnline = useOnlineStatus()
  const stored = useStoredModel()
  // Без сети фото анализирует скачанная модель на устройстве (pr-074).
  // Источник запоминается при нажатии: результат не пропадает, если сеть
  // появится или исчезнет уже после анализа
  const [onDevice, setOnDevice] = useState(false)
  const diagnose = onDevice ? device : server
  const canAnalyze = isOnline || Boolean(stored.data)
  const photoUrl = useObjectUrl(file)
  const location = usePhotoLocation(file)
  const [save, setSave] = useState(true)
  // undefined — участок не выбран вручную: берётся тот, где снято фото
  const [chosenPlot, setChosenPlot] = useState<string | undefined>()
  const vineyardId = chosenPlot ?? location?.plot?.id ?? ''
  const resultRef = useRef<HTMLElement>(null)

  // На узком экране результат — под фото, за краем экрана: показываем его,
  // как только ответ пришёл (pr-049)
  useEffect(() => {
    if (!diagnose.isSuccess) return
    if (!window.matchMedia?.('(max-width: 1023px)').matches) return
    resultRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  }, [diagnose.isSuccess])

  return (
    <DashboardTemplate navItems={navItems} headerActions={<LogoutButton />}>
      <h1 className="mb-1 text-xl font-semibold text-ink">
        {t('diagnosis.title')}
      </h1>
      <p className="mb-4 max-w-2xl text-sm text-ink-muted">
        {t('diagnosis.intro')}
      </p>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Card title={t('diagnosis.photo')} className="flex flex-col gap-1">
            <LeafUpload
              file={file}
              onSelect={(picked) => {
                setFile(picked)
                setChosenPlot(undefined)
                // Результат относится к прежнему фото
                server.reset()
                device.reset()
              }}
            />
            <PhotoLocation location={location} />
            {/* Без сети фото анализируется на устройстве и не сохраняется */}
            {isOnline && (
              <SaveOptions
                save={save}
                onSaveChange={setSave}
                vineyardId={vineyardId}
                onVineyardChange={setChosenPlot}
              />
            )}
            <Button
              className="w-full"
              disabled={!file || !canAnalyze}
              isLoading={diagnose.isPending}
              onClick={() => {
                if (!file) return
                setOnDevice(!isOnline)
                if (isOnline) server.mutate({ image: file, save, vineyardId })
                else device.mutate(file)
              }}
            >
              {t('diagnosis.analyze')}
            </Button>
            {!canAnalyze && (
              <p className="text-sm text-ink-muted">
                {t('diagnosis.offlineNoModel')}
              </p>
            )}
          </Card>
          {/* Наложения — под фото, слева: справа и так длинный список вероятностей */}
          {diagnose.isSuccess &&
            photoUrl &&
            (diagnose.data.heatmap || diagnose.data.lesion) && (
              <Card>
                <DiagnosisOverlay
                  photoUrl={photoUrl}
                  diagnosis={diagnose.data}
                />
              </Card>
            )}
          <OfflineModelCard />
        </div>

        <Card ref={resultRef} title={t('diagnosis.result')}>
          <div aria-live="polite">
            {diagnose.isPending && (
              <p className="flex items-center gap-2 text-sm text-ink-muted">
                <Spinner className="text-accent" />
                {t('diagnosis.analyzing')}
              </p>
            )}
            {diagnose.isError && (
              <p role="alert" className="text-sm text-danger">
                {onDevice
                  ? t('diagnosis.deviceFailed')
                  : diagnose.error.message}
              </p>
            )}
            {diagnose.isSuccess && (
              <>
                {onDevice && (
                  <p className="mb-3 rounded-md border border-line bg-muted/40 p-3 text-sm text-ink-soft">
                    {t('diagnosis.onDevice')}
                  </p>
                )}
                <DiagnosisResult diagnosis={diagnose.data} />
              </>
            )}
            {diagnose.isIdle && (
              <div className="flex flex-col gap-2 text-sm text-ink-muted">
                <p>{t('diagnosis.empty')}</p>
                <p>{t('diagnosis.tips')}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardTemplate>
  )
}
