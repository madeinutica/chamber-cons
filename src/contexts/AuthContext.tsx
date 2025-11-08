'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { AuthUser, AuthContextType, UpdateUserProfileData } from '@/types/social'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<ReturnType<typeof createClientComponentClient> | null>(null)

  useEffect(() => {
    // Check if Supabase environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables not found. Auth features disabled.')
      setLoading(false)
      return
    }

    try {
      const client = createClientComponentClient()
      setSupabase(client)

      // Get initial session
      const getInitialSession = async () => {
        const { data: { session } } = await client.auth.getSession()
        if (session?.user) {
          await loadUserProfile(session.user)
        }
        setLoading(false)
      }

      getInitialSession()

      // Listen for auth changes
      const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user)
        } else {
          setUser(null)
        }
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Error initializing Supabase auth:', error)
      setLoading(false)
    }
  }, [])

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // For now, create a basic user profile from Supabase auth
      // Later, we'll fetch from our custom users table
      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || '',
        display_name: supabaseUser.user_metadata?.display_name || supabaseUser.user_metadata?.full_name,
        avatar_url: supabaseUser.user_metadata?.avatar_url,
        bio: supabaseUser.user_metadata?.bio,
        role: 'community', // Default role
        is_verified: false,
        reputation_score: 0,
        created_at: supabaseUser.created_at,
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      }
      
      setUser(authUser)
    } catch (error) {
      console.error('Error loading user profile:', error)
      setUser(null)
    }
  }

  const signUp = async (email: string, password: string, username: string, display_name?: string) => {
    if (!supabase) {
      return { user: null, error: 'Authentication not available' }
    }

    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: display_name || username,
          }
        }
      })

      if (error) {
        return { user: null, error: error.message }
      }

      // User will be set by the auth state change listener
      return { user: null, error: null } // User needs to verify email first
    } catch (error) {
      return { user: null, error: (error as Error).message }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { user: null, error: 'Authentication not available' }
    }

    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { user: null, error: error.message }
      }

      // User will be set by the auth state change listener
      return { user: null, error: null }
    } catch (error) {
      return { user: null, error: (error as Error).message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    if (!supabase) return

    try {
      setLoading(true)
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: UpdateUserProfileData) => {
    if (!supabase) {
      return { user: null, error: 'Authentication not available' }
    }

    try {
      if (!user) {
        return { user: null, error: 'No user logged in' }
      }

      setLoading(true)
      const { error } = await supabase.auth.updateUser({
        data: {
          ...data,
          display_name: data.display_name,
          avatar_url: data.avatar_url,
          bio: data.bio
        }
      })

      if (error) {
        return { user: null, error: error.message }
      }

      // Update local user state
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      
      return { user: updatedUser, error: null }
    } catch (error) {
      return { user: null, error: (error as Error).message }
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}