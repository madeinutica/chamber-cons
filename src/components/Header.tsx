'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from './AuthModal'

interface HeaderProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedFilters: string[]
  onFilterToggle: (filter: string) => void
  onClearSearch: () => void
}

const categories = [
  'All Categories',
  'Legal Services',
  'Financial Services',
  'Healthcare',
  'Restaurant',
  'Coffee & Tea',
  'Bakery',
  'Home Services',
  'Professional Services',
  'Real Estate',
  'Insurance',
  'Technology',
  'Education',
  'Arts & Culture',
  'Community Services',
  'Non-Profit',
  'Entertainment',
  'Automotive',
  'Retail',
  'Lodging',
  'Manufacturing',
  'Engineering'
]

export default function Header({ 
  selectedCategory, 
  onCategoryChange,
  selectedFilters,
  onFilterToggle,
  onClearSearch
}: HeaderProps) {
  const { user, signOut, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  const filters = [
    { id: 'for-profit', label: 'For-Profit', icon: '💼', color: 'blue' },
    { id: 'nonprofit', label: 'Non-Profit', icon: '🤝', color: 'green' },
    { id: 'veteran', label: 'Veteran Owned', icon: '🇺🇸', color: 'red' },
    { id: 'women', label: 'Women Owned', icon: '♀️', color: 'pink' },
    { id: 'minority', label: 'Minority Owned', icon: '🌍', color: 'purple' }
  ]

  const hasActiveFilters = selectedFilters.length > 0 || selectedCategory !== 'All Categories'

  const getFilterColor = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100',
      green: isActive ? 'bg-green-100 border-green-300 text-green-700' : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100',
      red: isActive ? 'bg-red-100 border-red-300 text-red-700' : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100',
      pink: isActive ? 'bg-pink-100 border-pink-300 text-pink-700' : 'bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100',
      purple: isActive ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
        <div className="max-w-full px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg"></span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 leading-tight">Chamber Concierge</h1>
                <p className="text-xs text-gray-500">CNY Business Directory</p>
              </div>
            </div>

            {/* Business Type Filters - Dropdown */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700"
                >
                  <span>🏷️</span>
                  <span>Business Type</span>
                  {selectedFilters.length > 0 && (
                    <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {selectedFilters.length}
                    </span>
                  )}
                  <svg className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showFilterDropdown && (
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
                    <div className="p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Filter by Type</p>
                      {filters.map(filter => {
                        const isActive = selectedFilters.includes(filter.id)
                        return (
                          <button
                            key={filter.id}
                            onClick={() => onFilterToggle(filter.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all mb-1 ${isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}
                          >
                            <span>{filter.icon}</span>
                            <span className="flex-1 text-left">{filter.label}</span>
                            {isActive && (
                              <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Clear Search Button */}
              {hasActiveFilters && (
                <button
                  onClick={onClearSearch}
                  className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium border border-red-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="hidden md:inline">Clear Filters</span>
                </button>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700"
                >
                  <span></span>
                  <span className="hidden md:inline">{selectedCategory === 'All Categories' ? 'All' : selectedCategory}</span>
                  <svg className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showCategories && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                    <div className="p-2">
                      {categories.map(category => (
                        <button
                          key={category}
                          onClick={() => { onCategoryChange(category); setShowCategories(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'hover:bg-gray-100 text-gray-700'}`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="animate-pulse w-10 h-10 bg-gray-200 rounded-full"></div>
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <span className="text-white font-bold text-sm">{user.display_name?.[0] || user.username?.[0] || user.email[0]}</span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                      <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border-b border-gray-200">
                        <p className="font-semibold text-gray-900">{user.display_name || user.username}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">{user.role}</span>
                      </div>
                      <div className="p-2">
                        {user.role === 'admin' && (
                          <a href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"> Admin Dashboard</a>
                        )}
                        <button onClick={() => { signOut(); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"> Sign Out</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all text-sm">Sign In</button>
              )}
            </div>
          </div>

          {/* Mobile Filters */}
          <div className="lg:hidden pb-3">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700 flex-shrink-0"
              >
                <span>🏷️</span>
                <span>Type</span>
                {selectedFilters.length > 0 && (
                  <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {selectedFilters.length}
                  </span>
                )}
              </button>
              {hasActiveFilters && (
                <button
                  onClick={onClearSearch}
                  className="flex items-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium border border-red-200 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Clear</span>
                </button>
              )}
            </div>
            {showFilterDropdown && (
              <div className="bg-white rounded-lg border border-gray-200 p-2 mb-2">
                {filters.map(filter => {
                  const isActive = selectedFilters.includes(filter.id)
                  return (
                    <button
                      key={filter.id}
                      onClick={() => onFilterToggle(filter.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all mb-1 ${isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <span>{filter.icon}</span>
                      <span className="flex-1 text-left">{filter.label}</span>
                      {isActive && (
                        <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </nav>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}
