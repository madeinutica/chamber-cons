'use client'

import React, { useState, useEffect } from 'react'
import { Post, PostWithEngagement } from '@/types/social'
import { useAuth } from '@/contexts/AuthContext'
import CreatePost from '@/components/CreatePost'
import PostCard from '@/components/PostCard'

export default function CommunityFeed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<PostWithEngagement[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true);
    // MOCK DATA to prevent crash from missing 'posts' table
    const mockPosts: PostWithEngagement[] = [
      {
        id: '1',
        author_id: 'mock-user-1',
        post_type: 'review',
        content: 'This is a mock review for a great local spot! Highly recommend the coffee.',
        business_id: 'some-business-id',
        rating: 5,
        vote_score: 15,
        comment_count: 2,
        upvotes: 15,
        downvotes: 0,
        view_count: 50,
        is_featured: false,
        is_pinned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: {
          id: 'mock-user-1',
          email: 'jane@example.com',
          username: 'jane_doe',
          display_name: 'Jane Doe',
          avatar_url: undefined,
          role: 'community',
          is_verified: false,
          reputation_score: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      {
        id: '2',
        author_id: 'mock-user-2',
        post_type: 'photo',
        content: 'A photo from the beautiful downtown area.',
        business_id: 'another-business-id',
        vote_score: 8,
        comment_count: 1,
        upvotes: 8,
        downvotes: 0,
        view_count: 30,
        is_featured: false,
        is_pinned: false,
        created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3600 * 1000).toISOString(),
        author: {
          id: 'mock-user-2',
          email: 'john@example.com',
          username: 'john_smith',
          display_name: 'John Smith',
          avatar_url: undefined,
          role: 'community',
          is_verified: false,
          reputation_score: 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    ];
    setPosts(mockPosts);
    setLoading(false);
  };

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
              What&apos;s happening in your community?
            </button>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-screen overflow-y-auto">
            <CreatePost
              onPostCreated={handlePostCreated}
              onClose={() => setShowCreatePost(false)}
            />
          </div>
        </div>
      )}

      {/* Posts Feed */}
      {posts.length === 0 && !loading ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600 mb-4">
            Be the first to share something with the community!
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