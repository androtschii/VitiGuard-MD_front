import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ApiError } from '@/api/client'
import { type CurrentUser, useUpdateMe } from '@/api/users'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Field } from '@/components/molecules/Field'
import { profileSchema, type ProfileValues } from '@/schemas/profile'

type ProfileFormProps = {
  user: CurrentUser
}

// Профиль (pr-089): имя меняется, email и роль только показываются —
// сервер их в профиле не принимает
export function ProfileForm({ user }: ProfileFormProps) {
  const { t } = useTranslation()
  const { mutateAsync } = useUpdateMe()
  const [isSaved, setIsSaved] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user.full_name ?? '' },
  })

  const submit = handleSubmit(async ({ fullName }) => {
    setIsSaved(false)
    try {
      const updated = await mutateAsync({ full_name: fullName })
      reset({ fullName: updated.full_name ?? '' })
      setIsSaved(true)
    } catch (error) {
      setError('root', {
        message:
          error instanceof ApiError ? error.message : t('profile.failed'),
      })
    }
  })

  return (
    <form
      onSubmit={(event) => void submit(event)}
      noValidate
      className="flex flex-col gap-4"
    >
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-muted">{t('auth.email')}</dt>
          <dd className="text-ink">{user.email}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">{t('auth.role')}</dt>
          <dd className="text-ink">{t(`auth.roles.${user.role}`)}</dd>
        </div>
      </dl>
      <Field
        label={t('auth.fullName')}
        error={errors.fullName?.message}
        required
      >
        {(control) => (
          <Input autoComplete="name" {...control} {...register('fullName')} />
        )}
      </Field>
      {errors.root && (
        <p role="alert" className="text-sm text-danger">
          {errors.root.message}
        </p>
      )}
      <p role="status" className="min-h-5 text-sm text-accent">
        {isSaved && !isDirty ? t('profile.saved') : ''}
      </p>
      <Button
        type="submit"
        isLoading={isSubmitting}
        disabled={!isDirty}
        className="self-start"
      >
        {t('profile.save')}
      </Button>
    </form>
  )
}
