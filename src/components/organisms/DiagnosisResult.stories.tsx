import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Diagnosis } from '@/api/diagnosis'
import { DiagnosisResult } from './DiagnosisResult'

const mildew: Diagnosis = {
  model: 'efficientnet_b0',
  disease: 'downy_mildew',
  confidence: 0.91,
  low_confidence: false,
  top: [
    { disease: 'downy_mildew', probability: 0.91 },
    { disease: 'powdery_mildew', probability: 0.05 },
    { disease: 'healthy', probability: 0.02 },
    { disease: 'black_rot', probability: 0.01 },
    { disease: 'esca', probability: 0.007 },
    { disease: 'leaf_blight', probability: 0.003 },
  ],
  heatmap: null,
  lesion: null,
}

// Ответ модели по фото листа: диагноз, уверенность и все вероятности
const meta = {
  title: 'Организмы/DiagnosisResult',
  component: DiagnosisResult,
  args: { diagnosis: mildew },
} satisfies Meta<typeof DiagnosisResult>

export default meta
type Story = StoryObj<typeof meta>

export const Disease: Story = {}

export const Healthy: Story = {
  args: {
    diagnosis: {
      ...mildew,
      disease: 'healthy',
      confidence: 0.97,
      top: [
        { disease: 'healthy', probability: 0.97 },
        { disease: 'downy_mildew', probability: 0.01 },
        { disease: 'powdery_mildew', probability: 0.01 },
        { disease: 'black_rot', probability: 0.005 },
        { disease: 'esca', probability: 0.003 },
        { disease: 'leaf_blight', probability: 0.002 },
      ],
    },
  },
}

// Ниже порога сервера — совет переснять лист
export const LowConfidence: Story = {
  args: {
    diagnosis: {
      ...mildew,
      confidence: 0.48,
      low_confidence: true,
      top: [
        { disease: 'downy_mildew', probability: 0.48 },
        { disease: 'powdery_mildew', probability: 0.41 },
        ...mildew.top.slice(2),
      ],
    },
  },
}
