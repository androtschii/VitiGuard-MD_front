import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const meta = {
  title: 'Атомы/Button',
  component: Button,
  args: { children: 'Определить болезнь' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// Главное действие экрана — одна такая кнопка на странице
export const Primary: Story = {}

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Выгрузить данные' },
}

export const Ghost: Story = { args: { variant: 'ghost', children: 'Отмена' } }

// Необратимые действия: удаление участка, блокировка пользователя
export const Danger: Story = {
  args: { variant: 'danger', children: 'Удалить участок' },
}

// Пока идёт запрос — индикатор, повторное нажатие не проходит
export const Loading: Story = { args: { isLoading: true } }

export const Disabled: Story = { args: { disabled: true } }

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Button {...args} size="sm">
        Маленькая
      </Button>
      <Button {...args} size="md">
        Обычная
      </Button>
      <Button {...args} size="lg">
        Крупная
      </Button>
    </div>
  ),
}
