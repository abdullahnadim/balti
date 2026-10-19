import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BALTI Task Manager',
    short_name: 'BALTI',
    description: 'Premium distraction-free personal task management.',
    start_url: '/',
    display: 'standalone', // 👈 This removes browser tabs/URL bars for a native feel
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}