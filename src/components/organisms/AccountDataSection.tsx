import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useDeleteAccount, useDownloadMyData } from '@/api/account'
import { ApiError } from '@/api/client'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Modal } from '@/components/organisms/Modal'

// Ответ сервера переводится по коду: его текст только на русском
function errorKey(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'accountData.delete.wrongPassword'
    if (error.status === 409) return 'accountData.delete.lastAdmin'
    if (error.status === 429) return 'accountData.tooOften'
  }
  return fallback
}

// «Мои данные» в профиле: выгрузка и удаление аккаунта самим пользователем
// (Закон Республики Молдова № 195/2024 о защите персональных данных)
export function AccountDataSection() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const download = useDownloadMyData()
  const remove = useDeleteAccount()
  const [isConfirming, setIsConfirming] = useState(false)
  const [password, setPassword] = useState('')
  const passwordId = useId()

  const close = () => {
    setIsConfirming(false)
    setPassword('')
    remove.reset()
  }

  const confirm = () =>
    remove.mutate(password, {
      onSuccess: () => void navigate('/welcome', { replace: true }),
    })

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-muted">{t('accountData.hint')}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          isLoading={download.isPending}
          onClick={() => download.mutate()}
        >
          {t('accountData.export.button')}
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => setIsConfirming(true)}
        >
          {t('accountData.delete.button')}
        </Button>
      </div>
      {download.isError && (
        <p role="alert" className="text-sm text-danger">
          {t(errorKey(download.error, 'accountData.export.error'))}
        </p>
      )}

      <Modal
        open={isConfirming}
        onClose={close}
        title={t('accountData.delete.title')}
        description={t('accountData.delete.warning')}
        footer={
          <>
            <Button variant="secondary" onClick={close}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              isLoading={remove.isPending}
              disabled={!password || remove.isPending}
              onClick={confirm}
            >
              {t('accountData.delete.confirm')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor={passwordId} className="text-sm text-ink-soft">
            {t('accountData.delete.password')}
          </label>
          <Input
            id={passwordId}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {remove.isError && (
            <p role="alert" className="text-sm text-danger">
              {t(errorKey(remove.error, 'accountData.delete.error'))}
            </p>
          )}
        </div>
      </Modal>
    </div>
  )
}
