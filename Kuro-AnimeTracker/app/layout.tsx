import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth'
import { TrackerProvider } from '@/lib/trackerContext'
import { ThemeProvider } from '@/lib/themeContext'
import { NotificationProvider } from '@/lib/notificationContext'
import NextAuthProvider from '@/lib/nextAuthProvider'

export const metadata: Metadata = {
  title: 'Kuro — Anime Log & Archival Watchlist',
  description: 'Track your anime in a clean, minimalist interface.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <NextAuthProvider>
          <ThemeProvider>
            <AuthProvider>
              <NotificationProvider>
                <TrackerProvider>{children}</TrackerProvider>
              </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
