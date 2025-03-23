"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Address } from '@/lib/supabase'
import { MapPin, Trash2, X, Info, Clock } from 'lucide-react'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type AddressListProps = {
  addresses: Address[]
  onDeleteAddress: (id: string) => void
  onUpdateAddress?: (id: string, updates: Partial<Address>) => void
  onDeleteAllAddresses?: () => void
}

export function AddressList({ addresses, onDeleteAddress, onUpdateAddress, onDeleteAllAddresses }: AddressListProps) {
  const [timeSpent, setTimeSpent] = useState<{[key: string]: string}>({})
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleTimeChange = (id: string, value: string) => {
    setTimeSpent(prev => ({ ...prev, [id]: value }))
  }
  
  const handleTimeConfirm = (id: string) => {
    if (onUpdateAddress && timeSpent[id] !== undefined) {
      const minutes = parseInt(timeSpent[id]) || 0
      onUpdateAddress(id, { time_spent: minutes })
      // Close the popover
      setOpenPopoverId(null)
    }
  }

  return (
    <div>
      {addresses.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <MapPin className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No addresses added yet.</p>
          <p className="text-sm text-gray-500 mt-1">Add addresses to generate a route.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{addresses.length} address{addresses.length !== 1 ? 'es' : ''}</p>
            {onDeleteAllAddresses && (
              showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600">Are you sure?</span>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => {
                      onDeleteAllAddresses();
                      setShowDeleteConfirm(false);
                    }}
                  >
                    Yes, delete all
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete All
                </Button>
              )
            )}
          </div>
          <ul className="divide-y divide-gray-100">
            {addresses.map((address) => (
              <li key={address.id} className="py-3 group hover:bg-gray-50 rounded-md transition-colors">
                <div className="flex items-start justify-between px-2">
                  <div className="flex">
                    <div className="mr-3 mt-1">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                        <MapPin className="h-3 w-3 text-emerald-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{address.address}</p>
                      {address.notes && (
                        <div className="flex items-center mt-1">
                          <Info className="h-3 w-3 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500">{address.notes}</p>
                        </div>
                      )}
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-400 font-mono">
                          {address.lat.toFixed(4)}, {address.lng.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-3 w-3 text-gray-400 mr-1" />
                        <Popover open={openPopoverId === address.id} onOpenChange={(open) => {
                          if (open) {
                            setOpenPopoverId(address.id)
                          } else {
                            setOpenPopoverId(null)
                          }
                        }}>
                          <PopoverTrigger asChild>
                            <Button variant="link" className="h-auto p-0 text-xs text-gray-500 hover:text-emerald-600">
                              {address.time_spent ? `${address.time_spent} minutes` : "Set time spent"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56 p-3">
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium">Time spent at address</h4>
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="15"
                                  value={timeSpent[address.id] || address.time_spent?.toString() || ''}
                                  onChange={(e) => handleTimeChange(address.id, e.target.value)}
                                  className="w-20"
                                />
                                <span className="text-sm text-gray-500">minutes</span>
                              </div>
                              <div className="flex justify-end">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleTimeConfirm(address.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  Confirm
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onDeleteAddress(address.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      
      <div className="mt-4 flex justify-between items-center text-sm border-t border-gray-100 pt-3">
        <span className="text-gray-500 font-medium">{addresses.length} addresses</span>
        {addresses.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all addresses?')) {
                // Clear all addresses by calling onDeleteAddress for each address
                addresses.forEach(addr => onDeleteAddress(addr.id))
              }
            }}
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>
    </div>
  )
}
