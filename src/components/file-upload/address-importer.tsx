"use client"

import React, { useState } from 'react'
import { FileUpload } from './file-upload'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { addAddress } from '@/lib/supabase'
import { geocodeAddress } from '@/lib/geocoding'

interface AddressImporterProps {
  onImportComplete?: (addresses: any[]) => void
}

interface AddressData {
  address: string
  notes?: string
  lat?: number
  lng?: number
  status?: 'pending' | 'success' | 'error'
  error?: string
}

export function AddressImporter({ onImportComplete }: AddressImporterProps) {
  const [addresses, setAddresses] = useState<AddressData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)
  const { toast } = useToast()

  const handleDataImported = (data: any[]) => {
    // Process the imported data to extract addresses
    const extractedAddresses = data.map(row => {
      // Try to find address field with various possible names
      const addressField = 
        row.address || row.Address || row.ADDRESS || 
        row.location || row.Location || row.LOCATION ||
        row.street || row.Street || row.STREET ||
        row.addressLine || row.AddressLine || row.address_line ||
        Object.values(row)[0]; // Fallback to first column if no match

      // Try to find notes field with various possible names
      const notesField = 
        row.notes || row.Notes || row.NOTES ||
        row.description || row.Description || row.DESCRIPTION ||
        row.comment || row.Comment || row.COMMENT ||
        row.remarks || row.Remarks || row.REMARKS;

      return {
        address: addressField,
        notes: notesField,
        status: 'pending'
      } as AddressData;
    }).filter(a => a.address && typeof a.address === 'string' && a.address.trim() !== '');

    setAddresses(extractedAddresses);
  }

  const processAddresses = async () => {
    if (addresses.length === 0) return;
    
    setIsProcessing(true);
    setProcessedCount(0);
    
    const updatedAddresses = [...addresses];
    const successfulAddresses = [];
    
    for (let i = 0; i < updatedAddresses.length; i++) {
      try {
        // Geocode the address
        const geocodeResult = await geocodeAddress(updatedAddresses[i].address);
        
        if (!geocodeResult || !geocodeResult.lat || !geocodeResult.lng) {
          throw new Error('Could not geocode address');
        }
        
        // Add to database
        const { data, error } = await addAddress(
          updatedAddresses[i].address,
          geocodeResult.lat,
          geocodeResult.lng,
          updatedAddresses[i].notes
        );
        
        if (error) throw error;
        
        // Update status
        updatedAddresses[i] = {
          ...updatedAddresses[i],
          lat: geocodeResult.lat,
          lng: geocodeResult.lng,
          status: 'success'
        };
        
        successfulAddresses.push(data);
      } catch (error) {
        updatedAddresses[i] = {
          ...updatedAddresses[i],
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
      
      setProcessedCount(i + 1);
      setAddresses([...updatedAddresses]);
      
      // Add a small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsProcessing(false);
    
    // Notify about completion
    const successCount = updatedAddresses.filter(a => a.status === 'success').length;
    const errorCount = updatedAddresses.filter(a => a.status === 'error').length;
    
    toast({
      title: 'Import completed',
      description: `Successfully imported ${successCount} addresses. ${errorCount} addresses failed.`,
      variant: successCount > 0 ? 'default' : 'destructive'
    });
    
    if (onImportComplete && successfulAddresses.length > 0) {
      onImportComplete(successfulAddresses);
    }
  }

  return (
    <div className="space-y-6">
      <FileUpload 
        onDataImported={handleDataImported} 
        title="Import Addresses"
        description="Upload a CSV or Excel file containing addresses to import"
      />
      
      {addresses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Addresses to Import ({addresses.length})</h3>
            <Button 
              onClick={processAddresses} 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing ({processedCount}/{addresses.length})
                </>
              ) : 'Import Addresses'}
            </Button>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Address</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {addresses.map((address, index) => (
                  <TableRow key={index}>
                    <TableCell>{address.address}</TableCell>
                    <TableCell>{address.notes || '-'}</TableCell>
                    <TableCell>
                      {address.status === 'pending' && 'Pending'}
                      {address.status === 'success' && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Success
                        </div>
                      )}
                      {address.status === 'error' && (
                        <div className="flex items-center text-red-600">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {address.error || 'Error'}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {isProcessing && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>Processing addresses</AlertTitle>
              <AlertDescription>
                Please wait while we process your addresses. This may take a few minutes.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}
