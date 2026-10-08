import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ApiError } from '@/api/client'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Select } from '@/components/atoms/Select'
import { Field } from '@/components/molecules/Field'
import {
  registerSchema,
  registrationRoles,
  type RegisterValues,
} from '@/schemas/auth'

type RegisterFormProps = {
  onSubmit: (values: RegisterValues) => Promise<void>
}

const EMAIL_TAKEN = 'Пользователь с таким email уже зарегистрирован'

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'user' },
  })

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        // Конфликт значит одно: email занят, поэтому ошибка относится к полю
        setError('email', { message: EMAIL_TAKEN })
      } else {
        setError('root', {
          message:
            error instanceof ApiError
              ? error.message
              : 'Не удалось зарегистрироваться',
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
      <Field label="Имя" error={errors.fullName?.message} required>
        {(control) => (
          <Input autoComplete="name" {...control} {...register('fullName')} />
        )}
      </Field>
      <Field label="Email" error={errors.email?.message} required>
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
        label="Пароль"
        hint="Не короче 8 символов, с буквами и цифрами"
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
        label="Повторите пароль"
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
      <Field label="Роль" error={errors.role?.message} required>
        {(control) => (
          <Select {...control} {...register('role')}>
            {registrationRoles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </Select>
        )}
      </Field>
      {errors.root && (
        <p role="alert" className="text-sm text-red-700">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" isLoading={isSubmitting}>
        Зарегистрироваться
      </Button>
    </form>
  )
}
