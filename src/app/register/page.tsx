'use client'

import { useActionState } from 'react'
import { Sparkles } from "lucide-react"
import Link from 'next/link'
import { registerUser } from '@/app/actions/auth'

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, null)

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0a0a0a] px-4 transition-colors duration-300">
      <div className="w-full max-w-md p-8 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-black/[0.08] dark:border-white/[0.05] shadow-2xl">
        <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-zinc-900 dark:text-zinc-100">
          <Sparkles size={28} />
        </div>
        
        <h1 className="text-2xl font-medium text-zinc-900 dark:text-zinc-100 mb-2 text-center">
          Create an account
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-center">
          Start organizing your collections today.
        </p>

        <form action={formAction} className="space-y-4 mb-6">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border-none outline-none text-zinc-900 dark:text-white placeholder-zinc-500 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all"
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              required
              className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border-none outline-none text-zinc-900 dark:text-white placeholder-zinc-500 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border-none outline-none text-zinc-900 dark:text-white placeholder-zinc-500 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all"
            />
          </div>

          {state?.error && <p className="text-rose-500 text-sm">{state.error}</p>}

          <button 
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Already have an account? <Link href="/login" className="text-zinc-900 dark:text-white font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  )
}