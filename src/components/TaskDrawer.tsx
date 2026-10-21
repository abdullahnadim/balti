'use client'

import { useState, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlignLeft, Flag } from 'lucide-react'
import { ListItem } from '@prisma/client'
import { updateItemDetails } from '@/app/actions/items'

type TaskDrawerProps = {
  item: ListItem | null
  isOpen: boolean
  onClose: () => void
  listId: string
  onUpdateOptimistic: (id: string, data: Partial<ListItem>) => void
}

const PRIORITIES = [
  { value: 0, label: 'None', color: 'bg-zinc-200 dark:bg-zinc-800' },
  { value: 1, label: 'Low', color: 'bg-blue-500' },
  { value: 2, label: 'Medium', color: 'bg-amber-500' },
  { value: 3, label: 'High', color: 'bg-rose-500' },
]

export default function TaskDrawer({ item, isOpen, onClose, listId, onUpdateOptimistic }: TaskDrawerProps) {
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState(0)
  const [isPending, startTransition] = useTransition()

  // Sync state when a new item is opened
  useEffect(() => {
    if (item) {
      setNotes(item.notes || '')
      setPriority(item.priority || 0)
    }
  }, [item])

  const handleSave = () => {
    if (!item) return
    
    // Optimistically update the UI
    onUpdateOptimistic(item.id, { notes, priority })
    
    // Save to database
    startTransition(async () => {
      await updateItemDetails(item.id, listId, { notes, priority })
    })
  }

  // Auto-save when closing
  const handleClose = () => {
    if (item && (notes !== (item.notes || '') || priority !== (item.priority || 0))) {
      handleSave()
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && item && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white dark:bg-[#111] border-l border-black/10 dark:border-white/10 shadow-2xl z-50 flex flex-col"
          >
            <header className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate pr-4">
                {item.title}
              </h3>
              <button 
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Notes Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  <AlignLeft size={16} />
                  Notes
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add details, links, or sub-tasks..."
                  className="w-full min-h-[150px] bg-black/5 dark:bg-white/[0.03] border-none rounded-xl p-4 text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-[var(--list-accent)]/50 resize-none transition-all"
                />
              </div>

              {/* Priority Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  <Flag size={16} />
                  Priority
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPriority(p.value)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        priority === p.value
                          ? 'border-[var(--list-accent)] bg-[var(--list-accent)]/10 text-zinc-900 dark:text-white'
                          : 'border-black/5 dark:border-white/5 bg-transparent text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${p.color}`} />
                      <span className="text-xs font-medium">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}