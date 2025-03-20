import { Metadata } from 'next'
import { Sidebar } from '@/components/dashboard/sidebar'

export const metadata: Metadata = {
  title: 'Dashboard - DriveWise',
  description: 'Plan and optimize your routes with DriveWise',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
