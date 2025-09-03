import { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import EnhancedNavigation from '@/components/EnhancedNavigation'

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Find the user in our database
  const currentUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      role: true,
    },
  })

  if (!currentUser) {
    // This could be a new user signing up via invitation.
    // Redirect to a page to complete their profile.
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white flex">
      <EnhancedNavigation currentUser={currentUser} />
      <main className="flex-1 overflow-y-auto bg-white/5">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
