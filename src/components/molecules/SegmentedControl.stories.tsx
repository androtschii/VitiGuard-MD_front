import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { SegmentedControl } from './SegmentedControl'

const periods = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'season', label: 'Сезон' },
] as const

type Period = (typeof periods)[number]['value']

function Periods({ initial }: { initial: Period }) {
  const [value, setValue] = useState<Period>(initial)
  return (
    <SegmentedControl
      label="Период"
      options={periods}
      value={value}
      onChange={setValue}
    />
  )
}

// Группа радиокнопок в виде переключателя: стрелки клавиатуры и «выбрано,
// 1 из 3» браузер даёт сам
const meta = {
  title: 'Молекулы/SegmentedControl',
  component: Periods,
  args: { initial: 'month' },
} satisfies Meta<typeof Periods>

export default meta
type Story = StoryObj<typeof meta>

export const Month: Story = {}

export const Season: Story = { args: { initial: 'season' } }
