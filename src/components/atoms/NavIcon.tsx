import type { ReactNode } from 'react'

// Значки разделов (24×24, контур). Подвижные части размечены классами
// nav-icon-*: их анимация — в index.css
const HOME = (
  <>
    <path className="nav-icon-roof" d="M4 11l8-7 8 7" />
    <path d="M6 10v10h4v-6h4v6h4V10" />
  </>
)

const ICONS: Record<string, ReactNode> = {
  '/': HOME,
  '/map': (
    <path
      className="nav-icon-map"
      d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"
    />
  ),
  '/regions': (
    <>
      <path className="nav-icon-bar" d="M4 20V10h4v10" />
      <path className="nav-icon-bar nav-icon-bar-2" d="M10 20V4h4v16" />
      <path className="nav-icon-bar nav-icon-bar-3" d="M16 20v-7h4v7" />
    </>
  ),
  '/diagnosis': (
    <path
      className="nav-icon-leaf"
      d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14zM5 19l8-8"
    />
  ),
  '/history': (
    <>
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
      <path className="nav-icon-hands" d="M12 7v5l3 2" />
    </>
  ),
  '/profile': (
    <>
      <path className="nav-icon-head" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      <path d="M4 20c1-4 4-6 8-6s7 2 8 6" />
    </>
  ),
  '/admin': (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path className="nav-icon-check" pathLength={1} d="M9 12l2 2 4-4" />
    </>
  ),
}

export function NavIcon({ href }: { href: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="nav-icon size-6 overflow-visible"
    >
      {ICONS[href] ?? HOME}
    </svg>
  )
}
