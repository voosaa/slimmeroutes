import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/auth-context'
import { RouteProvider } from '@/contexts/route-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SlimmeRoutes - Smart Route Planner for Businesses',
  description: 'Optimize your customer visits with our intelligent route planning tool',
  applicationName: 'SlimmeRoutes',
  authors: [{ name: 'SlimmeRoutes Team' }],
  keywords: ['route planning', 'business routes', 'delivery optimization', 'field service'],
  icons: {
    icon: '/favicon.ico',
    apple: '/images/logo/slimmeroutes-icon.png',
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#10b981' // Emerald color for theme
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <AuthProvider>
          <RouteProvider>
            {children}
            <Toaster />
          </RouteProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
