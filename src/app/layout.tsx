import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/auth-context'
import { RouteProvider } from '@/contexts/route-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DriveWise - Smart Route Planner for Businesses',
  description: 'Optimize your customer visits with our intelligent route planning tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
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
