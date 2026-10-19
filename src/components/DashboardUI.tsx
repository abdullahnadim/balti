'use client'

import { useOptimistic } from 'react'
import Link from 'next/link'
import { List } from '@prisma/client'
import QuickCapture from './QuickCapture'
import { Sparkles, Plus } from 'lucide-react'

type ListWithCount = List & { _count: { items: number } }

export default function DashboardUI({ initialLists }: { initialLists: ListWithCount[] }) {
  const [optimisticLists, addOptimisticItem] = useOptimistic(
    initialLists,
    (state, targetListId: string) =>
      state.map((list) =>
        list.id === targetListId
          ? { ...list, _count: { items: list._count.items + 1 } }
          : list
      )
  )

  return (
    <>
      {optimisticLists.length === 0 ? (
        <div className="max-w-4xl mx-auto mt-4">
          <Link 
            href="/new"
            className="group w-full flex flex-col items-center justify-center p-16 md:p-24 rounded-[2rem] border-2 border-dashed border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 bg-transparent hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-all duration-500 text-center"
          >
            <div className="w-16 h-16 mb-6 rounded-2xl bg-black/5 dark:bg-white/[0.05] flex items-center justify-center text-zinc-500 group-hover:scale-110 group-hover:text-zinc-900 dark:group-hover:text-white transition-all duration-300">
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
              className="group block p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.08] dark:border-white/[0.05] hover:bg-zinc-50 dark:hover:bg-white/[0.04] hover:border-black/[0.15] dark:hover:border-white/[0.1] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 ease-out"
              style={{ '--list-accent': list.accentColor || '#111' } as React.CSSProperties}
            >
              <div className="flex justify-between items-start mb-8">
                <span className="text-2xl bg-zinc-100 dark:bg-white/[0.03] w-12 h-12 flex items-center justify-center rounded-full border border-black/[0.05] dark:border-white/[0.05] group-hover:scale-110 transition-transform duration-300">
                  {list.icon || '📝'}
                </span>
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-500 px-3 py-1 bg-zinc-100 dark:bg-white/[0.03] rounded-full transition-all border border-black/[0.05] dark:border-white/[0.02]">
                  {list._count.items} items
                </span>
              </div>
              <h3 className="text-lg font-medium mb-1 text-zinc-900 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                {list.name}
              </h3>
            </Link>
          ))}

          {/* New List Card in Grid */}
          <Link
            href="/new"
            className="group flex flex-col justify-between p-6 rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all duration-300 min-h-[170px]"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <Plus size={20} />
            </div>
            <div>
              <h3 className="text-base font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                New collection
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Add another bucket
              </p>
            </div>
          </Link>
        </section>
      )}

      {optimisticLists.length > 0 && (
        <QuickCapture lists={optimisticLists} onOptimisticAdd={addOptimisticItem} />
      )}
    </>
  )
}