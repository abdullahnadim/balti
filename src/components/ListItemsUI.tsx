'use client'

import { useState, useEffect, useRef, startTransition } from 'react'
import { playCheckSound, playUncheckSound } from '@/lib/audio'
import { Reorder, AnimatePresence, motion } from 'framer-motion'
import TaskDrawer from './TaskDrawer'
import { createItem, reorderItems, updateItemDetails, toggleItemStatus, sortItemsByPriority } from '@/app/actions/items'
import { ListItem } from '@prisma/client'
import { Plus, GripVertical, Check, ChevronRight, ArrowDownUp } from 'lucide-react'

const PRIORITY_COLORS = [
  'bg-transparent',
  'bg-blue-500',   // Low
  'bg-amber-500',  // Medium
  'bg-rose-500',   // High
]

export default function ListItemsUI({ 
  initialItems = [], 
  listId 
}: { 
  initialItems?: ListItem[]
  listId: string 
}) {
  const formRef = useRef<HTMLFormElement>(null)
  
  const [items, setItems] = useState<ListItem[]>(initialItems || [])
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [selectedTask, setSelectedTask] = useState<ListItem | null>(null)

  useEffect(() => {
    if (!draggingId && !editingId) {
      setItems(initialItems || [])
    }
  }, [initialItems, draggingId, editingId])

  const activeItems = items.filter(item => !item.isArchived)
  const completedItems = items.filter(item => item.isArchived)
  
  const totalItems = items.length
  const progressPercentage = totalItems === 0 ? 0 : Math.round((completedItems.length / totalItems) * 100)

  const handleToggleStatus = (item: ListItem) => {
    const newStatus = !item.isArchived
    if (newStatus) playCheckSound()
    else playUncheckSound()

    startTransition(() => {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isArchived: newStatus } : i))
    })
    toggleItemStatus(item.id, listId, newStatus)
  }

  const handleAdd = (formData: FormData) => {
    const title = formData.get('title') as string
    if (!title) return

    const tempItem: ListItem = {
      id: `temp-${Date.now()}`,
      title,
      notes: null,
      status: 'todo',
      priority: 0,
      metadata: {},
      position: (activeItems[activeItems.length - 1]?.position ?? 0) + 1024,
      isArchived: false,
      listId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    startTransition(() => {
      setItems(prev => [...prev, tempItem])
    })
    
    formRef.current?.reset()
    createItem({}, formData)
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    const orderedIds = activeItems.map(item => item.id)
    startTransition(() => {
      reorderItems(listId, orderedIds)
    })
  }

  const handleSmartSort = () => {
    // 1. Optimistically sort immediately
    const sortedActive = [...activeItems].sort((a, b) => {
      if (b.priority !== a.priority) return (b.priority || 0) - (a.priority || 0)
      return a.position - b.position
    }).map((item, index) => ({ ...item, position: index * 1024 }))

    startTransition(() => {
      setItems([...sortedActive, ...completedItems])
    })

    // 2. Persist to DB
    sortItemsByPriority(listId)
  }

  const startEditing = (item: ListItem) => {
    setEditingId(item.id)
    setEditValue(item.title)
  }

  const saveEdit = (itemId: string, originalTitle: string) => {
    const newTitle = editValue.trim()
    if (!newTitle || newTitle === originalTitle) {
      setEditingId(null)
      return
    }
    startTransition(() => {
      setItems(prev => prev.map(item => item.id === itemId ? { ...item, title: newTitle } : item))
    })
    setEditingId(null)
    updateItemDetails(itemId, listId, { title: newTitle })
  }

  const handleEditKeyDown = (e: React.KeyboardEvent, itemId: string, originalTitle: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveEdit(itemId, originalTitle)
    } else if (e.key === 'Escape') {
      setEditingId(null)
    }
  }

  const handleUpdateOptimistic = (id: string, data: Partial<ListItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...data } : item))
  }

  return (
    <>
      <div className="space-y-8 pb-32">
        {/* AMBIENT PROGRESS & SORT HEADER */}
        {totalItems > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                <span>Progress</span>
                <span className="ml-2">{progressPercentage}%</span>
              </div>
              
              {/* Smart Sort Button */}
              {activeItems.length > 1 && (
                <button
                  onClick={handleSmartSort}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 bg-black/5 hover:bg-black/10 dark:bg-white/[0.04] dark:hover:bg-white/10 rounded-md transition-all active:scale-95"
                  title="Sort by Priority"
                >
                  <ArrowDownUp size={12} />
                  Smart Sort
                </button>
              )}
            </div>
            <div className="h-1 w-full bg-black/5 dark:bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-[var(--list-accent)] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.8 }}
              />
            </div>
          </div>
        )}

        {/* ACTIVE ITEMS SECTION */}
        <div className="space-y-2">
          {activeItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="py-12 border border-dashed border-black/10 dark:border-white/[0.1] rounded-2xl flex flex-col items-center justify-center text-center px-4"
            >
              <div className="w-12 h-12 bg-black/5 dark:bg-white/[0.03] rounded-full flex items-center justify-center mb-4 text-zinc-500 dark:text-zinc-400">
                <Check size={24} />
              </div>
              <p className="text-zinc-900 dark:text-zinc-300 font-medium">You're all caught up.</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Press Cmd+K or use the input below to add tasks.</p>
            </motion.div>
          ) : (
            <Reorder.Group 
              axis="y" 
              values={activeItems} 
              onReorder={(newOrder) => {
                const updatedItems = items.map(item => {
                  if (item.isArchived) return item
                  return newOrder.find(n => n.id === item.id) || item
                })
                setItems(newOrder.concat(completedItems))
              }}
              className="flex flex-col"
            >
              <AnimatePresence mode="popLayout">
                {activeItems.map(item => (
                  <Reorder.Item 
                    key={item.id}
                    value={item}
                    onDragStart={() => setDraggingId(item.id)}
                    onDragEnd={handleDragEnd}
                    layout
                    transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: draggingId && draggingId !== item.id ? 0.4 : 1,
                      scale: draggingId && draggingId !== item.id ? 0.98 : 1,
                      y: 0
                    }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    whileDrag={{ scale: 1.02, zIndex: 50, cursor: 'grabbing' }}
                    className="group flex items-start gap-4 p-3 -mx-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/[0.03] transition-colors relative bg-zinc-50 dark:bg-transparent"
                  >
                    <div className="mt-1.5 cursor-grab group-active:cursor-grabbing text-zinc-400 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <GripVertical size={16} />
                    </div>

                    <motion.button 
                      whileTap={{ scale: 0.8 }}
                      onClick={() => handleToggleStatus(item)}
                      className="mt-1 w-5 h-5 rounded-full border-[1.5px] border-zinc-400 dark:border-zinc-600 flex items-center justify-center text-transparent hover:border-[var(--list-accent)] hover:text-[var(--list-accent)] transition-colors shrink-0"
                    >
                      <span className="sr-only">Mark as done</span>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.button>
                    
                    <div className="flex-1 min-w-0">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(item.id, item.title)}
                          onKeyDown={(e) => handleEditKeyDown(e, item.id, item.title)}
                          className="w-full bg-transparent text-lg text-zinc-900 dark:text-zinc-200 outline-none border-b border-[var(--list-accent)] rounded-none px-0 py-0.5 leading-tight focus:ring-0"
                        />
                      ) : (
                        <p 
                          onClick={() => startEditing(item)}
                          className="text-lg text-zinc-900 dark:text-zinc-200 leading-tight cursor-text select-none hover:text-black dark:hover:text-white transition-colors relative inline-block py-0.5"
                        >
                          {/* Priority Color Dot */}
                          {item.priority > 0 && (
                            <span className={`inline-block w-2 h-2 rounded-full mr-2.5 mb-0.5 ${PRIORITY_COLORS[item.priority]}`} />
                          )}
                          {item.title}
                        </p>
                      )}
                      {item.notes && !editingId && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{item.notes}</p>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedTask(item)}
                      className="mt-1 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200 transition-all shrink-0"
                      aria-label="Open task details"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          )}

          <motion.form layout ref={formRef} action={handleAdd} className="relative flex items-center group mt-2 -mx-3">
            <input type="hidden" name="listId" value={listId} />
            <Plus className="absolute left-4 text-zinc-400 dark:text-zinc-600 group-focus-within:text-[var(--list-accent)] transition-colors" size={18} />
            <input
              type="text"
              name="title"
              placeholder="Add a new task..."
              autoComplete="off"
              className="w-full bg-transparent border-b border-transparent py-3 pl-12 pr-4 outline-none focus:border-[var(--list-accent)]/30 focus:bg-black/5 dark:focus:bg-white/[0.02] rounded-lg transition-all placeholder:text-zinc-500 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-200 text-lg"
            />
            <button type="submit" className="hidden" />
          </motion.form>
        </div>

        {/* COMPLETED ITEMS SECTION */}
        {completedItems.length > 0 && (
          <motion.div layout className="pt-8 mt-12 border-t border-black/10 dark:border-white/[0.05]">
            <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-600 uppercase tracking-widest mb-4 pl-1">
              Completed ({completedItems.length})
            </h3>
            <ul className="flex flex-col">
              <AnimatePresence mode="popLayout">
                {completedItems.map(item => (
                  <motion.li 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group flex items-start gap-4 p-3 -mx-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <motion.button 
                      whileTap={{ scale: 0.8 }}
                      onClick={() => handleToggleStatus(item)}
                      className="mt-1 w-5 h-5 rounded-full border-2 border-[var(--list-accent)] bg-[var(--list-accent)] flex items-center justify-center text-white dark:text-zinc-900 shrink-0 hover:opacity-80 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <motion.path 
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                    </motion.button>
                    <div className="relative flex-1">
                      <p className="text-lg text-zinc-500 dark:text-zinc-600 leading-tight relative inline-block py-0.5">
                        {item.title}
                        <motion.span 
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                          className="absolute left-0 top-1/2 h-[1.5px] bg-zinc-400 dark:bg-zinc-600 -translate-y-1/2"
                        />
                      </p>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        )}
      </div>

      <TaskDrawer 
        item={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        listId={listId}
        onUpdateOptimistic={handleUpdateOptimistic}
      />
    </>
  )
}