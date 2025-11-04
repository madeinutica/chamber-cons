'use client'

import React, { useState } from 'react'

export default function GeocodeAdmin() {
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const startGeocoding = async () => {
    setIsGeocoding(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok) {
        setResults(data)
      } else {
        setError(data.error || 'Geocoding failed')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Geocoding error:', err)
    } finally {
      setIsGeocoding(false)
    }
  }

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-50">
      <h3 className="font-bold text-lg mb-3">Geocoding Admin</h3>
      
      <button
        onClick={startGeocoding}
        disabled={isGeocoding}
        className={`w-full px-4 py-2 rounded font-medium ${
          isGeocoding 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isGeocoding ? 'Geocoding...' : 'Start Geocoding'}
      </button>

      {isGeocoding && (
        <div className="mt-3 text-sm text-gray-600">
          <div className="animate-pulse">Processing addresses...</div>
          <div className="text-xs mt-1">This may take a few minutes</div>
        </div>
      )}

      {results && (
        <div className="mt-3 text-sm">
          <div className="font-medium text-green-600">Geocoding Complete!</div>
          <div className="mt-2 space-y-1">
            <div>Total: {results.results.total}</div>
            <div className="text-green-600">Updated: {results.results.updated}</div>
            <div className="text-yellow-600">Skipped: {results.results.skipped}</div>
            <div className="text-red-600">Failed: {results.results.failed}</div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 text-sm text-red-600">
          <div className="font-medium">Error:</div>
          <div>{error}</div>
        </div>
      )}
    </div>
  )
}