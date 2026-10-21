'use client'

import { useOptimistic, useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { List } from '@prisma/client'
import QuickCapture from './QuickCapture'
import { Sparkles, Plus, ExternalLink, Trash2, Pin, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { deleteList } from '@/app/actions/lists'

type ListWithCount = List & { _count: { items: number } }

export default function DashboardUI({ initialLists }: { initialLists: ListWithCount[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [menu, setMenu] = useState<{ x: number; y: number; list: ListWithCount | null }>({
    x: 0,
    y: 0,
    list: null,
  })

  const [optimisticLists, addOptimisticItem] = useOptimistic(
    initialLists,
    (state, targetListId: string) =>
      state.map((list) =>
        list.id === targetListId
          ? { ...list, _count: { items: list._count.items + 1 } }
          : list
      )
  )

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPressRef = useRef(false)

  useEffect(() => {
    const dismissMenu = () => setMenu({ x: 0, y: 0, list: null })
    window.addEventListener('click', dismissMenu)
    window.addEventListener('scroll', dismissMenu)
    return () => {
      window.removeEventListener('click', dismissMenu)
      window.removeEventListener('scroll', dismissMenu)
    }
  }, [])

  const handleContextMenu = (e: React.MouseEvent, list: ListWithCount) => {
    e.preventDefault()
    e.stopPropagation()
    const menuWidth = 192
    const menuHeight = 110
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 16)
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 16)
    setMenu({ x, y, list })
  }

  const handleTouchStart = (e: React.TouchEvent, list: ListWithCount) => {
    isLongPressRef.current = false
    const touch = e.touches[0]
    const touchX = touch.clientX
    const touchY = touch.clientY

    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(35)
      }
      const menuWidth = 192
      const menuHeight = 110
      const x = Math.min(touchX, window.innerWidth - menuWidth - 16)
      const y = Math.min(touchY, window.innerHeight - menuHeight - 16)
      setMenu({ x, y, list })
    }, 550)
  }

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }
  }

  const handleDelete = (listId: string) => {
    setMenu({ x: 0, y: 0, list: null })
    if (confirm('Delete this collection?')) {
      startTransition(async () => {
        await deleteList(listId)
        router.refresh()
      })
    }
  }

  return (
    <>
      {optimisticLists.length === 0 ? (
        <div className="max-w-4xl mx-auto mt-4">
          <Link 
            href="/new"
            className="group w-full flex flex-col items-center justify-center p-16 md:p-24 rounded-[2rem] border-2 border-dashed border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 bg-white/40 dark:bg-white/[0.01] hover:bg-white dark:hover:bg-white/[0.03] transition-all duration-300 text-center"
          >
            <div className="w-16 h-16 mb-6 rounded-2xl bg-black/5 dark:bg-white/[0.05] flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:scale-110 group-hover:text-zinc-900 dark:group-hover:text-white transition-all duration-300">
              <Sparkles size={28} />
            </div>
            <h3 className="text-2xl font-medium text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight">
              Your space is clear.
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-8">
              Create your first collection to start organizing your thoughts, tasks, and goals.
            </p>
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black font-medium text-sm transition-transform group-hover:scale-105 active:scale-95 shadow-sm">
              <Plus size={16} />
              Craft a Collection
            </span>
          </Link>
        </div>
      ) : (
        <section className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {optimisticLists.map((list) => (
            <Link 
              href={`/l/${list.id}`} 
              key={list.id}
              onClick={(e) => {
                if (isLongPressRef.current) {
                  e.preventDefault()
                  isLongPressRef.current = false
                }
              }}
              onContextMenu={(e) => handleContextMenu(e, list)}
              onTouchStart={(e) => handleTouchStart(e, list)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchEnd}
              className="group relative block p-6 rounded-2xl bg-white dark:bg-[#111111]/90 border border-black/[0.06] dark:border-white/[0.06] hover:border-black/20 dark:hover:border-white/[0.14] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition-all duration-200 select-none"
              style={{ '--list-accent': list.accentColor || '#111' } as React.CSSProperties}
            >
              <div className="flex justify-between items-start mb-8">
                <span className="text-2xl bg-zinc-100 dark:bg-white/[0.04] w-12 h-12 flex items-center justify-center rounded-2xl border border-black/[0.04] dark:border-white/[0.05] group-hover:scale-105 transition-transform duration-200">
                  {list.icon || '📝'}
                </span>
                
                <div className="flex items-center gap-2">
                  {list.isPinned && (
                    <span className="p-1.5 text-zinc-400 dark:text-zinc-500">
                      <Pin size={13} className="rotate-45" />
                    </span>
                  )}
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-3 py-1 bg-black/[0.03] dark:bg-white/[0.04] rounded-full border border-black/[0.04] dark:border-white/[0.03]">
                    {list._count.items} {list._count.items === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors truncate">
                {list.name}
              </h3>
            </Link>
          ))}

          {/* New List Action Card */}
          <Link
            href="/new"
            className="group flex flex-col justify-between p-6 rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/20 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all duration-200 min-h-[170px] select-none"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04] text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:scale-105 transition-all duration-200">
              <Plus size={20} />
            </div>
            <div>
              <h3 className="text-base font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                New collection
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Add another bucket
              </p>
            </div>
          </Link>
        </section>
      )}

      {/* Floating Context Menu */}
      <AnimatePresence>
        {menu.list && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 4 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={{ top: menu.y, left: menu.x }}
            className="fixed z-50 w-48 bg-white/95 dark:bg-[#141414]/95 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-xl shadow-2xl p-1 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                const targetId = menu.list?.id
                setMenu({ x: 0, y: 0, list: null })
                if (targetId) router.push(`/l/${targetId}`)
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-left"
            >
              <ExternalLink size={15} />
              Open
            </button>

            <div className="h-px w-full bg-black/[0.06] dark:bg-white/[0.06] my-1" />

            <button
              onClick={() => menu.list && handleDelete(menu.list.id)}
              disabled={isPending}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {optimisticLists.length > 0 && (
        <QuickCapture lists={optimisticLists} onOptimisticAdd={addOptimisticItem} />
      )}
    </>
  )
}