'use client'

import React, { useState, useEffect } from 'react'
import { PostWithEngagement } from '@/types/social'
import { useAuth } from '@/contexts/AuthContext'
import CreatePost from './CreatePost'
import PostCard from './PostCard'

interface CommunityFeedProps {
  businessId?: string
  businessName?: string
}

export default function CommunityFeed({ businessId, businessName }: CommunityFeedProps) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<PostWithEngagement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const fetchPosts = async (offset = 0) => {
    try {
      const params = new URLSearchParams({
        limit: '10',
        offset: offset.toString()
      })
      
      if (businessId) {
        params.append('business_id', businessId)
      }

      const response = await fetch(`/api/posts?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }

      const data = await response.json()
      
      if (offset === 0) {
        setPosts(data.posts)
      } else {
        setPosts(prev => [...prev, ...data.posts])
      }
      
      setHasMore(data.has_more)
      setError('')
    } catch (err) {
      setError('Failed to load posts. Please try again.')
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [businessId])

  const handlePostCreated = () => {
    // Refresh the feed when a new post is created
    fetchPosts()
    setShowCreatePost(false)
  }

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) return

    try {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote_type: voteType }),
      })

      if (!response.ok) {
        throw new Error('Failed to vote')
      }

      // Update the post in the local state
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const currentScore = post.vote_score || 0
            const newScore = voteType === 'upvote' ? currentScore + 1 : currentScore - 1
            return { ...post, vote_score: newScore }
          }
          return post
        })
      )
    } catch (err) {
      console.error('Error voting:', err)
    }
  }

  const handleComment = (postId: string) => {
    // TODO: Implement comment functionality
    console.log('Comment on post:', postId)
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      setLoading(true)
      fetchPosts(posts.length)
    }
  }

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Create Post Section */}
      {user && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user.display_name?.[0] || user.username[0] || user.email[0]}
              </span>
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex-1 text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors"
            >
              {businessName 
                ? `Share something about ${businessName}...`
                : "What's happening in your community?"
              }
            </button>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-screen overflow-y-auto">
            <CreatePost
              businessId={businessId}
              businessName={businessName}
              onPostCreated={handlePostCreated}
              onClose={() => setShowCreatePost(false)}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchPosts()}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Posts Feed */}
      {posts.length === 0 && !loading ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600 mb-4">
            {businessName 
              ? `Be the first to share something about ${businessName}!`
              : "Be the first to share something with the community!"
            }
          </p>
          {user && (
            <button
              onClick={() => setShowCreatePost(true)}
              className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-blue-800 transition-all font-medium shadow-lg hover:shadow-xl"
            >
              Create First Post
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onVote={handleVote}
              onComment={handleComment}
            />
          ))}
          
          {/* Load More Button */}
          {hasMore && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More Posts'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sign in prompt for non-authenticated users */}
      {!user && posts.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold text-indigo-900 mb-2">Join the Conversation</h3>
          <p className="text-indigo-700 mb-4">
            Sign up to create posts, vote, and engage with the community!
          </p>
          <button
            onClick={() => {
              // TODO: Open auth modal
              console.log('Open auth modal')
            }}
            className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-blue-800 transition-all font-medium shadow-lg hover:shadow-xl"
          >
            Sign Up Now
          </button>
        </div>
      )}
    </div>
  )
}