import { createClient } from '@/lib/supabase/server'
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function AdminApprovalsPage() {
  // Get current user using Supabase
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Find the user in our database by email
  const currentUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      role: true,
    },
  })

  if (!currentUser) {
    redirect('/login')
  }

  // Check if user is admin
  if (currentUser.role?.name !== 'ADMIN' && currentUser.role?.name !== 'CEO') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="relative p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">User Approvals</h1>
            <p className="text-orange-200">Review and approve pending user registrations</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-8">
            <div className="text-center py-12 text-orange-300">
              <svg className="w-16 h-16 mx-auto mb-4 text-orange-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium mb-2">User Approval System</h3>
              <p>The user approval interface will be implemented here.</p>
              <p className="text-sm text-orange-400 mt-2">This feature is coming soon!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}