import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { getConfig } from '../lib/api.ts'

export function AppLayout() {
  useEffect(() => {
    let cancelled = false
    getConfig()
      .then((c) => {
        if (cancelled) return
        document.documentElement.classList.toggle('dark', c.theme.default === 'dark')
      })
      .catch(() => {
        // ignore; page will show error locally
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="h-full">
      <Outlet />
    </div>
  )
}

