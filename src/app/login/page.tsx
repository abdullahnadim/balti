'use client'

import { useActionState } from 'react'
import { Sparkles } from "lucide-react"
import Link from 'next/link'
import { loginUser } from '@/app/actions/auth'
import { signIn } from 'next-auth/react' // Client-side sign in for Google

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, null)

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#0a0a0a] px-4 transition-colors duration-300">
      <div className="w-full max-w-md p-8 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-black/[0.08] dark:border-white/[0.05] shadow-2xl">
        <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-zinc-900 dark:text-zinc-100">
          <Sparkles size={28} />
        </div>
        
        <h1 className="text-2xl font-medium text-zinc-900 dark:text-zinc-100 mb-2 text-center">
          Welcome back
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-center">
          Sign in to your BALTI account.
        </p>

        <form action={formAction} className="space-y-4 mb-6">
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
              placeholder="Password"
              required
              className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border-none outline-none text-zinc-900 dark:text-white placeholder-zinc-500 focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all"
            />
          </div>

          {state?.error && <p className="text-rose-500 text-sm">{state.error}</p>}

          <button 
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/10 dark:border-white/10"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-[#111] text-zinc-500">Or continue with</span></div>
        </div>

        <button 
          onClick={() => signIn('google', { callbackUrl: '/' })}
          type="button"
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-900 dark:text-white rounded-xl font-medium transition-all active:scale-95 mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>

        <p className="text-center text-sm text-zinc-500">
          Don't have an account? <Link href="/register" className="text-zinc-900 dark:text-white font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </main>
  )
}