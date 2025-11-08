'use client'

import React from 'react'
import { Business } from '@/types/business'

interface FeaturedBusinessCardProps {
  business: Business
  onSelect: (business: Business) => void
  isSelected: boolean
}

export default function FeaturedBusinessCard({ 
  business, 
  onSelect,
  isSelected 
}: FeaturedBusinessCardProps) {
  
  // Extract up to 3 categories
  const displayCategories = business.categories?.slice(0, 3) || [business.category]
  
  // Get social media embeds
  const getSocialEmbed = (url: string, platform: 'tiktok' | 'youtube' | 'spotify') => {
    if (!url) return null
    
    try {
      if (platform === 'tiktok') {
        // TikTok embed - extract video ID
        const match = url.match(/\/video\/(\d+)/)
        if (match) {
          return (
            <iframe
              src={`https://www.tiktok.com/embed/v2/${match[1]}`}
              className="w-full h-[400px] rounded-lg"
              allowFullScreen
              scrolling="no"
            />
          )
        }
      } else if (platform === 'youtube') {
        // YouTube embed
        const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
        if (videoId) {
          return (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-[300px] rounded-lg"
              allowFullScreen
            />
          )
        }
      } else if (platform === 'spotify') {
        // Spotify embed
        const match = url.match(/spotify\.com\/(track|album|playlist|show|episode)\/([a-zA-Z0-9]+)/)
        if (match) {
          return (
            <iframe
              src={`https://open.spotify.com/embed/${match[1]}/${match[2]}`}
              className="w-full h-[152px] rounded-lg"
              allowFullScreen
            />
          )
        }
      }
    } catch (e) {
      console.error(`Error parsing ${platform} URL:`, e)
    }
    return null
  }

  const hasSocialMedia = business.socialMedia && 
    (business.socialMedia.tiktok || business.socialMedia.youtube || business.socialMedia.spotify)

  return (
    <div
      className={`cursor-pointer mb-4 transform transition-all duration-300 rounded-xl border-4 ${
        isSelected 
          ? 'border-indigo-500 shadow-2xl bg-gradient-to-br from-indigo-50 to-blue-50' 
          : 'border-yellow-400 shadow-xl bg-white hover:shadow-2xl hover:scale-[1.01]'
      }`}
      onClick={() => onSelect(business)}
    >
      {/* Featured Badge Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <span className="text-white font-bold text-lg">FEATURED BUSINESS</span>
        </div>
        <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-yellow-100 mr-1">⭐</span>
          <span className="font-bold text-white">{business.rating || 'N/A'}</span>
        </div>
      </div>

      <div className="p-6">
        {/* Business Name */}
        <h2 className="font-bold text-2xl text-gray-900 mb-3">
          {business.name}
        </h2>

        {/* Categories (up to 3) */}
        <div className="flex flex-wrap gap-2 mb-4">
          {displayCategories.map((cat, idx) => (
            <span 
              key={idx}
              className="bg-indigo-100 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-lg"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Special Designations */}
        <div className="flex flex-wrap gap-2 mb-4">
          {business.sponsored && (
            <span className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm px-3 py-1.5 rounded-full font-medium shadow-sm flex items-center gap-1">
              <span>💎</span> Sponsored
            </span>
          )}
          {business.veteranOwned && (
            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm px-3 py-1.5 rounded-full font-medium shadow-sm flex items-center gap-1">
              <span>🇺🇸</span> Veteran Owned
            </span>
          )}
          {business.womanOwned && (
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm px-3 py-1.5 rounded-full font-medium shadow-sm flex items-center gap-1">
              <span>👩</span> Woman Owned
            </span>
          )}
          {business.minorityOwned && (
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm px-3 py-1.5 rounded-full font-medium shadow-sm flex items-center gap-1">
              <span>🌍</span> Minority Owned
            </span>
          )}
          {business.isNonprofit && (
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm px-3 py-1.5 rounded-full font-medium shadow-sm flex items-center gap-1">
              <span>🤝</span> Non-Profit
            </span>
          )}
        </div>

        {/* Social Media Embeds */}
        {hasSocialMedia && (
          <div className="mb-4 space-y-3">
            {business.socialMedia?.youtube && getSocialEmbed(business.socialMedia.youtube, 'youtube')}
            {business.socialMedia?.tiktok && getSocialEmbed(business.socialMedia.tiktok, 'tiktok')}
            {business.socialMedia?.spotify && getSocialEmbed(business.socialMedia.spotify, 'spotify')}
          </div>
        )}

        {/* Full Description */}
        <div className="mb-4">
          <p className="text-gray-700 text-base leading-relaxed">
            {business.description || 'No description available'}
          </p>
        </div>

        {/* Contact Information */}
        <div className="space-y-3 mb-4">
          {/* Phone */}
          {business.phone && (
            <a 
              href={`tel:${business.phone}`}
              className="flex items-center bg-blue-50 hover:bg-blue-100 rounded-lg p-3 transition-colors group"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-2xl mr-3">📞</span>
              <div className="flex-1">
                <div className="text-xs text-gray-600 font-medium">CALL NOW</div>
                <div className="text-blue-700 font-bold text-lg group-hover:text-blue-800">
                  {business.phone}
                </div>
              </div>
            </a>
          )}

          {/* Address */}
          <div className="flex items-center bg-gray-50 rounded-lg p-3">
            <span className="text-2xl mr-3">📍</span>
            <div className="flex-1">
              <div className="text-xs text-gray-600 font-medium mb-1">ADDRESS</div>
              <div className="text-gray-800 font-medium">
                {business.address || 'Address not available'}
              </div>
            </div>
          </div>

          {/* Website */}
          {business.website && (
            <a
              href={`https://${business.website.replace(/^https?:\/\//, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-indigo-50 hover:bg-indigo-100 rounded-lg p-3 transition-colors group"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-2xl mr-3">🌐</span>
              <div className="flex-1">
                <div className="text-xs text-gray-600 font-medium">WEBSITE</div>
                <div className="text-indigo-700 font-bold group-hover:text-indigo-800 flex items-center gap-2">
                  Visit Website
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
            </a>
          )}
        </div>

        {/* View on Map Button */}
        <button 
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          onClick={(e) => {
            e.stopPropagation()
            onSelect(business)
          }}
        >
          <span className="text-xl">📍</span>
          View on Map
        </button>
      </div>
    </div>
  )
}
