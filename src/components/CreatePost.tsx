'use client'

import React, { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { CreatePostData, PostType } from '@/types/social'
import MediaUpload from './MediaUpload'
import MediaGallery from './MediaGallery'

interface UploadedFile {
  id: string
  url: string
  filename: string
  original_filename: string
  file_type: string
  file_size: number
}

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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Please sign in to create posts.</p>
      </div>
    )
  }

  const handleFileUpload = (files: UploadedFile[]) => {
    setUploadedFiles(prev => [...prev, ...files])
    setError('')
  }

  const handleUploadError = (error: string) => {
    setError(error)
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
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

      // Add media URLs if files were uploaded
      if (uploadedFiles.length > 0) {
        postData.media_urls = uploadedFiles.map(file => file.url)
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
      setUploadedFiles([])
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

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Photos or Videos (optional)
          </label>
          <MediaUpload
            onUpload={handleFileUpload}
            onError={handleUploadError}
            maxFiles={5}
            className="mb-4"
          />
        </div>

        {/* Uploaded Files Gallery */}
        {uploadedFiles.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Files:</h4>
            <MediaGallery
              files={uploadedFiles}
              onRemove={removeFile}
              showDetails={true}
              columns={3}
            />
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