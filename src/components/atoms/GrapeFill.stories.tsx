import type { Meta, StoryObj } from '@storybook/react-vite'
import { GrapeFill } from './GrapeFill'

const meta = {
  title: 'Атомы/GrapeFill',
  component: GrapeFill,
} satisfies Meta<typeof GrapeFill>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
