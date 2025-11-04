'use client'

import { useState, useEffect } from 'react'
import { Business } from '@/types/business'

interface AdminDashboardProps {
  onEditBusiness: (business: Business) => void
  onCreateNew: () => void
}

export default function AdminDashboard({ onEditBusiness, onCreateNew }: AdminDashboardProps) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [sortBy, setSortBy] = useState('name')

  useEffect(() => {
    loadBusinesses()
  }, [])

  const loadBusinesses = async () => {
    try {
      const response = await fetch('/api/businesses')
      const data = await response.json()
      setBusinesses(data.businesses || [])
    } catch (error) {
      console.error('Error loading businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteBusiness = async (id: string) => {
    if (!confirm('Are you sure you want to delete this business?')) return

    try {
      const response = await fetch(`/api/admin/businesses/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setBusinesses(businesses.filter(b => b.id !== id))
        alert('Business deleted successfully')
      } else {
        alert('Failed to delete business')
      }
    } catch (error) {
      console.error('Error deleting business:', error)
      alert('Error deleting business')
    }
  }

  const filteredBusinesses = businesses
    .filter(business => 
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(business => 
      filterCategory === '' || business.category === filterCategory
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'category':
          return a.category.localeCompare(b.category)
        case 'rating':
          return b.rating - a.rating
        case 'created':
          return 0 // We'll handle this when we add created_at to the database
        default:
          return 0
      }
    })

  const categories = Array.from(new Set(businesses.map(b => b.category))).sort()

  const stats = {
    total: businesses.length,
    featured: businesses.filter(b => b.featured).length,
    nonprofits: businesses.filter(b => b.isNonprofit).length,
    veteranOwned: businesses.filter(b => b.veteranOwned).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Total Businesses</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Featured</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.featured}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Non-Profits</h3>
          <p className="text-3xl font-bold text-green-600">{stats.nonprofits}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900">Veteran Owned</h3>
          <p className="text-3xl font-bold text-red-600">{stats.veteranOwned}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="category">Sort by Category</option>
              <option value="rating">Sort by Rating</option>
              <option value="created">Sort by Date Added</option>
            </select>
          </div>

          <button
            onClick={onCreateNew}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Business
          </button>
        </div>
      </div>

      {/* Business List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBusinesses.map((business) => (
                <tr key={business.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {business.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {business.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{business.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐</span>
                      <span className="ml-1 text-sm text-gray-900">{business.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      {business.featured && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          Featured
                        </span>
                      )}
                      {business.isNonprofit && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Non-Profit
                        </span>
                      )}
                      {business.veteranOwned && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          Veteran Owned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditBusiness(business)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteBusiness(business.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBusinesses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No businesses found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}