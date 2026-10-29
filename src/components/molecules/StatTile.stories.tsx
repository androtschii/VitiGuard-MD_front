import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatTile } from './StatTile'

// Плитка сводки на главной; плитки ставятся в список описаний <dl>
const meta = {
  title: 'Молекулы/StatTile',
  component: StatTile,
  args: { label: 'Площадь участков', value: '27,4 га' },
  decorators: [
    (Story) => (
      <dl className="max-w-xs">
        <Story />
      </dl>
    ),
  ],
} satisfies Meta<typeof StatTile>

export default meta
type Story = StoryObj<typeof meta>

export const Value: Story = {}

export const WithHint: Story = {
  args: { label: 'Высокий риск сегодня', value: 2, hint: 'из 5 участков' },
}
