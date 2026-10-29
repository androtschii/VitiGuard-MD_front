import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from '@/components/atoms/Input'
import { Select } from '@/components/atoms/Select'
import { Textarea } from '@/components/atoms/Textarea'
import { Field } from './Field'

// Поле формы: подпись, подсказка и ошибка связаны с элементом ввода для
// экранных дикторов; сам элемент выбирает форма
const meta = {
  title: 'Молекулы/Field',
  component: Field,
  args: {
    label: 'Название участка',
    children: (control) => (
      <Input {...control} defaultValue="Криково, северный склон" />
    ),
  },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = {}

export const Required: Story = { args: { required: true } }

export const WithHint: Story = {
  args: {
    label: 'Пароль',
    hint: 'Не короче 8 символов, с буквами и цифрами',
    children: (control) => <Input {...control} type="password" />,
  },
}

// Текст ошибки — ключ перевода validation.*, на экране он на языке интерфейса
export const WithError: Story = {
  args: {
    label: 'Email',
    error: 'validation.emailInvalid',
    children: (control) => <Input {...control} defaultValue="ion@" />,
  },
}

export const WithSelect: Story = {
  args: {
    label: 'Роль',
    children: (control) => (
      <Select {...control} defaultValue="user">
        <option value="user">Виноградарь</option>
        <option value="agronomist">Агроном</option>
      </Select>
    ),
  },
}

export const WithTextarea: Story = {
  args: {
    label: 'Заключение агронома',
    children: (control) => <Textarea {...control} rows={3} />,
  },
}
