import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { routes } from '@/app/routes'
import { UpdatePrompt } from '@/components/organisms/UpdatePrompt'

export function App() {
  const [router] = useState(() => createBrowserRouter(routes))

  return (
    <>
      <RouterProvider router={router} />
      <UpdatePrompt />
    </>
  )
}
