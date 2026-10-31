import type { Meta, StoryObj } from '@storybook/react-vite'
import { DownloadButton } from './DownloadButton'

const meta = {
  title: 'Молекулы/DownloadButton',
  component: DownloadButton,
  args: { children: 'Скачать PDF', variant: 'secondary', size: 'sm' },
} satisfies Meta<typeof DownloadButton>

export default meta
type Story = StoryObj<typeof meta>

export const Idle: Story = {}

export const Loading: Story = {
  args: { isLoading: true },
}
