"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { LogOut, User, Map, Clock, CreditCard, Settings, Home, BarChart2 } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  
  const handleSignOut = async () => {
    await signOut()
  }
  
  // Get user initials for avatar
  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    }
    
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    
    return 'U'
  }

  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-gray-100 min-h-screen shadow-sm">
      <div className="p-6">
        <Link href="/" className="text-xl font-bold text-emerald-600 flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-6 h-6 mr-2"
          >
            <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h8.25c1.035 0 1.875-.84 1.875-1.875V15z" />
            <path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3 3 0 005.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 00-3.732-10.104 1.837 1.837 0 00-1.47-.725H15.75z" />
            <path d="M19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
          </svg>
          DriveWise
        </Link>
      </div>
      
      <nav className="mt-6 px-3">
        <div className="mb-4 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Main
        </div>
        <Link 
          href="/dashboard" 
          className={`flex items-center px-3 py-2 rounded-md mb-1 text-sm ${
            pathname === '/dashboard' 
              ? 'bg-emerald-50 text-emerald-700 font-medium' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Home className={`w-5 h-5 mr-3 ${pathname === '/dashboard' ? 'text-emerald-600' : 'text-gray-500'}`} />
          Route Planner
        </Link>
        <Link 
          href="/dashboard/history" 
          className={`flex items-center px-3 py-2 rounded-md mb-1 text-sm ${
            pathname === '/dashboard/history' 
              ? 'bg-emerald-50 text-emerald-700 font-medium' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Clock className={`w-5 h-5 mr-3 ${pathname === '/dashboard/history' ? 'text-emerald-600' : 'text-gray-500'}`} />
          History
        </Link>
        <Link 
          href="/dashboard/analytics" 
          className={`flex items-center px-3 py-2 rounded-md mb-1 text-sm ${
            pathname === '/dashboard/analytics' 
              ? 'bg-emerald-50 text-emerald-700 font-medium' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <BarChart2 className={`w-5 h-5 mr-3 ${pathname === '/dashboard/analytics' ? 'text-emerald-600' : 'text-gray-500'}`} />
          Analytics
        </Link>
        
        <div className="mt-8 mb-4 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Settings
        </div>
        <Link 
          href="/profile" 
          className={`flex items-center px-3 py-2 rounded-md mb-1 text-sm ${
            pathname === '/profile' 
              ? 'bg-emerald-50 text-emerald-700 font-medium' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <User className={`w-5 h-5 mr-3 ${pathname === '/profile' ? 'text-emerald-600' : 'text-gray-500'}`} />
          Profile
        </Link>
        <Link 
          href="/dashboard/settings" 
          className={`flex items-center px-3 py-2 rounded-md mb-1 text-sm ${
            pathname === '/dashboard/settings' 
              ? 'bg-emerald-50 text-emerald-700 font-medium' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Settings className={`w-5 h-5 mr-3 ${pathname === '/dashboard/settings' ? 'text-emerald-600' : 'text-gray-500'}`} />
          Settings
        </Link>
        <Link 
          href="/dashboard/account" 
          className={`flex items-center px-3 py-2 rounded-md mb-1 text-sm ${
            pathname === '/dashboard/account' 
              ? 'bg-emerald-50 text-emerald-700 font-medium' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Settings className={`w-5 h-5 mr-3 ${pathname === '/dashboard/account' ? 'text-emerald-600' : 'text-gray-500'}`} />
          Account
        </Link>
        <Link 
          href="/dashboard/billing" 
          className={`flex items-center px-3 py-2 rounded-md mb-1 text-sm ${
            pathname === '/dashboard/billing' 
              ? 'bg-emerald-50 text-emerald-700 font-medium' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <CreditCard className={`w-5 h-5 mr-3 ${pathname === '/dashboard/billing' ? 'text-emerald-600' : 'text-gray-500'}`} />
          Billing
        </Link>
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 font-medium">
              {getInitials()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[120px]">{user?.email || ''}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="text-gray-500 hover:text-red-500 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
