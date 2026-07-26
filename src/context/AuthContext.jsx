import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function enrichUserWithProfile(authUser) {
    if (!authUser) return null

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username, display_name, bio, avatar_url, role, blocked, moderation_pin')
        .eq('id', authUser.id)
        .single()

      if (error) {
        return {
          ...authUser,
          username: authUser.email?.split('@')[0] || 'utente',
          display_name: authUser.email?.split('@')[0] || 'Utente',
          blocked: false,
          moderation_pin: null,
          role: 'user'
        }
      }

      return {
        ...authUser,
        username: profile.username,
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        role: profile.role || 'user',
        blocked: profile.blocked || false,
        moderation_pin: profile.moderation_pin || null
      }

    } catch (err) {
      console.error('❌ Errore nel recupero del profilo:', err)
      return { ...authUser, blocked: false, moderation_pin: null, role: 'user' }
    }
  }

  useEffect(() => {
    async function initializeAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const enrichedUser = await enrichUserWithProfile(session.user)
        setUser(enrichedUser)
      }
      setLoading(false)
    }

    initializeAuth()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const enrichedUser = await enrichUserWithProfile(session.user)
          setUser(enrichedUser)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => listener?.subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    })
    if (error) throw error
    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}