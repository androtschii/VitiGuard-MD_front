import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ApiError } from '@/api/client'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Field } from '@/components/molecules/Field'
import { loginSchema, type LoginValues } from '@/schemas/auth'

type LoginFormProps = {
  onSubmit: (values: LoginValues) => Promise<void>
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      // Текст ошибки сервера («Неверный email или пароль») показываем как есть
      setError('root', {
        message:
          error instanceof ApiError ? error.message : t('auth.login.failed'),
      })
    }
  })

  return (
    // noValidate: ошибки показывает Zod на русском, а не браузер на своём языке
    <form
      onSubmit={(event) => void submit(event)}
      noValidate
      className="flex flex-col gap-4"
    >
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
        error={errors.password?.message}
        required
      >
        {(control) => (
          <Input
            type="password"
            autoComplete="current-password"
            {...control}
            {...register('password')}
          />
        )}
      </Field>
      {errors.root && (
        <p role="alert" className="text-sm text-red-700">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" isLoading={isSubmitting}>
        {t('auth.login.submit')}
      </Button>
    </form>
  )
}
