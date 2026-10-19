'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="w-8 h-8" /> // Placeholder to prevent layout shift

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex items-center justify-center w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 0 : 90,
          scale: isDark ? 1 : 0,
          opacity: isDark ? 1 : 0
        }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.5 }}
        className="absolute"
      >
        <Moon size={16} />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? -90 : 0,
          scale: isDark ? 0 : 1,
          opacity: isDark ? 0 : 1
        }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.5 }}
        className="absolute"
      >
        <Sun size={16} />
      </motion.div>
    </button>
  )
}