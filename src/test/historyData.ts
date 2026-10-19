import type { DiagnosisRecord } from '@/api/diagnoses'

// Проверка из истории для тестов
export function record(
  id: string,
  overrides: Partial<DiagnosisRecord> = {},
): DiagnosisRecord {
  return {
    id,
    created_at: '2026-06-10T09:30:00Z',
    updated_at: '2026-06-10T09:30:00Z',
    vineyard_id: 'vineyard-1',
    vineyard_name: 'Криково',
    model: 'efficientnet_b0',
    model_version: '82c7cbf32ff86379',
    disease: 'black_rot',
    confidence: 0.93,
    top: [
      { disease: 'black_rot', probability: 0.93 },
      { disease: 'downy_mildew', probability: 0.04 },
    ],
    review: null,
    ...overrides,
  }
}

export function page(
  items: DiagnosisRecord[],
  total = items.length,
  pages = 1,
) {
  return { items, total, page: 1, size: 12, pages }
}
