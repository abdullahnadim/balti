import { db } from '@/lib/db'
import ThemeToggle from '@/components/ThemeToggle'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ListItemsUI from '@/components/ListItemsUI'
import ListSettings from '@/components/ListSettings'

export default async function ListDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const list = await db.list.findUnique({
    where: { id },
    include: {
      items: { orderBy: { position: 'asc' } }
    }
  })

  if (!list) notFound()

  return (
    <main 
      className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-200 px-4 md:px-8 pt-16 md:pt-24 pb-12 transition-colors duration-300"
      style={{ '--list-accent': list.accentColor || '#111' } as React.CSSProperties}
    >
      <header className="max-w-2xl mx-auto mb-10">
        <div className="flex justify-between items-center mb-10">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors no-select"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to collections
          </Link>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <ListSettings list={list} />
          </div>
        </div>
        
        <div className="flex flex-col gap-4 mb-2">
          <span className="text-4xl bg-black/[0.03] dark:bg-white/[0.03] w-16 h-16 flex items-center justify-center rounded-2xl border border-black/[0.08] dark:border-white/[0.05] shadow-sm transition-colors">
            {list.icon}
          </span>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mt-2 transition-colors">
            {list.name}
          </h1>
        </div>
        
        {list.description && (
          <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 mt-2 transition-colors">
            {list.description}
          </p>
        )}
      </header>

      <section className="max-w-2xl mx-auto">
        <ListItemsUI initialItems={list.items} listId={list.id} />
      </section>
    </main>
  )
}