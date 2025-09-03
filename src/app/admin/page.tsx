import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import LogoutButton from '@/components/LogoutButton'
import UserEditForm from '@/components/UserEditForm'
import ApplicationCard from '@/components/ApplicationCard'

// Server Actions
async function updateUserRole(formData: FormData) {
  'use server'
  
  const userId = formData.get('userId') as string
  const roleId = formData.get('roleId') as string
  
  await prisma.user.update({
    where: { id: userId },
    data: { roleId },
  })
  
  revalidatePath('/admin')
}

async function updateUserManager(formData: FormData) {
  'use server'
  
  const userId = formData.get('userId') as string
  const managerId = formData.get('managerId') as string
  
  await prisma.user.update({
    where: { id: userId },
    data: { managerId: managerId === 'null' ? null : managerId },
  })
  
  revalidatePath('/admin')
}

async function updateUserDepartment(formData: FormData) {
  'use server'
  
  const userId = formData.get('userId') as string
  const departmentId = formData.get('departmentId') as string
  
  await prisma.user.update({
    where: { id: userId },
    data: { departmentId: departmentId === 'null' ? null : departmentId },
  })
  
  revalidatePath('/admin')
}

export default async function AdminPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login/admin')
  }

  // Check if user is admin (CEO role)
  const currentUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      role: true,
    },
  })

  if (!currentUser || !currentUser.role || (currentUser.role.name !== 'CEO' && currentUser.role.name !== 'Admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You do not have permission to access the admin portal.</p>
          <div className="space-x-4">
            <a 
              href="/dashboard" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Dashboard
            </a>
            <a 
              href="/login/admin" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Admin Login
            </a>
            <LogoutButton />
          </div>
        </div>
      </div>
    )
  }

  // Fetch all users, roles, and departments
  const allUsersRaw = await prisma.user.findMany({
    include: {
      role: true,
      department: true,
      manager: {
        include: {
          role: true,
        },
      },
    },
    orderBy: [
      { role: { level: 'asc' } },
      { name: 'asc' },
    ],
  })

  // Transform data to handle null checks and type compatibility
  const allUsers = allUsersRaw
    .filter(user => user.role && user.roleId) // Only include users with roles and roleId
    .map(user => ({
      ...user,
      roleId: user.roleId!, // Ensure roleId is not null
      role: user.role!,
      manager: user.manager && user.manager.role ? {
        ...user.manager,
        role: user.manager.role
      } : null
    }))

  const allRoles = await prisma.role.findMany({
    orderBy: { level: 'asc' },
  })

  const allDepartments = await prisma.department.findMany({
    orderBy: { name: 'asc' },
  })

  // Fetch pending applications
  const pendingApplications = await prisma.pendingUser.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIzOSwgNjgsIDY4LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
      
      <div className="relative max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Admin Portal</h1>
                <p className="text-lg text-gray-600">Manage team hierarchy and user applications</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/dashboard" 
                className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-sm font-medium rounded-xl text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5l4-4 4 4M8 19l4 4 4-4" />
                </svg>
                Dashboard
              </a>
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Pending Applications Section */}
        {pendingApplications.length > 0 && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-white/20">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Pending Applications</h2>
                  <span className="ml-auto bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full border border-yellow-200">
                    {pendingApplications.length} pending
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  New user applications awaiting approval
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {pendingApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    allRoles={allRoles}
                    allUsers={allUsers}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-white/20">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
                <span className="ml-auto bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full border border-blue-200">
                  {allUsers.length} users
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Manage user roles and reporting relationships
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Current Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Current Manager
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-gray-100">
                  {allUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/80 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                              <span className="text-white font-medium text-sm">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                          {user.role?.name || 'No Role'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.department ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                            {user.department.name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-300">
                            No Department
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.manager ? (
                          <div>
                            <div className="font-medium text-gray-900">{user.manager.name}</div>
                            <div className="text-gray-500">({user.manager.role?.name || 'No Role'})</div>
                          </div>
                        ) : (
                          <span className="italic text-gray-400">No manager</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <UserEditForm
                          user={user}
                          allRoles={allRoles}
                          allUsers={allUsers}
                          allDepartments={allDepartments}
                          updateUserRole={updateUserRole}
                          updateUserManager={updateUserManager}
                          updateUserDepartment={updateUserDepartment}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
