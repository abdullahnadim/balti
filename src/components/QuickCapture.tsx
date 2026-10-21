'use client'

import { useState, useEffect, startTransition, useActionState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createItem } from '@/app/actions/items'
import { List } from '@prisma/client'
import { Plus } from 'lucide-react'

const initialState = { success: false, error: '' }

export default function QuickCapture({ 
  lists, 
  onOptimisticAdd 
}: { 
  lists: List[],
  onOptimisticAdd: (listId: string) => void 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createItem, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Default to the first list and synchronize if lists update
  const [selectedListId, setSelectedListId] = useState<string>(lists[0]?.id || '')

  useEffect(() => {
    if (!selectedListId && lists.length > 0) {
      setSelectedListId(lists[0].id)
    }
  }, [lists, selectedListId])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (state.success) {
      setIsOpen(false)
      formRef.current?.reset()
    }
  }, [state.success])

  const handleOptimisticSubmit = (formData: FormData) => {
    const listId = formData.get('listId') as string
    const title = (formData.get('title') as string)?.trim()
    
    if (!listId || !title) return

    onOptimisticAdd(listId)
    setIsOpen(false)

    startTransition(() => {
      formAction(formData)
    })
  }

  if (lists.length === 0) return null

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-[0_8px_30px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.12)] hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="Quick Capture"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-[14vh] px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false)
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-hidden"
            >
              <form ref={formRef} action={handleOptimisticSubmit} className="flex flex-col">
                <input type="hidden" name="listId" value={selectedListId} />

                {/* Main Capture Input */}
                <div className="p-6 md:p-8 pb-5">
                  <input
                    ref={inputRef}
                    type="text"
                    name="title"
                    placeholder="Capture a thought..."
                    required
                    autoComplete="off"
                    disabled={isPending}
                    className="w-full text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100 bg-transparent border-none outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-medium tracking-tight"
                  />
                  {state.error && (
                    <p className="text-rose-600 dark:text-rose-400 text-sm mt-3 font-medium">
                      {state.error}
                    </p>
                  )}
                </div>
                
                {/* Collection Chips & Submission Hint */}
                <div className="px-6 md:px-8 py-3.5 bg-zinc-50 dark:bg-white/[0.02] border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-0.5">
                    {lists.map((list) => {
                      const isSelected = (selectedListId || lists[0]?.id) === list.id
                      return (
                        <button
                          key={list.id}
                          type="button"
                          onClick={() => setSelectedListId(list.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap select-none ${
                            isSelected 
                              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm' 
                              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          <span className={isSelected ? 'opacity-100' : 'opacity-70'}>
                            {list.icon || '📝'}
                          </span>
                          <span>{list.name}</span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="shrink-0 hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase select-none">
                    <span>Press</span>
                    <kbd className="px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded text-zinc-700 dark:text-zinc-300 font-mono text-[10px]">
                      Enter
                    </kbd>
                  </div>

                  <button type="submit" className="hidden" />
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}