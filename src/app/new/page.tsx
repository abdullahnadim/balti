'use client'

import { useState, useActionState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Plus } from 'lucide-react'
import { createList } from '@/app/actions/lists'

const ICONS = ['📝', '🚀', '🛒', '💡', '✈️', '📚', '🎯', '🎨', '🎬', '🍔', '🌿', '🎧']
const COLOR_PRESETS = ['#18181b', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b']
const initialState = { error: '' }

export default function NewList() {
  const [state, formAction, isPending] = useActionState(createList, initialState)
  
  // State for real-time live preview
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🚀')
  const [color, setColor] = useState('#3b82f6')

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-200 px-6 md:px-12 pt-24 pb-32 transition-colors duration-300">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 lg:gap-24">
        
        {/* LEFT COLUMN: THE FORM */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors mb-12"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to collections
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-12">
            Craft a new collection.
          </h1>

          <form action={formAction} className="space-y-12">
            {/* Hidden inputs to pass state to formData */}
            <input type="hidden" name="icon" value={icon} />
            <input type="hidden" name="accentColor" value={color} />

            <div className="space-y-8">
              <div>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name your collection..."
                  required
                  autoFocus
                  autoComplete="off"
                  className="w-full text-3xl md:text-4xl font-medium bg-transparent border-b-2 border-black/5 dark:border-white/5 outline-none placeholder-zinc-400 dark:placeholder-zinc-700 py-3 focus:border-black/20 dark:focus:border-white/20 transition-colors"
                />
                {state.error && (
                  <p className="text-rose-500 text-sm mt-3">{state.error}</p>
                )}
              </div>
              
              <div>
                <input
                  type="text"
                  name="description"
                  placeholder="What is this collection for? (Optional)"
                  autoComplete="off"
                  className="w-full text-lg text-zinc-600 dark:text-zinc-400 bg-transparent border-b-2 border-transparent outline-none placeholder-zinc-400 dark:placeholder-zinc-700 py-2 focus:border-black/10 dark:focus:border-white/10 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Select an Icon</label>
              <div className="flex flex-wrap gap-3">
                {ICONS.map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={`w-12 h-12 text-2xl flex items-center justify-center rounded-2xl transition-all duration-300 ${
                      icon === i 
                        ? 'bg-white dark:bg-white/[0.08] shadow-sm scale-110' 
                        : 'bg-black/5 dark:bg-white/[0.02] hover:bg-black/10 dark:hover:bg-white/[0.05] opacity-60 hover:opacity-100'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Accent Color</label>
              <div className="flex flex-wrap gap-4 items-center">
                {/* Presets */}
                {COLOR_PRESETS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="relative flex items-center justify-center w-10 h-10 rounded-full transition-transform hover:scale-110 shadow-sm"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && (
                      <motion.span 
                        layoutId="color-ring"
                        className="absolute inset-[-4px] border-2 rounded-full border-black/30 dark:border-white/30" 
                      />
                    )}
                  </button>
                ))}
                
                {/* Custom Color Picker (Rainbow Button) */}
                <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm hover:scale-110 transition-transform flex items-center justify-center">
                  <div className="absolute inset-0 bg-[conic-gradient(from_0deg,red,yellow,lime,aqua,blue,magenta,red)] opacity-80" />
                  <div className="absolute inset-0.5 bg-zinc-50 dark:bg-[#0a0a0a] rounded-full flex items-center justify-center">
                    <Plus size={16} className="text-zinc-500" />
                  </div>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-[-20px] w-20 h-20 opacity-0 cursor-pointer"
                    title="Choose a custom color"
                  />
                  {/* Show selection ring if custom color is active (not a preset) */}
                  {!COLOR_PRESETS.includes(color) && (
                     <motion.span 
                       layoutId="color-ring"
                       className="absolute inset-[-4px] border-2 rounded-full border-black/30 dark:border-white/30 pointer-events-none" 
                     />
                  )}
                </div>
              </div>
            </div>

            <div className="pt-8">
              <motion.button 
                type="submit"
                disabled={isPending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-3 w-full md:w-auto px-10 py-4 text-white rounded-2xl font-medium transition-all disabled:opacity-50"
                style={{ 
                  backgroundColor: color, 
                  boxShadow: `0 12px 30px -10px ${color}80` // Dynamic colored glowing shadow
                }}
              >
                <Sparkles size={20} />
                {isPending ? 'Crafting...' : 'Create Collection'}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* RIGHT COLUMN: LIVE PREVIEW */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="hidden lg:block pt-32"
        >
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-6 ml-2">Live Preview</p>
          
          <div 
            className="group block p-8 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-black/[0.08] dark:border-white/[0.05] shadow-2xl transition-all duration-300"
            style={{ '--list-accent': color } as React.CSSProperties}
          >
            <div className="flex justify-between items-start mb-12">
              <motion.span 
                key={icon}
                initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="text-4xl bg-zinc-100 dark:bg-white/[0.03] w-20 h-20 flex items-center justify-center rounded-2xl border border-black/[0.05] dark:border-white/[0.05]"
              >
                {icon}
              </motion.span>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-500 px-4 py-1.5 bg-zinc-100 dark:bg-white/[0.03] rounded-full border border-black/[0.05] dark:border-white/[0.02]">
                0 items
              </span>
            </div>
            <h3 className="text-2xl font-medium mb-2 text-zinc-900 dark:text-zinc-100 truncate">
              {name || 'Untitled Collection'}
            </h3>
            <div className="h-1.5 w-16 rounded-full mt-6 transition-colors duration-300" style={{ backgroundColor: color }} />
          </div>
        </motion.div>

      </div>
    </main>
  )
}