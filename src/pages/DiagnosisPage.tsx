import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDiagnose } from '@/api/diagnosis'
import { useNavItems } from '@/app/navigation'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Spinner } from '@/components/atoms/Spinner'
import { DiagnosisResult } from '@/components/organisms/DiagnosisResult'
import { LeafUpload } from '@/components/organisms/LeafUpload'
import { LogoutButton } from '@/components/organisms/LogoutButton'
import { DashboardTemplate } from '@/components/templates/DashboardTemplate'

export function DiagnosisPage() {
  const { t } = useTranslation()
  const navItems = useNavItems()
  const [file, setFile] = useState<File | null>(null)
  const diagnose = useDiagnose()

  return (
    <DashboardTemplate navItems={navItems} headerActions={<LogoutButton />}>
      <h1 className="mb-1 text-xl font-semibold text-ink">
        {t('diagnosis.title')}
      </h1>
      <p className="mb-4 max-w-2xl text-sm text-ink-muted">
        {t('diagnosis.intro')}
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={t('diagnosis.photo')} className="flex flex-col gap-1">
          <LeafUpload
            file={file}
            onSelect={(picked) => {
              setFile(picked)
              // Результат относится к прежнему фото
              diagnose.reset()
            }}
          />
          <Button
            className="w-full"
            disabled={!file}
            isLoading={diagnose.isPending}
            onClick={() => file && diagnose.mutate(file)}
          >
            {t('diagnosis.analyze')}
          </Button>
        </Card>

        <Card title={t('diagnosis.result')}>
          <div aria-live="polite">
            {diagnose.isPending && (
              <p className="flex items-center gap-2 text-sm text-ink-muted">
                <Spinner className="text-accent" />
                {t('diagnosis.analyzing')}
              </p>
            )}
            {diagnose.isError && (
              <p role="alert" className="text-sm text-danger">
                {diagnose.error.message}
              </p>
            )}
            {diagnose.isSuccess && (
              <DiagnosisResult diagnosis={diagnose.data} />
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
