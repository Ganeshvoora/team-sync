import { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

interface AdminLayoutProps {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login/admin')
  }

  // Find the user in our database
  const currentUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      role: true,
    },
  })

  if (!currentUser) {
    redirect('/login/admin')
  }

  // Check if user has admin privileges
  if (!currentUser.role || (currentUser.role.name !== 'CEO' && currentUser.role.name !== 'Admin')) {
    redirect('/dashboard') // Redirect non-admin users to dashboard
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  )
}
