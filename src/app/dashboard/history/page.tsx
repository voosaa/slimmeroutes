import { Metadata } from 'next'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Route History - DriveWise',
  description: 'View your past routes and schedules',
}

export default function HistoryPage() {
  // Mock data for route history
  const routeHistory = [
    {
      id: '1',
      date: '2023-11-15',
      addressCount: 8,
      totalDistance: '45 km',
      status: 'Completed',
    },
    {
      id: '2',
      date: '2023-11-08',
      addressCount: 12,
      totalDistance: '72 km',
      status: 'Completed',
    },
    {
      id: '3',
      date: '2023-11-01',
      addressCount: 5,
      totalDistance: '28 km',
      status: 'Completed',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Route History</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500 uppercase tracking-wider">Addresses</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500 uppercase tracking-wider">Distance</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {routeHistory.map((route) => (
                  <tr key={route.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">{route.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{route.addressCount} addresses</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{route.totalDistance}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {route.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="outline" size="sm" className="mr-2">View</Button>
                      <Button variant="outline" size="sm" className="text-neutral-500">Print</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <footer className="bg-neutral-100 py-4">
        <div className="container mx-auto px-4 text-center text-neutral-500">
          <p>&copy; {new Date().getFullYear()} DriveWise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
