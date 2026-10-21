'use client'

import { useTheme } from '@teispace/next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/5 animate-pulse" />
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme

  return (
    <button
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
      className="no-select flex items-center justify-center w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-colors text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
      aria-label="Toggle theme"
    >
      {currentTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}