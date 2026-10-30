import { useEffect, useRef, useState } from 'react'

const prefersMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: no-preference)').matches ??
  false

// Плавно ведёт число к цели. Без анимации сразу отдаёт цель
export function useCountUp(target: number, duration = 800) {
  const [shown, setShown] = useState(0)
  const current = useRef(0)
  const animate = prefersMotion()

  useEffect(() => {
    if (!animate) return
    const from = current.current
    const start = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      current.current = from + (target - from) * eased
      setShown(current.current)
      if (progress < 1) frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [animate, duration, target])

  return animate ? shown : target
}
