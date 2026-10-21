import { WifiOff } from 'lucide-react'
import Link from 'next/link'

export default function OfflineFallback() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 p-6 transition-colors duration-300">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400">
          <WifiOff size="{32}"/>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">
            You're offline
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            BALTI is currently in offline mode. Connect to the internet to sync your latest tasks and collections.
          </p>
        </div>

        <Link className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black font-medium text-sm transition-transform hover:scale-105 active:scale-95 shadow-sm" href="/">
          Return to Dashboard
        </Link>
      </div>
    </main>
  )
}