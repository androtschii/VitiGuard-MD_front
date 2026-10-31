import type { Meta, StoryObj } from '@storybook/react-vite'
import { RiskBadge } from './RiskBadge'

// Уровень риска болезни: цвет дублируется словом — не только цветом
const meta = {
  title: 'Молекулы/RiskBadge',
  component: RiskBadge,
  args: { level: 'high' },
  argTypes: {
    level: { control: 'inline-radio', options: ['low', 'medium', 'high'] },
  },
} satisfies Meta<typeof RiskBadge>

export default meta
type Story = StoryObj<typeof meta>

export const High: Story = {}

export const Medium: Story = { args: { level: 'medium' } }

export const Low: Story = { args: { level: 'low' } }

export const AllLevels: Story = {
  render: () => (
    <div className="flex gap-2">
      <RiskBadge level="low" />
      <RiskBadge level="medium" />
      <RiskBadge level="high" />
    </div>
  ),
}
