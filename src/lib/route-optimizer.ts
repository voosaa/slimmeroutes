"use client"

import { Address } from './supabase'

// This is a simplified route optimization algorithm
// In a real application, you would use a more sophisticated algorithm or a third-party API
export async function optimizeRoute(addresses: Address[], startAddress?: Address) {
  // If we have fewer than 2 addresses, no optimization is needed
  if (addresses.length < 2) {
    return {
      optimizedOrder: addresses.map(a => a.id),
      totalDistance: 0,
      totalDuration: 0
    }
  }

  // In a real application, we would use the Google Maps Distance Matrix API or similar
  // to get the actual distances between all addresses
  // For this demo, we'll use a simple nearest neighbor algorithm
  
  // Start with the start address if provided, otherwise use the first address
  const start = startAddress || addresses[0]
  const unvisited = addresses.filter(a => a.id !== start.id)
  const visited = [start]
  const optimizedOrder = [start.id]
  
  let totalDistance = 0
  let totalDuration = 0
  
  // Simple nearest neighbor algorithm
  while (unvisited.length > 0) {
    const current = visited[visited.length - 1]
    
    // Find the nearest unvisited address
    let nearestIndex = 0
    let nearestDistance = calculateDistance(
      current.lat,
      current.lng,
      unvisited[0].lat,
      unvisited[0].lng
    )
    
    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateDistance(
        current.lat,
        current.lng,
        unvisited[i].lat,
        unvisited[i].lng
      )
      
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = i
      }
    }
    
    const nearest = unvisited[nearestIndex]
    visited.push(nearest)
    optimizedOrder.push(nearest.id)
    
    // Remove the visited address from unvisited
    unvisited.splice(nearestIndex, 1)
    
    // Add to total distance
    totalDistance += nearestDistance
    
    // Estimate duration (assuming 50 km/h average speed)
    totalDuration += (nearestDistance / 50) * 60 // minutes
  }
  
  return {
    optimizedOrder,
    totalDistance: Math.round(totalDistance * 10) / 10, // Round to 1 decimal place
    totalDuration: Math.round(totalDuration) // Round to nearest minute
  }
}

// Calculate distance between two points using the Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in km
  return distance
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

// Geocode an address to get lat/lng coordinates
export async function geocodeAddress(address: string) {
  try {
    // In a real application, you would use the Google Maps Geocoding API or similar
    // For this demo, we'll return mock coordinates
    
    // Mock geocoding - in a real app, you would call a geocoding API
    const mockCoordinates = {
      lat: 40.7128 + (Math.random() - 0.5) * 0.1, // Random coordinates near New York
      lng: -74.0060 + (Math.random() - 0.5) * 0.1
    }
    
    return {
      success: true as const,
      lat: mockCoordinates.lat,
      lng: mockCoordinates.lng
    }
  } catch (error) {
    console.error('Error geocoding address:', error)
    return {
      success: false as const,
      error: 'Failed to geocode address'
    }
  }
}
