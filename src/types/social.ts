// Social Network Types
// Extends the existing business types with user-generated content

import { Business } from './business'

export interface User {
  id: string
  email: string
  username: string
  display_name?: string
  avatar_url?: string
  bio?: string
  role: 'admin' | 'business_owner' | 'community'
  is_verified: boolean
  reputation_score: number
  created_at: string
  updated_at: string
  last_login?: string
}

export interface UserProfile extends User {
  follower_count?: number
  following_count?: number
  post_count?: number
  businesses_owned?: Business[]
  is_following?: boolean // If current user follows this user
}

export interface BusinessOwner {
  id: string
  user_id: string
  business_id: string
  verified: boolean
  verified_at?: string
  verified_by?: string
  created_at: string
  user?: User
  business?: Business
}

export type PostType = 'review' | 'photo' | 'recommendation' | 'event' | 'update' | 'text' | 'image' | 'video' | 'link'

export interface Post {
  id: string
  author_id: string
  business_id?: string
  title?: string
  content?: string
  post_type: PostType
  media_urls?: string[]
  external_url?: string // For TikTok, YouTube embeds
  latitude?: number
  longitude?: number
  rating?: number // 1-5 for review posts
  is_featured: boolean
  is_pinned: boolean
  upvotes: number
  downvotes: number
  comment_count: number
  view_count: number
  created_at: string
  updated_at: string
  
  // Joined data
  author?: User
  business?: Business
  comments?: Comment[]
  media_files?: MediaFile[]
  user_vote?: 'up' | 'down' | null
  user_has_voted?: boolean
}

export interface PostWithEngagement extends Post {
  vote_score: number
  comment_count: number
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  parent_id?: string // For nested comments
  content: string
  upvotes: number
  downvotes: number
  is_flagged: boolean
  created_at: string
  updated_at: string
  
  // Joined data
  author?: User
  replies?: Comment[]
  user_vote?: 'up' | 'down' | null
  depth?: number // For nested comment display
}

export interface Vote {
  id: string
  user_id: string
  post_id?: string
  comment_id?: string
  vote_type: 'up' | 'down'
  created_at: string
}

export interface MediaFile {
  id: string
  uploader_id: string
  post_id?: string
  filename: string
  original_filename?: string
  file_type?: string
  file_size?: number
  storage_path: string
  thumbnail_path?: string
  width?: number
  height?: number
  duration?: number // For videos in seconds
  created_at: string
  
  // Joined data
  uploader?: User
}

export interface UserFollow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
  
  // Joined data
  follower?: User
  following?: User
}

export interface BusinessFollow {
  id: string
  user_id: string
  business_id: string
  created_at: string
  
  // Joined data
  user?: User
  business?: Business
}

export interface NewsItem {
  id: string
  title: string
  description?: string
  content?: string
  source_url?: string
  source_name?: string
  author?: string
  image_url?: string
  business_id?: string
  category?: string
  tags?: string[]
  published_at?: string
  created_at: string
  updated_at: string
  
  // Joined data
  business?: Business
}

// Extended Business type to include social features
export interface BusinessWithSocial extends Business {
  recent_posts?: Post[]
  follower_count?: number
  average_community_rating?: number
  owner_users?: User[]
  is_following?: boolean // If current user follows this business
  news_items?: NewsItem[]
}

// Feed item types for the community feed
export type FeedItemType = 'post' | 'news' | 'business_update'

export interface FeedItem {
  id: string
  type: FeedItemType
  title: string
  content?: string
  image_url?: string
  author?: User
  business?: Business
  post?: Post
  news_item?: NewsItem
  created_at: string
  engagement_score?: number // For sorting by relevance
}

// API Response types
export interface PostsResponse {
  posts: Post[]
  total_count: number
  page: number
  limit: number
  has_more: boolean
}

export interface CommentsResponse {
  comments: Comment[]
  total_count: number
  page: number
  limit: number
  has_more: boolean
}

export interface UsersResponse {
  users: UserProfile[]
  total_count: number
  page: number
  limit: number
  has_more: boolean
}

// Form types for creating content
export interface CreatePostData {
  title?: string
  content?: string
  post_type: PostType
  business_id?: string
  rating?: number
  latitude?: number
  longitude?: number
  media_files?: File[]
  external_url?: string
}

export interface CreateCommentData {
  content: string
  post_id: string
  parent_id?: string
}

export interface UpdateUserProfileData {
  display_name?: string
  bio?: string
  avatar_url?: string
}

// Search and filter types
export interface PostFilters {
  business_id?: string
  post_type?: PostType
  author_id?: string
  location_radius?: number // km from center point
  center_lat?: number
  center_lng?: number
  min_rating?: number
  max_rating?: number
  has_media?: boolean
  date_from?: string
  date_to?: string
  sort_by?: 'created_at' | 'upvotes' | 'engagement' | 'distance'
  sort_order?: 'asc' | 'desc'
}

export interface UserFilters {
  role?: User['role']
  verified_only?: boolean
  min_reputation?: number
  business_owners_only?: boolean
  sort_by?: 'created_at' | 'reputation_score' | 'username'
  sort_order?: 'asc' | 'desc'
}

// Authentication context types
export interface AuthUser extends User {
  session_id?: string
  access_token?: string
}

export interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signUp: (email: string, password: string, username: string, display_name?: string) => Promise<{ user: AuthUser | null; error: string | null }>
  signIn: (email: string, password: string) => Promise<{ user: AuthUser | null; error: string | null }>
  signOut: () => Promise<void>
  updateProfile: (data: UpdateUserProfileData) => Promise<{ user: AuthUser | null; error: string | null }>
}

// Notification types (for future implementation)
export interface Notification {
  id: string
  user_id: string
  type: 'comment' | 'vote' | 'follow' | 'business_update' | 'mention'
  title: string
  message: string
  read: boolean
  data?: Record<string, any> // Additional context data
  created_at: string
}