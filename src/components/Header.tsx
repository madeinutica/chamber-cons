'use client'

import React from 'react'

interface HeaderProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const categories = [
  'All Categories',
  'Home Services',
  'Restaurant',
  'Coffee & Tea',
  'Bakery',
  'Retail',
  'Professional Services',
  'Health & Wellness',
  'Non-Profit',
  'Education',
  'Community Services',
  'Arts & Culture',
  'Animal Welfare',
  'Youth Services',
  'Emergency Services',
  'Entertainment'
]

export default function Header({ 
  searchTerm, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange 
}: HeaderProps) {
  return (
    <div className="bg-primary-600 text-white p-4">
      {/* Logo and Title */}
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
          <span className="text-primary-600 font-bold text-sm">CNY</span>
        </div>
        <div>
          <h1 className="text-lg font-bold">CNY Directory</h1>
          <p className="text-sm text-primary-100">Central New York</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-4 text-sm">
        <button className="bg-white text-primary-600 px-3 py-1 rounded flex items-center">
          <span className="mr-1">🗺️</span>
          Map
        </button>
        <button className="text-primary-100 px-3 py-1 rounded flex items-center">
          <span className="mr-1">🏢</span>
          Businesses
          <span className="ml-1 bg-primary-500 text-xs px-1 rounded">25+</span>
        </button>
        <button className="text-primary-100 px-3 py-1 rounded flex items-center">
          <span className="mr-1">🤝</span>
          Nonprofits
          <span className="ml-1 bg-primary-500 text-xs px-1 rounded">70+</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search businesses..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 rounded text-gray-800 placeholder-gray-500"
        />
      </div>

      {/* Category Filter */}
      <div>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-3 py-2 rounded text-gray-800"
        >
          {categories.map((category) => (
            <option key={category} value={category === 'All Categories' ? '' : category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Featured Businesses Header */}
      <div className="mt-4 mb-2">
        <h2 className="text-sm font-semibold flex items-center">
          ⭐ Featured Businesses
        </h2>
      </div>
    </div>
  )
}