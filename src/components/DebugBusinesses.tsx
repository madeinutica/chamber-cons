'use client'

import { useEffect, useState } from 'react'
import { Business } from '@/types/business'

export default function DebugBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        console.log('Fetching businesses for debug...')
        const response = await fetch('/api/businesses')
        const data = await response.json()
        
        console.log('Response status:', response.status)
        console.log('Response data:', data)
        
        if (response.ok) {
          setBusinesses(data.businesses || [])
        } else {
          setError(`API Error: ${response.status}`)
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError(`Fetch Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchBusinesses()
  }, [])

  if (loading) return <div>Loading businesses...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Debug Businesses ({businesses.length})</h2>
      {businesses.slice(0, 3).map((business, index) => (
        <div key={index} className="mb-4 p-3 border rounded">
          <h3 className="font-semibold">{business.name}</h3>
          <p className="text-sm text-gray-600">{business.category}</p>
          <p className="text-xs">{business.address}</p>
          <p className="text-xs">Coords: {business.coordinates?.lng}, {business.coordinates?.lat}</p>
        </div>
      ))}
    </div>
  )
}