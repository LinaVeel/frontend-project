import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
  { path: '/', lazy: () => import('./routeIndex') },
  { path: '/chat/:id', lazy: () => import('./routeChat') },
])
