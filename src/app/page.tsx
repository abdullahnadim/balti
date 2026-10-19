import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import DashboardUI from '@/components/DashboardUI'
import UserButton from '@/components/UserButton'

export default async function Home() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/login')
  }

  const lists = await db.list.findMany({
    where: { 
      isArchived: false,
      userId: session.user.id
    },
    include: { 
      _count: { 
        select: { 
          items: {
            where: { isArchived: false } 
          } 
        } 
      } 
    },
    orderBy: { isPinned: 'desc' }
  })

  return (
    <main className="min-h-screen px-6 md:px-12 pt-24 pb-12 transition-colors duration-300">
      <header className="max-w-4xl mx-auto w-full flex justify-between items-end mb-12">
        <div>
          <h2 className="text-sm font-medium text-zinc-500 tracking-widest mb-2 uppercase">Balti</h2>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
            Your collections.
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-1" />
          <UserButton user={session.user} />
        </div>
      </header>

      <DashboardUI initialLists={lists} />
    </main>
  )
}