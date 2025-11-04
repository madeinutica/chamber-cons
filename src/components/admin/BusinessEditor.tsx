'use client'

import { useState, useEffect } from 'react'
import { Business } from '@/types/business'
import { geocodeAddress } from '@/utils/geocoding'

interface BusinessEditorProps {
  business?: Business | null
  onSave: (business: Business) => void
  onCancel: () => void
}

const categories = [
  'Restaurant',
  'Coffee & Tea',
  'Bakery',
  'Home Services',
  'Professional Services',
  'Health & Wellness',
  'Education',
  'Arts & Culture',
  'Community Services',
  'Animal Welfare',
  'Youth Services',
  'Entertainment',
  'Automotive',
  'Retail',
  'Beauty & Spa',
  'Emergency Services',
  'Religious Organizations',
  'Sports & Recreation'
]

export default function BusinessEditor({ business, onSave, onCancel }: BusinessEditorProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    rating: 0,
    featured: false,
    sponsored: false,
    veteranOwned: false,
    isNonprofit: false,
    metaDescription: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [coordinates, setCoordinates] = useState({ lat: 43.1009, lng: -75.2321 })

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || '',
        category: business.category || '',
        description: business.description || '',
        address: business.address || '',
        phone: business.phone || '',
        website: business.website || '',
        rating: business.rating || 0,
        featured: business.featured || false,
        sponsored: business.sponsored || false,
        veteranOwned: business.veteranOwned || false,
        isNonprofit: business.isNonprofit || false,
        metaDescription: business.metaDescription || ''
      })
      setCoordinates({
        lat: business.coordinates?.lat || 43.1009,
        lng: business.coordinates?.lng || -75.2321
      })
    }
  }, [business])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleGeocodeAddress = async () => {
    if (!formData.address) {
      alert('Please enter an address first')
      return
    }

    setGeocoding(true)
    try {
      const result = await geocodeAddress(formData.address)
      if (result) {
        setCoordinates({
          lat: result.latitude,
          lng: result.longitude
        })
        alert('Address geocoded successfully!')
      } else {
        alert('Could not geocode address. Please check the address and try again.')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      alert('Error geocoding address')
    } finally {
      setGeocoding(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const businessData: Business = {
        id: business?.id || '',
        name: formData.name,
        category: formData.category,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        website: formData.website,
        rating: formData.rating,
        featured: formData.featured,
        sponsored: formData.sponsored,
        veteranOwned: formData.veteranOwned,
        isNonprofit: formData.isNonprofit,
        metaDescription: formData.metaDescription,
        coordinates: coordinates
      }

      const url = business ? `/api/admin/businesses/${business.id}` : '/api/admin/businesses'
      const method = business ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(businessData)
      })

      if (response.ok) {
        const result = await response.json()
        onSave(result.business)
        alert(business ? 'Business updated successfully!' : 'Business created successfully!')
      } else {
        const error = await response.text()
        alert(`Error: ${error}`)
      }
    } catch (error) {
      console.error('Error saving business:', error)
      alert('Error saving business')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          {business ? 'Edit Business' : 'Add New Business'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating (0-5)
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                min="0"
                max="5"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Location & Attributes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Location & Attributes</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleGeocodeAddress}
                  disabled={geocoding}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {geocoding ? 'Geocoding...' : 'Geocode'}
                </button>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-700">Business Attributes</h4>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Featured Business</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="sponsored"
                  checked={formData.sponsored}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Sponsored</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="veteranOwned"
                  checked={formData.veteranOwned}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Veteran Owned</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isNonprofit"
                  checked={formData.isNonprofit}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Non-Profit Organization</label>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the business, its services, and what makes it special..."
          />
        </div>

        {/* Meta Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SEO Meta Description
          </label>
          <textarea
            name="metaDescription"
            value={formData.metaDescription}
            onChange={handleInputChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description for search engines (150-160 characters recommended)"
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.metaDescription.length}/160 characters
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (business ? 'Update Business' : 'Create Business')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}