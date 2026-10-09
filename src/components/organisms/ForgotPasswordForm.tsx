import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ApiError } from '@/api/client'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Field } from '@/components/molecules/Field'
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/schemas/auth'

type ForgotPasswordFormProps = {
  onSubmit: (values: ForgotPasswordValues) => Promise<void>
}

export function ForgotPasswordForm({ onSubmit }: ForgotPasswordFormProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      setError('root', {
        message:
          error instanceof ApiError ? error.message : t('auth.forgot.failed'),
      })
    }
  })

  return (
    <form
      onSubmit={(event) => void submit(event)}
      noValidate
      className="flex flex-col gap-4"
    >
      <p className="text-sm text-stone-600">{t('auth.forgot.intro')}</p>
      <Field label={t('auth.email')} error={errors.email?.message} required>
        {(control) => (
          <Input
            type="email"
            autoComplete="email"
            {...control}
            {...register('email')}
          />
        )}
      </Field>
      {errors.root && (
        <p role="alert" className="text-sm text-red-700">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" isLoading={isSubmitting}>
        {t('auth.forgot.submit')}
      </Button>
    </form>
  )
}
