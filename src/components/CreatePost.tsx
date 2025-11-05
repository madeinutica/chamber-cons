'use client'

import React, { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { CreatePostData, PostType } from '@/types/social'

interface CreatePostProps {
  businessId?: string
  businessName?: string
  onPostCreated?: () => void
  onClose?: () => void
}

const POST_TYPES = [
  { value: 'review' as PostType, label: '⭐ Review', description: 'Share your experience' },
  { value: 'photo' as PostType, label: '📸 Photo', description: 'Show off this place' },
  { value: 'recommendation' as PostType, label: '👍 Recommendation', description: 'Recommend to others' },
  { value: 'event' as PostType, label: '📅 Event', description: 'Share an event or special' },
  { value: 'update' as PostType, label: '📢 Update', description: 'General update or news' }
]

export default function CreatePost({ businessId, businessName, onPostCreated, onClose }: CreatePostProps) {
  const { user } = useAuth()
  const [postType, setPostType] = useState<PostType>('review')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Please sign in to create posts.</p>
      </div>
    )
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      return (isImage || isVideo) && isValidSize
    })
    
    if (validFiles.length !== files.length) {
      setError('Some files were skipped. Only images and videos under 10MB are allowed.')
    } else {
      setError('')
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5)) // Max 5 files
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      setError('Please write something about your experience.')
      return
    }

    if (postType === 'review' && rating === null) {
      setError('Please provide a rating for your review.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const postData: CreatePostData = {
        content: content.trim(),
        post_type: postType,
        business_id: businessId || undefined,
        rating: postType === 'review' ? rating || undefined : undefined
      }

      // Create the post via API
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create post')
      }

      const result = await response.json()
      console.log('Post created successfully:', result.post)
      
      // Reset form
      setContent('')
      setRating(null)
      setSelectedFiles([])
      setPostType('review')
      
      // Call callbacks
      onPostCreated?.()
      onClose?.()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white p-6 rounded-t-2xl">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Share with the Community</h3>
            {businessName && (
              <p className="text-indigo-100 text-sm mt-1">About {businessName}</p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Post Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What would you like to share?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {POST_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setPostType(type.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all hover:scale-105 ${
                  postType === type.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="font-medium text-sm">{type.label}</div>
                <div className="text-xs text-gray-500 mt-1">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Rating for Reviews */}
        {postType === 'review' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating *
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-colors ${
                    rating && rating >= star ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ⭐
                </button>
              ))}
              {rating && (
                <span className="ml-2 text-sm text-gray-600">
                  {rating} star{rating !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Share your thoughts *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-gray-900 bg-white resize-none"
            placeholder={
              postType === 'review' ? "How was your experience? What stood out to you?" :
              postType === 'photo' ? "Tell us about this photo..." :
              postType === 'recommendation' ? "Why do you recommend this place?" :
              postType === 'event' ? "Share details about this event..." :
              "What would you like to share?"
            }
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {content.length}/500 characters
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Photos or Videos (optional)
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
          >
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              Click to upload photos or videos
            </p>
            <p className="text-xs text-gray-500">
              Max 5 files, 10MB each
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Files:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                  <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-lg hover:from-indigo-700 hover:to-blue-800 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Posting...
              </div>
            ) : (
              'Share Post'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}