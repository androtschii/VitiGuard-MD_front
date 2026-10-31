import type { Meta, StoryObj } from '@storybook/react-vite'
import { WineriesToggle } from './WineriesToggle'

const meta = {
  title: 'Молекулы/WineriesToggle',
  component: WineriesToggle,
} satisfies Meta<typeof WineriesToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
