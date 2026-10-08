import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { routes } from '@/app/routes'

export function App() {
  const [router] = useState(() => createBrowserRouter(routes))

  return <RouterProvider router={router} />
}
