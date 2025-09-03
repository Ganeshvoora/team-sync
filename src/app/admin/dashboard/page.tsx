import { createClient } from '@/lib/supabase/server'
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function AdminDashboardPage() {
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

  // Fetch admin dashboard data
  const totalUsers = await prisma.user.count()
  const pendingUsers = await prisma.user.count({
    where: { status: 'PENDING_APPROVAL' }
  })
  const activeUsers = await prisma.user.count({
    where: { status: 'ACTIVE' }
  })
  const totalTasks = await prisma.task.count()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="relative p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-red-200">System administration and management overview</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-200">Total Users</p>
                  <p className="text-2xl font-bold text-white">{totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-500/20">
                  <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-200">Pending Approvals</p>
                  <p className="text-2xl font-bold text-white">{pendingUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-500/20">
                  <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-200">Active Users</p>
                  <p className="text-2xl font-bold text-white">{activeUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-500/20">
                  <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-200">Total Tasks</p>
                  <p className="text-2xl font-bold text-white">{totalTasks}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <a 
                  href="/admin/users" 
                  className="block p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-300 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    <div>
                      <p className="text-white font-medium">Manage Users</p>
                      <p className="text-red-200 text-sm">View and manage all users</p>
                    </div>
                  </div>
                </a>

                <a 
                  href="/admin/approvals" 
                  className="block p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-300 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-white font-medium">Pending Approvals</p>
                      <p className="text-red-200 text-sm">Review user approval requests</p>
                    </div>
                  </div>
                </a>

                <a 
                  href="/tasks" 
                  className="block p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-300 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <div>
                      <p className="text-white font-medium">Task Management</p>
                      <p className="text-red-200 text-sm">Oversee all team tasks</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">System Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">Database</span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-sm">Online</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">Task System</span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-sm">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">User Management</span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-sm">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">Notifications</span>
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-sm">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}