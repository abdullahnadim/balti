'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, Edit2, Trash2, X } from 'lucide-react'
import { deleteList, updateList } from '@/app/actions/lists'
import { List } from '@prisma/client'

const ICONS = ['📝', '🚀', '🛒', '💡', '✈️', '📚', '🎯', '🎨', '🎬', '🍔']
const COLORS = [
  { label: 'Zinc', value: '#18181b' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Violet', value: '#8b5cf6' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Amber', value: '#f59e0b' },
]

export default function ListSettings({ list }: { list: List }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()

  // Edit Form State
  const [name, setName] = useState(list.name)
  const [description, setDescription] = useState(list.description || '')
  const [icon, setIcon] = useState(list.icon || '📝')
  const [color, setColor] = useState(list.accentColor || '#18181b')

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this list? This cannot be undone.')) {
      startTransition(() => {
        deleteList(list.id)
      })
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      await updateList(list.id, { name, description, icon, accentColor: color })
      setIsEditModalOpen(false)
    })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/[0.05] text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <MoreHorizontal size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-48 bg-[#111] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden z-40 p-1"
          >
            <button 
              onClick={() => {
                setIsOpen(false)
                setIsEditModalOpen(true)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.05] hover:text-white rounded-lg transition-colors text-left"
            >
              <Edit2 size={16} />
              Edit list
            </button>
            <button 
              onClick={handleDelete}
              disabled={isPending}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors text-left disabled:opacity-50"
            >
              <Trash2 size={16} />
              {isPending ? 'Deleting...' : 'Delete list'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsEditModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#111] border border-white/[0.1] rounded-2xl shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-white">Edit List</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="List name"
                    required
                    className="w-full bg-transparent border-b border-white/[0.1] py-2 text-2xl font-medium text-white outline-none focus:border-[var(--list-accent)] transition-colors"
                  />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description"
                    className="w-full bg-transparent border-b border-white/[0.1] py-2 text-zinc-400 outline-none focus:border-[var(--list-accent)] transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map(i => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setIcon(i)}
                        className={`w-10 h-10 text-xl flex items-center justify-center rounded-lg transition-all ${
                          icon === i ? 'bg-white/[0.1] shadow-inner' : 'hover:bg-white/[0.05] opacity-50 hover:opacity-100'
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Color</label>
                  <div className="flex gap-3">
                    {COLORS.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColor(c.value)}
                        className="w-6 h-6 rounded-full relative transition-transform hover:scale-110"
                        style={{ backgroundColor: c.value }}
                      >
                        {color === c.value && (
                          <span className="absolute inset-[-4px] border-2 border-white/30 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50">
                    {isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}