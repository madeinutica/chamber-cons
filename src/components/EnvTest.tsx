'use client'

import React, { useState, useEffect } from 'react'

export default function EnvTest() {
  const [isClient, setIsClient] = useState(false)
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <div className="flex items-center justify-center h-full bg-gray-100 p-8">
      <div className="text-center bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Environment Variables Test</h3>
        <div className="space-y-2 text-left">
          <div>
            <strong>Mapbox Token:</strong> 
            <span className="ml-2 text-sm">
              {mapboxToken ? `${mapboxToken.substring(0, 20)}...` : 'Not found'}
            </span>
          </div>
          <div>
            <strong>Token Type:</strong> 
            <span className="ml-2 text-sm">
              {mapboxToken?.startsWith('pk.') ? 'Valid Public Token' : 'Invalid Token Format'}
            </span>
          </div>
          <div>
            <strong>Environment:</strong> 
            <span className="ml-2 text-sm">
              {isClient ? 'Client Side' : 'Server Side'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}