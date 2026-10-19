'use client'

import { useEffect } from 'react'

export default function PWARegistry() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => console.log('PWA SW Registered:', registration.scope))
        .catch((error) => console.error('PWA SW Registration failed:', error))
    }
  }, [])

  return null
}