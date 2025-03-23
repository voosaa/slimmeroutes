"use client"

import React, { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { AddressImporter } from '@/components/file-upload/address-importer'
import { AddressList } from '@/components/dashboard/address-list'
import { RouteOptimizer } from '@/components/dashboard/route-optimizer'
import { useAuth } from '@/contexts/auth-context'
import { Address, getAddresses } from '@/lib/supabase'
import { PlusCircle, FileUp, Route, MapPin, Users } from 'lucide-react'
import Link from 'next/link'

export default function RoutesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('addresses')
  
  // Check URL for tab parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && ['addresses', 'import', 'routes'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  useEffect(() => {
    loadAddresses()
  }, [user])

  const loadAddresses = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const { data, error } = await getAddresses()
      
      if (error) {
        throw error
      }
      
      setAddresses(data || [])
    } catch (error) {
      console.error('Error loading addresses:', error)
      toast({
        title: 'Error',
        description: 'Failed to load addresses. Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportComplete = (importedAddresses: any[]) => {
    // Reload addresses after import
    loadAddresses()
    
    toast({
      title: 'Import Complete',
      description: `Successfully imported ${importedAddresses.length} addresses.`,
    })
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Routes</h1>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline">
                <Route className="mr-2 h-4 w-4" />
                Route Generator
              </Button>
            </Link>
            <Link href="/dashboard/drivers">
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Multi-Driver Routes
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="addresses">
              <MapPin className="mr-2 h-4 w-4" />
              My Addresses
            </TabsTrigger>
            <TabsTrigger value="import">
              <FileUp className="mr-2 h-4 w-4" />
              Import Addresses
            </TabsTrigger>
            <TabsTrigger value="routes">
              <Route className="mr-2 h-4 w-4" />
              Saved Routes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="addresses" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Addresses</CardTitle>
                <CardDescription>
                  Manage your saved addresses that can be used for route planning.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddressList 
                  addresses={addresses} 
                  isLoading={isLoading} 
                  onAddressesChange={loadAddresses}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="import" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Import Addresses</CardTitle>
                <CardDescription>
                  Import addresses from a CSV or Excel file to quickly add multiple locations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddressImporter onImportComplete={handleImportComplete} />
                
                <div className="mt-6 p-4 bg-muted rounded-md">
                  <h3 className="font-medium mb-2">File Format Guidelines</h3>
                  <p className="text-sm mb-2">
                    Your CSV or Excel file should contain at least one column with addresses. The importer will try to detect columns with the following headers:
                  </p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li><strong>Address:</strong> address, Address, ADDRESS, location, Location, street, etc.</li>
                    <li><strong>Notes:</strong> notes, Notes, NOTES, description, Description, etc.</li>
                  </ul>
                  <p className="text-sm mt-2">
                    If no matching headers are found, the first column will be used as the address.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="routes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Saved Routes</CardTitle>
                <CardDescription>
                  View and manage your saved routes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    This feature will be available soon. For now, you can create and optimize routes from the dashboard.
                  </p>
                  <Link href="/dashboard">
                    <Button>
                      <Route className="mr-2 h-4 w-4" />
                      Go to Route Generator
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
