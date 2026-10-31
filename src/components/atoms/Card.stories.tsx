import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { Card } from './Card'

const meta = {
  title: 'Атомы/Card',
  component: Card,
  args: {
    title: 'Погода на участке',
    children: (
      <p className="text-sm text-ink-soft">
        9,6 °C, влажность 71 %, без осадков.
      </p>
    ),
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const WithTitle: Story = {}

export const WithDescriptionAndActions: Story = {
  args: {
    title: 'Диагностика без сети',
    description: 'Модель на устройстве определит болезнь там, где нет связи.',
    actions: (
      <Button size="sm" variant="secondary">
        Скачать модель
      </Button>
    ),
  },
}

// Без заголовка — просто поверхность для содержимого
export const Plain: Story = { args: { title: undefined } }
