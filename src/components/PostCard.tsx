'use client'

import React, { useState } from 'react'
import { Post, PostWithEngagement } from '@/types/social'
import { useAuth } from '@/contexts/AuthContext'

interface PostCardProps {
  post: PostWithEngagement
  onVote?: (postId: string, voteType: 'upvote' | 'downvote') => void
  onComment?: (postId: string) => void
}

export default function PostCard({ post, onVote, onComment }: PostCardProps) {
  const { user } = useAuth()
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user || isVoting) return
    
    setIsVoting(true)
    try {
      await onVote?.(post.id, voteType)
    } finally {
      setIsVoting(false)
    }
  }

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'review': return '⭐'
      case 'photo': return '📸'
      case 'recommendation': return '👍'
      case 'event': return '📅'
      case 'update': return '📢'
      default: return '💬'
    }
  }

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'photo': return 'bg-blue-100 text-blue-800'
      case 'recommendation': return 'bg-green-100 text-green-800'
      case 'event': return 'bg-purple-100 text-purple-800'
      case 'update': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <article className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Author Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {post.author?.display_name?.[0] || post.author?.username?.[0] || '?'}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900">
                  {post.author?.display_name || post.author?.username || 'Anonymous'}
                </h4>
                {post.author?.is_verified && (
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{formatTimeAgo(post.created_at)}</span>
                {post.business && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-600 hover:text-indigo-800 cursor-pointer">
                      {post.business.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Post Type Badge */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.post_type)}`}>
            {getPostTypeIcon(post.post_type)} {post.post_type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Rating for reviews */}
        {post.post_type === 'review' && post.rating && (
          <div className="flex items-center space-x-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-lg ${i < post.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ⭐
              </span>
            ))}
            <span className="ml-2 text-sm text-gray-600">({post.rating}/5)</span>
          </div>
        )}

        {/* Post content */}
        <div className="text-gray-900 leading-relaxed">
          {post.content}
        </div>

        {/* Media preview (placeholder for now) */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {post.media_urls.slice(0, 4).map((url: string, index: number) => (
              <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={url}
                  alt="Post media"
                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                />
              </div>
            ))}
            {post.media_urls.length > 4 && (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm">+{post.media_urls.length - 4} more</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          {/* Vote buttons */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleVote('upvote')}
                disabled={!user || isVoting}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors hover:bg-green-100 text-gray-600 hover:text-green-700 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                <span>{post.vote_score || 0}</span>
              </button>
              
              <button
                onClick={() => handleVote('downvote')}
                disabled={!user || isVoting}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors hover:bg-red-100 text-gray-600 hover:text-red-700 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <button
              onClick={() => onComment?.(post.id)}
              className="flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors hover:bg-blue-100 text-gray-600 hover:text-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.697-.413l-3.772 1.257a.5.5 0 01-.645-.645L7.14 16.427A8.963 8.963 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
              <span>{post.comment_count || 0}</span>
            </button>
          </div>

          {/* Share button */}
          <button className="flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200 text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span>Share</span>
          </button>
        </div>
      </div>
    </article>
  )
}