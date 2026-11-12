import type { Vineyard } from '@/api/vineyards'

// Середина первого контура участка: погода в пределах участка одна и та же
export function vineyardPoint(vineyard: Vineyard): [number, number] | null {
  const ring = vineyard.geometry.coordinates[0]?.[0]
  if (!ring || ring.length === 0) return null
  const points = ring.length > 1 ? ring.slice(0, -1) : ring
  const lon =
    points.reduce((sum, point) => sum + Number(point[0]), 0) / points.length
  const lat =
    points.reduce((sum, point) => sum + Number(point[1]), 0) / points.length
  return [lon, lat]
}
