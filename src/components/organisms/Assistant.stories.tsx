import type { Meta, StoryObj } from '@storybook/react-vite'
import { Assistant } from './Assistant'

const meta = {
  title: 'Организмы/Assistant',
  component: Assistant,
} satisfies Meta<typeof Assistant>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
