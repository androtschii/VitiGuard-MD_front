import type { Meta, StoryObj } from '@storybook/react-vite'
import { Ring } from './Ring'

const meta = {
  title: 'Атомы/Ring',
  component: Ring,
  args: {
    className: 'size-28',
    segments: [
      { percent: 25, className: 'stroke-red-600' },
      { percent: 25, className: 'stroke-amber-500' },
      { percent: 50, className: 'stroke-emerald-600' },
    ],
  },
} satisfies Meta<typeof Ring>

export default meta
type Story = StoryObj<typeof meta>

export const Shares: Story = {}

export const WithLabel: Story = {
  args: { children: <span className="text-xl font-semibold">4</span> },
}
