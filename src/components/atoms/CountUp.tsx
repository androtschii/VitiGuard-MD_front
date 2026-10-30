import { useCountUp } from '@/lib/useCountUp'

type CountUpProps = {
  value: number
  format?: (value: number) => string
}

export function CountUp({ value, format = roundNumber }: CountUpProps) {
  return <>{format(useCountUp(value))}</>
}

function roundNumber(value: number) {
  return String(Math.round(value))
}
