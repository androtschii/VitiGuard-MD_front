export type SprayInput = {
  areaHa: number
  // Норма препарата с этикетки на гектар, л или кг
  ratePerHa: number
  waterPerHa: number
  tankLiters: number
}

export type SprayResult = {
  product: number
  water: number
  tanks: number
  productPerTank: number
}

// Сколько препарата и воды нужно на участок и сколько препарата класть в бак.
// Без полных данных ответа нет: неполный расчёт опаснее пустого поля
export function calculateSpray({
  areaHa,
  ratePerHa,
  waterPerHa,
  tankLiters,
}: SprayInput): SprayResult | null {
  if (areaHa <= 0 || ratePerHa <= 0 || waterPerHa <= 0 || tankLiters <= 0)
    return null
  const water = areaHa * waterPerHa
  const product = areaHa * ratePerHa
  return {
    product,
    water,
    tanks: Math.ceil(water / tankLiters),
    productPerTank: (product * tankLiters) / water,
  }
}
