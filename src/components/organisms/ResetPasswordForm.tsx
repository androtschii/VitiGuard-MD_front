import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ApiError } from '@/api/client'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Field } from '@/components/molecules/Field'
import { resetPasswordSchema, type ResetPasswordValues } from '@/schemas/auth'

type ResetPasswordFormProps = {
  onSubmit: (values: ResetPasswordValues) => Promise<void>
}

export function ResetPasswordForm({ onSubmit }: ResetPasswordFormProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      setError('root', {
        message:
          error instanceof ApiError ? error.message : t('auth.reset.failed'),
      })
    }
  })

  return (
    <form
      onSubmit={(event) => void submit(event)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Field
        label={t('auth.newPassword')}
        hint={t('auth.passwordHint')}
        error={errors.password?.message}
        required
      >
        {(control) => (
          <Input
            type="password"
            autoComplete="new-password"
            {...control}
            {...register('password')}
          />
        )}
      </Field>
      <Field
        label={t('auth.confirmPassword')}
        error={errors.confirmPassword?.message}
        required
      >
        {(control) => (
          <Input
            type="password"
            autoComplete="new-password"
            {...control}
            {...register('confirmPassword')}
          />
        )}
      </Field>
      {errors.root && (
        <p role="alert" className="text-sm text-danger">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" isLoading={isSubmitting}>
        {t('auth.reset.submit')}
      </Button>
    </form>
  )
}
