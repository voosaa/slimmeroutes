"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { SupabaseSetupGuide } from '@/components/setup/supabase-setup-guide'

export default function Home() {
  const { isSupabaseAvailable } = useAuth()

  // If Supabase is not properly configured, show the setup guide
  if (!isSupabaseAvailable) {
    return <SupabaseSetupGuide />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-200 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="font-bold text-xl text-primary-500">DriveWise</div>
          <div className="space-x-4">
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 bg-neutral-50">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-6 text-neutral-900">
              Optimize Your Business Routes with DriveWise
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-10">
              Save time and fuel by planning the most efficient routes for your customer visits.
              Perfect for field service teams, delivery drivers, and sales representatives.
            </p>
            <Button size="lg" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-10 text-center text-neutral-900">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
                <div className="bg-primary-100 text-primary-500 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">1</div>
                <h3 className="text-lg font-medium mb-2">Enter Addresses</h3>
                <p className="text-neutral-600">
                  Input all the customer addresses you need to visit. You can add them manually or upload a CSV file.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
                <div className="bg-primary-100 text-primary-500 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">2</div>
                <h3 className="text-lg font-medium mb-2">Generate Route</h3>
                <p className="text-neutral-600">
                  Our algorithm calculates the most efficient route to visit all your customers, saving you time and fuel.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
                <div className="bg-primary-100 text-primary-500 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">3</div>
                <h3 className="text-lg font-medium mb-2">Start Driving</h3>
                <p className="text-neutral-600">
                  View your optimized schedule with turn-by-turn directions and estimated travel times.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-neutral-800 text-neutral-300 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="font-bold text-xl text-white mb-2">DriveWise</div>
              <p className="text-sm"> {new Date().getFullYear()} DriveWise. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
              <Link href="/login" className="hover:text-white">Login</Link>
              <Link href="/register" className="hover:text-white">Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
