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
  
  // Default to the first list
  const [selectedList, setSelectedList] = useState<List | null>(lists[0] || null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
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
    if (state.success) {
      setIsOpen(false)
      formRef.current?.reset()
    }
  }, [state.success])

  const handleOptimisticSubmit = (formData: FormData) => {
    const listId = formData.get('listId') as string
    const title = formData.get('title') as string
    
    if (!listId || !title) return

    onOptimisticAdd(listId)
    setIsOpen(false)
    formRef.current?.reset()

    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex items-center justify-center w-14 h-14 bg-white text-black rounded-full shadow-[0_8px_30px_rgb(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="Quick Capture"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-start justify-center pt-[15vh] px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false)
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="bg-[#111] w-full max-w-2xl rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <form ref={formRef} action={handleOptimisticSubmit} className="flex flex-col">
                <input type="hidden" name="listId" value={selectedList?.id || ''} />

                {/* Massive, distraction-free input */}
                <div className="p-6 md:p-8 pb-6">
                  <input
                    type="text"
                    name="title"
                    placeholder="Capture a thought..."
                    autoFocus
                    required
                    autoComplete="off"
                    className="w-full text-3xl md:text-4xl text-white bg-transparent border-none outline-none placeholder-zinc-700 font-medium tracking-tight"
                    disabled={isPending}
                  />
                  {state.error && (
                    <p className="text-rose-500 text-sm mt-3">{state.error}</p>
                  )}
                </div>
                
                {/* Sleek horizontal list chips & Enter key hint */}
                <div className="px-6 md:px-8 py-4 bg-white/[0.02] border-t border-white/[0.05] flex items-center justify-between gap-4">
                  
                  <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar mask-edges">
                    {lists.map((list) => (
                      <button
                        key={list.id}
                        type="button"
                        onClick={() => setSelectedList(list)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                          selectedList?.id === list.id 
                            ? 'bg-white text-black shadow-sm' 
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className={selectedList?.id === list.id ? 'opacity-100' : 'opacity-70'}>
                          {list.icon}
                        </span>
                        {list.name}
                      </button>
                    ))}
                  </div>

                  <div className="shrink-0 hidden md:flex items-center gap-2 text-xs font-medium text-zinc-500 tracking-widest uppercase">
                    Press <span className="px-2 py-1 bg-white/[0.1] rounded-md text-zinc-300">Enter</span>
                  </div>

                  {/* Hidden submit button to allow Enter key submission */}
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