import { RouterProvider } from 'react-router-dom'
import { router } from './app/router/routes'

export default function App() {
  return <RouterProvider router={router} fallbackElement={<div aria-busy="true">Загрузка…</div>} />
}
