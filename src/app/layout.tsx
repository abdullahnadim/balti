import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import PWARegistry from '@/components/PWARegistry'

export const metadata: Metadata = {
  title: 'BALTI',
  description: 'Premium distraction-free personal task management.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BALTI',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FCFCFC' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        suppressHydrationWarning 
        className="relative antialiased bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-200 transition-colors duration-300 min-h-screen"
      >
        <ThemeProvider>
          {children}
          
          {/* Subtle Footer Credit */}
          <footer className="absolute bottom-6 w-full text-center text-xs font-medium text-zinc-400 dark:text-zinc-600 pointer-events-none">
            <span className="pointer-events-auto">
              Crafted by{' '}
              <a 
                href="http://abdullahnadim.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
              >
                Mir
              </a>
            </span>
          </footer>

          <PWARegistry />
        </ThemeProvider>
      </body>
    </html>
  )
}