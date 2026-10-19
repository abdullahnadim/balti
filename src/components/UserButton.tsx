'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut } from 'lucide-react'
import Image from 'next/image'

export default function UserButton({ 
  user 
}: { 
  user: { name?: string | null; email?: string | null; image?: string | null } 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full overflow-hidden border border-black/10 dark:border-white/10 hover:scale-105 transition-transform"
      >
        {user.image ? (
          <Image src={user.image} alt="Profile" width={32} height={32} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium">
            {user.name?.charAt(0) || 'U'}
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#111] border border-black/5 dark:border-white/[0.1] rounded-xl shadow-2xl overflow-hidden z-50 p-1"
          >
            <div className="px-3 py-2 border-b border-black/5 dark:border-white/5 mb-1 text-sm">
              <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{user.name}</p>
              <p className="text-zinc-500 truncate text-xs">{user.email}</p>
            </div>
            
            <form action="/api/auth/signout" method="POST">
              <button 
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors text-left"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}