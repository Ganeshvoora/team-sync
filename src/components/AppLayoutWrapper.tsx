'use client'

import { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import RoleBasedNavigation from './RoleBasedNavigation'

interface CurrentUser {
  id: string
  name: string
  email: string
  role?: {
    name: string
    level: number
  } | null
}

interface AppLayoutWrapperProps {
  children: ReactNode
}

// Pages where navigation should not be shown
const NO_NAV_PAGES = [
  '/login',
  '/signup',
  '/auth',
  '/reset-password',
  '/verify-email',
  '/onboarding',
  '/pending-approval',
  '/auth/auth-code-error',
  '/error'
]

export default function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  // Check if current page should show navigation
  const shouldShowNav = !NO_NAV_PAGES.some(page => pathname.startsWith(page))

  useEffect(() => {
    const supabase = createClient()
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Fetch user details from your database
        try {
          const response = await fetch('/api/user/me')
          if (response.ok) {
            const userData = await response.json()
            setCurrentUser(userData)
          } else {
            // Fallback to basic user info
            setCurrentUser({
              id: user.id,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              role: null
            })
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          // Fallback to basic user info
          setCurrentUser({
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            role: null
          })
        }
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          getUser()
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-white">Loading...</div>
      </div>
    )
  }

  // If no user is logged in or on pages that shouldn't show nav, render children without navigation
  if (!currentUser || !shouldShowNav) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <RoleBasedNavigation currentUser={currentUser} />
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
    </div>
  )
}
