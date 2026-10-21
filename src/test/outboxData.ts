import type { NewQueuedDiagnosis } from '@/lib/outbox'

// Проверка, сделанная без сети и ждущая отправки (pr-076)
export const queuedLeaf: NewQueuedDiagnosis = {
  image: new TextEncoder().encode('leaf').buffer,
  name: 'leaf.jpg',
  type: 'image/jpeg',
  vineyardId: 'plot-1',
  createdAt: '2026-06-10T07:30:00.000Z',
  disease: 'downy_mildew',
  confidence: 0.82,
}
