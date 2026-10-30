import type { Meta, StoryObj } from '@storybook/react-vite'
import { CountUp } from './CountUp'

const meta = {
  title: 'Атомы/CountUp',
  component: CountUp,
  args: { value: 128 },
} satisfies Meta<typeof CountUp>

export default meta
type Story = StoryObj<typeof meta>

export const Number: Story = {}

export const Formatted: Story = {
  args: { value: 27.4, format: (value) => `${value.toFixed(1)} га` },
}
