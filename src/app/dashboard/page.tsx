"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { AddressInput } from '@/components/dashboard/address-input'
import { AddressList } from '@/components/dashboard/address-list'
import { ScheduleView } from '@/components/dashboard/schedule-view'
import { CostCalculator } from '@/components/dashboard/cost-calculator'
import { RouteOptimizer } from '@/components/dashboard/route-optimizer'
import { SupabaseSetupGuide } from '@/components/setup/supabase-setup-guide'
import MapComponent from '@/components/map/map-component'
import { Address, supabase, createRoute } from '@/lib/supabase'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { optimizeRoute } from '@/lib/utils'
import { AppShell } from '@/components/layout/app-shell'
import { 
  PlusCircle, 
  MapPin, 
  Route, 
  BarChart3, 
  Clock, 
  DollarSign, 
  Car, 
  Fuel, 
  Wrench 
} from 'lucide-react'

// Sample data for analytics
const weeklyData = [
  { name: 'Mon', distance: 45, time: 60, cost: 25 },
  { name: 'Tue', distance: 35, time: 45, cost: 20 },
  { name: 'Wed', distance: 60, time: 80, cost: 35 },
  { name: 'Thu', distance: 30, time: 40, cost: 18 },
  { name: 'Fri', distance: 55, time: 70, cost: 30 },
  { name: 'Sat', distance: 20, time: 30, cost: 12 },
  { name: 'Sun', distance: 10, time: 15, cost: 8 }
]

const costBreakdownData = [
  { name: 'Fuel', value: 120 },
  { name: 'Time', value: 80 },
  { name: 'Maintenance', value: 50 }
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function DashboardPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [optimizedOrder, setOptimizedOrder] = useState<string[]>([])
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false)
  const [routeStats, setRouteStats] = useState({
    totalDistance: 0,
    totalTime: 0,
    fuelCost: 0,
    timeCost: 0,
    maintenanceCost: 0
  })
  const { user } = useAuth()
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)

  // Use useEffect to handle side effects and state changes
  useEffect(() => {
    // Any initialization code can go here
    console.log("Dashboard page mounted")
    console.log("User:", user)
  }, [user])

  // Check if user is logged in
  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">Authentication Required</span>
                <br />
                Please sign in to access the dashboard.
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Check if Supabase is available
  const isSupabaseAvailable = true // We're already checking for user above

  // If Supabase is not properly configured, show the setup guide
  if (!isSupabaseAvailable) {
    return <SupabaseSetupGuide />
  }

  const handleAddAddress = (address: Address) => {
    setAddresses(prev => [address, ...prev])
  }

  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id))
  }

  const handleUpdateAddress = async (id: string, updates: Partial<Address>) => {
    if (!id) return
    
    try {
      // Update local state
      setAddresses(addresses.map(addr => 
        addr.id === id ? { ...addr, ...updates } : addr
      ))
      
      // Update in Supabase if user is logged in
      if (user) {
        const { data, error } = await supabase
          .from('addresses')
          .update(updates)
          .eq('id', id)
          .eq('user_id', user.id)
        
        if (error) {
          console.error('Error updating address:', error)
          toast({
            title: 'Error',
            description: 'Failed to update address',
            variant: 'destructive'
          })
        } else {
          console.log('Address updated successfully:', id, updates)
        }
      }
    } catch (error) {
      console.error('Error updating address:', error)
      toast({
        title: 'Error',
        description: 'Failed to update address',
        variant: 'destructive'
      })
    }
  }

  // New handler for route optimization
  const handleOptimizeRoute = (optimizedAddresses: Address[]) => {
    // Extract the IDs in optimized order
    const optimizedIds = optimizedAddresses.map(addr => addr.id)
    setOptimizedOrder(optimizedIds)
    
    // Calculate route statistics
    const totalDistance = optimizedAddresses.length > 1 ? 
      calculateTotalDistance(optimizedAddresses) : 0
    
    const totalDuration = totalDistance > 0 ? 
      totalDistance / 50 * 60 : 0 // Estimate based on 50 km/h
    
    calculateRouteStatistics(
      optimizedAddresses,
      totalDistance,
      totalDuration
    )
  }

  const handleGenerateRoute = async () => {
    if (addresses.length < 2) {
      toast({
        title: 'Error',
        description: 'You need at least 2 addresses to generate a route',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsGeneratingRoute(true)
      
      // Use the improved route optimization algorithm
      const optimizationResult = await optimizeRoute(addresses);
      
      // Extract the IDs in optimized order
      const optimizedIds = optimizationResult.orderedAddresses.map(addr => addr.id)
      
      setOptimizedOrder(optimizedIds)
      
      // Calculate route statistics with the improved data
      calculateRouteStatistics(
        optimizationResult.orderedAddresses, 
        optimizationResult.totalDistance,
        optimizationResult.totalDuration
      )
      
      // Save the route to Supabase
      const routeName = `Route ${new Date().toLocaleDateString()}`;
      const { data, error } = await createRoute(
        routeName,
        optimizationResult.orderedAddresses,
        optimizedIds,
        optimizationResult.totalDistance,
        optimizationResult.totalDuration
      );
      
      if (error) {
        console.error('Error saving route:', error);
        toast({
          title: 'Warning',
          description: 'Route generated but could not be saved to history',
          variant: 'destructive'
        });
      } else {
        console.log('Route saved successfully:', data);
        toast({
          title: 'Route generated and saved',
          description: `Optimized route for ${addresses.length} addresses has been saved to your history`,
        });
      }
      
      toast({
        title: 'Route generated',
        description: `Optimized route for ${addresses.length} addresses`
      })
    } catch (error) {
      console.error('Error generating route:', error)
      setError('Failed to generate route')
      toast({
        title: 'Error',
        description: 'Failed to generate route',
        variant: 'destructive'
      })
    } finally {
      setIsGeneratingRoute(false)
    }
  }

  // Helper function to calculate total distance between addresses
  const calculateTotalDistance = (orderedAddresses: Address[]) => {
    let totalDistance = 0
    
    for (let i = 0; i < orderedAddresses.length - 1; i++) {
      const start = orderedAddresses[i]
      const end = orderedAddresses[i + 1]
      
      totalDistance += calculateHaversineDistance(
        start.lat, start.lng,
        end.lat, end.lng
      )
    }
    
    return totalDistance
  }

  // Updated to accept pre-calculated distance and duration
  const calculateRouteStatistics = (
    orderedAddresses: Address[], 
    totalDistance?: number, 
    totalDuration?: number
  ) => {
    // If we have pre-calculated values, use them
    let distance = totalDistance;
    let duration = totalDuration;
    
    // Otherwise calculate using Haversine (fallback)
    if (distance === undefined) {
      distance = 0;
      // Calculate distances between consecutive points
      for (let i = 0; i < orderedAddresses.length - 1; i++) {
        const start = orderedAddresses[i]
        const end = orderedAddresses[i + 1]
        
        // Simple distance calculation using Haversine formula
        const segmentDistance = calculateHaversineDistance(
          start.lat, start.lng,
          end.lat, end.lng
        )
        
        distance += segmentDistance
      }
    }
    
    // Estimate time if not provided (based on average speed of 50 km/h)
    if (duration === undefined) {
      duration = distance / 50 * 60 // minutes
    }
    
    // Calculate costs with more detailed model
    // Fuel cost: Based on fuel consumption of 8L/100km and current fuel price of €1.80/L
    const fuelConsumption = 8; // L/100km
    const fuelPrice = 1.80; // €/L
    const fuelCost = distance * fuelConsumption / 100 * fuelPrice
    
    // Time cost: Based on hourly rate of €30/hour
    const hourlyRate = 30; // €/hour
    const timeCost = duration / 60 * hourlyRate
    
    // Maintenance cost: Based on €0.05/km
    const maintenanceCost = distance * 0.05
    
    setRouteStats({
      totalDistance: distance,
      totalTime: duration,
      fuelCost,
      timeCost,
      maintenanceCost
    })
  }

  // Calculate Haversine distance between two points (in kilometers)
  const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    
    return distance
  }

  return (
    <AppShell>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={handleGenerateRoute}
            disabled={addresses.length < 2 || isGeneratingRoute}
            className="bg-emerald-600 hover:bg-emerald-700 flex items-center"
          >
            <Route className="mr-2 h-4 w-4" />
            {isGeneratingRoute ? 'Generating...' : 'Generate Route'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center border-l-4 border-emerald-500">
          <div className="rounded-full bg-emerald-100 p-3 mr-4">
            <MapPin className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Addresses</p>
            <p className="text-2xl font-bold text-gray-900">{addresses.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center border-l-4 border-blue-500">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <Route className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Distance</p>
            <p className="text-2xl font-bold text-gray-900">{routeStats.totalDistance.toFixed(1)} km</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center border-l-4 border-purple-500">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Estimated Time</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.floor(routeStats.totalTime / 60)}h {Math.round(routeStats.totalTime % 60)}m
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center border-l-4 border-amber-500">
          <div className="rounded-full bg-amber-100 p-3 mr-4">
            <DollarSign className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Cost</p>
            <p className="text-2xl font-bold text-gray-900">
              €{(routeStats.fuelCost + routeStats.timeCost + routeStats.maintenanceCost).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <Tabs defaultValue="route" className="w-full">
          <TabsList className="bg-white rounded-lg shadow mb-6 p-1">
            <TabsTrigger 
              value="route" 
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 rounded-md px-4 py-2"
            >
              Route Planning
            </TabsTrigger>
            <TabsTrigger 
              value="calculator" 
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 rounded-md px-4 py-2"
            >
              Cost Calculator
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 rounded-md px-4 py-2"
            >
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="route">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Add Address</h2>
                    <p className="text-sm text-gray-500">Enter an address to add to your route</p>
                  </div>
                  <div className="p-6">
                    <AddressInput onAddAddress={handleAddAddress} />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">Your Addresses</h2>
                      <p className="text-sm text-gray-500">Manage your list of addresses</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <AddressList 
                      addresses={addresses} 
                      onDeleteAddress={handleDeleteAddress} 
                      onUpdateAddress={handleUpdateAddress}
                    />
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2">
                {addresses.length >= 2 && (
                  <RouteOptimizer 
                    addresses={addresses} 
                    onOptimizeRoute={handleOptimizeRoute} 
                  />
                )}
                
                <div className="bg-white rounded-lg shadow h-full">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Route Map</h2>
                    <p className="text-sm text-gray-500">
                      {optimizedOrder.length > 0 
                        ? `Optimized route with ${addresses.length} stops` 
                        : 'Add addresses to see them on the map'}
                    </p>
                  </div>
                  <div className="p-6">
                    {addresses.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
                        <div className="bg-gray-100 rounded-full p-3 mb-4">
                          <MapPin className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-gray-600 mb-2 text-center">Add addresses to see them on the map.</p>
                        <p className="text-sm text-gray-500 text-center">
                          You'll be able to generate an optimized route once you have at least 2 addresses.
                        </p>
                      </div>
                    ) : (
                      <MapComponent 
                        addresses={addresses} 
                        optimizedOrder={optimizedOrder} 
                      />
                    )}
                    
                    {optimizedOrder.length > 0 && (
                      <div className="mt-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Breakdown</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-blue-50 rounded-lg p-4 flex items-start">
                              <div className="rounded-full bg-blue-100 p-2 mr-3">
                                <Fuel className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Fuel Cost</h4>
                                <p className="text-lg font-bold text-blue-600">€{routeStats.fuelCost.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">Based on current fuel prices</p>
                              </div>
                            </div>
                            
                            <div className="bg-emerald-50 rounded-lg p-4 flex items-start">
                              <div className="rounded-full bg-emerald-100 p-2 mr-3">
                                <Clock className="h-5 w-5 text-emerald-600" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Time Cost</h4>
                                <p className="text-lg font-bold text-emerald-600">€{routeStats.timeCost.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">Based on hourly rate</p>
                              </div>
                            </div>
                            
                            <div className="bg-amber-50 rounded-lg p-4 flex items-start">
                              <div className="rounded-full bg-amber-100 p-2 mr-3">
                                <Wrench className="h-5 w-5 text-amber-600" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Maintenance</h4>
                                <p className="text-lg font-bold text-amber-600">€{routeStats.maintenanceCost.toFixed(2)}</p>
                                <p className="text-xs text-gray-500">Estimated wear and tear</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Optimized Schedule</h3>
                          <ScheduleView 
                            addresses={addresses} 
                            optimizedOrder={optimizedOrder} 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="calculator">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Cost Calculator</h2>
                <p className="text-sm text-gray-500">Calculate and compare costs for different vehicles and scenarios</p>
              </div>
              <div className="p-6">
                <CostCalculator 
                  totalDistance={routeStats.totalDistance} 
                  totalTime={routeStats.totalTime} 
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Weekly Distance</h2>
                  <p className="text-sm text-gray-500">Total distance traveled per day</p>
                </div>
                <div className="p-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="distance" name="Distance (km)" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Cost Breakdown</h2>
                  <p className="text-sm text-gray-500">Distribution of costs by category</p>
                </div>
                <div className="p-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={costBreakdownData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {costBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow lg:col-span-2">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Weekly Metrics</h2>
                  <p className="text-sm text-gray-500">Comparison of distance, time, and cost</p>
                </div>
                <div className="p-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#10b981" />
                        <YAxis yAxisId="right" orientation="right" stroke="#6366f1" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="distance" name="Distance (km)" fill="#10b981" />
                        <Bar yAxisId="left" dataKey="time" name="Time (min)" fill="#6366f1" />
                        <Bar yAxisId="right" dataKey="cost" name="Cost (€)" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
