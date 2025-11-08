'use client'

import React from 'react'
import { Business } from '@/types/business'

interface MiniBusinessCardProps {
  business: Business
  onSelect: (business: Business) => void
  isSelected: boolean
  isDragging?: boolean
}

export default function MiniBusinessCard({ 
  business, 
  onSelect,
  isSelected,
  isDragging = false
}: MiniBusinessCardProps) {
  
  // Extract up to 2 categories
  const displayCategories = business.categories?.slice(0, 2) || [business.category]
  
  // Truncate address to single line
  const truncatedAddress = business.address?.length > 40 
    ? business.address.substring(0, 40) + '...' 
    : business.address

  return (
    <div
      className={`cursor-pointer mb-2 transform transition-all duration-200 rounded-lg border ${
        isDragging
          ? 'opacity-50 scale-95'
          : isSelected 
            ? 'border-indigo-400 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50 scale-[1.02]' 
            : 'border-gray-200 bg-white hover:shadow-md hover:border-indigo-200'
      }`}
      onClick={() => onSelect(business)}
    >
      <div className="p-3">
        {/* Business Name and Categories */}
        <div className="mb-2">
          <h3 className="font-bold text-sm text-gray-900 mb-1 leading-tight">
            {business.name}
          </h3>
          <div className="flex flex-wrap gap-1">
            {displayCategories.map((cat, idx) => (
              <span 
                key={idx}
                className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2 py-0.5 rounded"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Special Badges (compact) */}
        {(business.veteranOwned || business.womanOwned || business.minorityOwned || business.isNonprofit) && (
          <div className="flex flex-wrap gap-1 mb-2">
            {business.veteranOwned && (
              <span className="text-xs">🇺🇸</span>
            )}
            {business.womanOwned && (
              <span className="text-xs">👩</span>
            )}
            {business.minorityOwned && (
              <span className="text-xs">🌍</span>
            )}
            {business.isNonprofit && (
              <span className="text-xs">🤝</span>
            )}
          </div>
        )}

        {/* Contact Info - Compact */}
        <div className="space-y-1.5 text-xs">
          {/* Phone */}
          {business.phone && (
            <a 
              href={`tel:${business.phone}`}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="mr-1.5">📞</span>
              {business.phone}
            </a>
          )}

          {/* Address - truncated */}
          <div className="flex items-center text-gray-600">
            <span className="mr-1.5">📍</span>
            <span className="truncate">{truncatedAddress}</span>
          </div>

          {/* Website */}
          {business.website && (
            <a
              href={`https://${business.website.replace(/^https?:\/\//, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="mr-1.5">🌐</span>
              Website
            </a>
          )}
        </div>

        {/* Rating Badge */}
        {business.rating && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center bg-yellow-50 rounded px-2 py-0.5">
              <span className="text-yellow-500 text-xs mr-1">⭐</span>
              <span className="font-bold text-gray-900 text-xs">{business.rating}</span>
            </div>
            <span className="text-xs text-gray-400">Click for details</span>
          </div>
        )}
      </div>
    </div>
  )
}
