import type { Alert } from '@/api/alerts'

// Предупреждение для тестов
export function alert(id: string, overrides: Partial<Alert> = {}): Alert {
  return {
    id,
    created_at: '2026-06-10T06:00:00Z',
    updated_at: '2026-06-10T06:00:00Z',
    vineyard_id: 'vineyard-1',
    vineyard_name: 'Криково',
    disease: 'downy_mildew',
    day: '2026-06-10',
    level: 'high',
    read_at: null,
    forecast: false,
    ...overrides,
  }
}

export function alertPage(items: Alert[], total = items.length, pages = 1) {
  return { items, total, page: 1, size: 20, pages }
}
