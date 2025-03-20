"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Address, Route, getAddresses, addAddress, deleteAddress, createRoute, getRoutes } from '@/lib/supabase'
import { geocodeAddress, optimizeRoute } from '@/lib/route-optimizer'
import { useToast } from '@/components/ui/use-toast'

type RouteContextType = {
  addresses: Address[]
  routes: Route[]
  isLoading: boolean
  addNewAddress: (address: string, notes?: string) => Promise<void>
  removeAddress: (id: string) => Promise<void>
  clearAddresses: () => void
  generateRoute: (name: string) => Promise<Route | null>
  isGeneratingRoute: boolean
}

const RouteContext = createContext<RouteContextType | undefined>(undefined)

export function RouteProvider({ children }: { children: React.ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load addresses and routes when the component mounts
    async function loadData() {
      try {
        setIsLoading(true)
        const { data: addressData, error: addressError } = await getAddresses()
        
        if (addressError) {
          throw new Error(addressError.message)
        }
        
        setAddresses(addressData || [])
        
        const { data: routeData, error: routeError } = await getRoutes()
        
        if (routeError) {
          throw new Error(routeError.message)
        }
        
        setRoutes(routeData || [])
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load your data. Please try again.',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [toast])

  const addNewAddress = async (address: string, notes?: string) => {
    try {
      // First, geocode the address to get lat/lng
      const geocodeResult = await geocodeAddress(address)
      
      if (!geocodeResult.success) {
        throw new Error(geocodeResult.error || 'Failed to geocode address')
      }
      
      // Then, add the address to the database
      const { data, error } = await addAddress(
        address,
        geocodeResult.lat ?? 0,
        geocodeResult.lng ?? 0,
        notes
      )
      
      if (error) {
        throw new Error(error.message)
      }
      
      // Update the local state
      if (data && data.length > 0) {
        setAddresses(prev => [...prev, data[0]])
        toast({
          title: 'Address added',
          description: 'The address has been added successfully.'
        })
      }
    } catch (error) {
      console.error('Error adding address:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add address',
        variant: 'destructive'
      })
    }
  }

  const removeAddress = async (id: string) => {
    try {
      const { error } = await deleteAddress(id)
      
      if (error) {
        throw new Error(error.message)
      }
      
      // Update the local state
      setAddresses(prev => prev.filter(address => address.id !== id))
      toast({
        title: 'Address removed',
        description: 'The address has been removed successfully.'
      })
    } catch (error) {
      console.error('Error removing address:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove address',
        variant: 'destructive'
      })
    }
  }

  const clearAddresses = () => {
    setAddresses([])
  }

  const generateRoute = async (name: string) => {
    try {
      setIsGeneratingRoute(true)
      
      if (addresses.length < 2) {
        throw new Error('You need at least 2 addresses to generate a route')
      }
      
      // Optimize the route
      const { optimizedOrder, totalDistance, totalDuration } = await optimizeRoute(addresses)
      
      // Create the route in the database
      const { data, error } = await createRoute(
        name,
        addresses,
        optimizedOrder,
        totalDistance,
        totalDuration
      )
      
      if (error) {
        throw new Error(error.message)
      }
      
      // Update the local state
      if (data && data.length > 0) {
        const newRoute = data[0]
        setRoutes(prev => [newRoute, ...prev])
        toast({
          title: 'Route generated',
          description: 'Your optimal route has been generated successfully.'
        })
        return newRoute
      }
      
      return null
    } catch (error) {
      console.error('Error generating route:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate route',
        variant: 'destructive'
      })
      return null
    } finally {
      setIsGeneratingRoute(false)
    }
  }

  const value = {
    addresses,
    routes,
    isLoading,
    addNewAddress,
    removeAddress,
    clearAddresses,
    generateRoute,
    isGeneratingRoute
  }

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>
}

export function useRoute() {
  const context = useContext(RouteContext)
  
  if (context === undefined) {
    throw new Error('useRoute must be used within a RouteProvider')
  }
  
  return context
}
