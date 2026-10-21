'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ExternalLink } from 'lucide-react'
import { deleteList } from '@/app/actions/lists'

type ListType = {
  id: string
  name: string
  icon: string | null
  _count: { items: number }
}

export default function CollectionCard({ list }: { list: ListType }) {
  const [menu, setMenu] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false })
  const [isPending, startTransition] = useTransition()

  // Close context menu on any outside click or scroll
  useEffect(() => {
    const closeMenu = () => setMenu(prev => ({ ...prev, show: false }))
    window.addEventListener('click', closeMenu)
    window.addEventListener('scroll', closeMenu)
    return () => {
      window.removeEventListener('click', closeMenu)
      window.removeEventListener('scroll', closeMenu)
    }
  }, [])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY, show: true })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Delete "${list.name}"?`)) {
      startTransition(() => {
        deleteList(list.id)
      })
    }
  }

  return (
    <>
      <Link
        href={`/l/${list.id}`}
        onContextMenu={handleContextMenu}
        className="group relative flex flex-col justify-between p-6 h-40 bg-white dark:bg-white/[0.02] border border-black/[0.08] dark:border-white/[0.05] rounded-3xl hover:border-black/20 dark:hover:border-white/[0.1] transition-all no-select shadow-sm hover:shadow-md dark:shadow-none"
      >
        <div className="flex justify-between items-start">
          <span className="text-3xl drop-shadow-sm">{list.icon || '📝'}</span>
          <span className="text-xs font-medium px-2.5 py-1 bg-black/5 dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 rounded-full">
            {list._count.items} {list._count.items === 1 ? 'item' : 'items'}
          </span>
        </div>
        <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors line-clamp-1">
          {list.name}
        </h3>
      </Link>

      {/* Floating Context Menu Portal */}
      <AnimatePresence>
        {menu.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ top: menu.y, left: menu.x }}
            className="fixed z-50 w-48 bg-white dark:bg-[#111] border border-black/[0.08] dark:border-white/[0.1] rounded-xl shadow-2xl p-1 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Link 
              href={`/l/${list.id}`}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.05] hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors text-left"
            >
              <ExternalLink size={16} />
              Open Collection
            </Link>
            
            <div className="h-px w-full bg-black/[0.05] dark:bg-white/[0.05] my-1" />
            
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors text-left disabled:opacity-50"
            >
              <Trash2 size={16} />
              {isPending ? 'Deleting...' : 'Delete'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}