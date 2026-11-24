import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { ApiError } from '@/api/client'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Field } from '@/components/molecules/Field'
import { registerSchema, type RegisterValues } from '@/schemas/auth'

type RegisterFormProps = {
  onSubmit: (values: RegisterValues) => Promise<void>
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  })

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        // Конфликт значит одно: email занят, поэтому ошибка относится к полю
        setError('email', { message: t('auth.register.emailTaken') })
      } else {
        setError('root', {
          message:
            error instanceof ApiError
              ? error.message
              : t('auth.register.failed'),
        })
      }
    }
  })

  return (
    <form
      onSubmit={(event) => void submit(event)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Field
        label={t('auth.fullName')}
        error={errors.fullName?.message}
        required
      >
        {(control) => (
          <Input autoComplete="name" {...control} {...register('fullName')} />
        )}
      </Field>
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
      <Field
        label={t('auth.password')}
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
      <div className="flex flex-col gap-1">
        <label className="flex cursor-pointer items-start gap-2 text-sm text-ink">
          <input
            type="checkbox"
            className="mt-0.5 size-4 accent-brand-700"
            aria-invalid={errors.agreePrivacy ? true : undefined}
            aria-describedby={errors.agreePrivacy ? 'privacy-error' : undefined}
            {...register('agreePrivacy')}
          />
          <span>
            {t('auth.register.agreePrivacy')}{' '}
            <Link
              to="/privacy"
              target="_blank"
              rel="noopener"
              className="font-medium text-accent underline"
            >
              {t('auth.register.privacyPolicy')}
            </Link>
          </span>
        </label>
        {errors.agreePrivacy?.message && (
          <p id="privacy-error" role="alert" className="text-xs text-danger">
            {t(errors.agreePrivacy.message)}
          </p>
        )}
      </div>
      {errors.root && (
        <p role="alert" className="text-sm text-danger">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" isLoading={isSubmitting}>
        {t('auth.register.submit')}
      </Button>
    </form>
  )
}
