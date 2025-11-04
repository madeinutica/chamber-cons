'use client'

import { useState } from 'react'
import AdminDashboard from '@/components/admin/AdminDashboard'
import BusinessEditor from '@/components/admin/BusinessEditor'
import AuthWrapper from '@/components/admin/AuthWrapper'
import { Business } from '@/types/business'

type AdminView = 'dashboard' | 'editor'

export default function AdminPage() {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard')
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)
  const [refreshDashboard, setRefreshDashboard] = useState(0)

  const handleEditBusiness = (business: Business) => {
    setEditingBusiness(business)
    setCurrentView('editor')
  }

  const handleCreateNew = () => {
    setEditingBusiness(null)
    setCurrentView('editor')
  }

  const handleSave = (business: Business) => {
    setCurrentView('dashboard')
    setEditingBusiness(null)
    setRefreshDashboard(prev => prev + 1) // Force dashboard refresh
  }

  const handleCancel = () => {
    setCurrentView('dashboard')
    setEditingBusiness(null)
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Chamber of Commerce Admin
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your business directory and listings
                </p>
              </div>
              
              {/* Navigation */}
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={handleCreateNew}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'editor' && !editingBusiness
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Add Business
                </button>
                <a
                  href="/"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Public Site
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'dashboard' && (
            <AdminDashboard
              key={refreshDashboard} // Force re-render when businesses change
              onEditBusiness={handleEditBusiness}
              onCreateNew={handleCreateNew}
            />
          )}

          {currentView === 'editor' && (
            <BusinessEditor
              business={editingBusiness}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </div>

        {/* Quick Stats Footer */}
        {currentView === 'dashboard' && (
          <div className="bg-white border-t mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="text-center text-sm text-gray-500">
                Chamber of Commerce Business Directory Admin Panel | 
                Built with Next.js, Supabase & Mapbox
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthWrapper>
  )
}