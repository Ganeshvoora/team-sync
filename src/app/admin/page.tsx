import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import AdminLayout from '@/components/AdminLayout'
import LogoutButton from '@/components/LogoutButton'
import UserEditForm from '@/components/UserEditForm'
import ApplicationCard from '@/components/ApplicationCard'
import { User, Role, Department, PendingApplication } from './types'
import Link from 'next/link'

/**
 * Server Action to update a user's role
 */
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

/**
 * Server Action to update a user's manager
 */
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

/**
 * Server Action to update a user's department
 */
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
  // Authentication check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login/admin')
  }

  // Check if user has admin privileges
  const currentUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: { role: true },
  })

  // Show access denied if not an admin or CEO
  if (!currentUser?.role || (currentUser.role.name !== 'CEO' && currentUser.role.name !== 'Admin')) {
    return <AccessDeniedView />
  }

  // Fetch data needed for the admin panel
  const [allUsersRaw, allRoles, allDepartments, pendingApplications] = await Promise.all([
    // Get all users with their roles, departments and managers
    prisma.user.findMany({
      include: {
        role: true,
        department: true,
        manager: {
          include: { role: true },
        },
      },
      orderBy: [
        { role: { level: 'asc' } },
        { name: 'asc' },
      ],
    }),
    
    // Get all roles
    prisma.role.findMany({
      orderBy: { level: 'asc' },
    }),
    
    // Get all departments
    prisma.department.findMany({
      orderBy: { name: 'asc' },
    }),
    
    // Get pending applications
    prisma.pendingUser.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' }
    })
  ])

  // Transform user data to handle null checks and ensure type compatibility
  const allUsers = allUsersRaw
    .filter(user => user.role && user.roleId)
    .map(user => ({
      ...user,
      roleId: user.roleId!,
      role: user.role!,
      manager: user.manager && user.manager.role ? {
        ...user.manager,
        role: user.manager.role
      } : null
    }))

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Manage users and applications">
      {/* Pending Applications Section */}
      {pendingApplications.length > 0 && (
        <PendingApplicationsSection
          applications={pendingApplications}
          allRoles={allRoles}
          allUsers={allUsers}
        />
      )}

      {/* Users Management Section */}
      <UsersManagementSection
        allUsers={allUsers}
        allRoles={allRoles}
        allDepartments={allDepartments}
        updateUserRole={updateUserRole}
        updateUserManager={updateUserManager}
        updateUserDepartment={updateUserDepartment}
      />
    </AdminLayout>
  )
}

// Component for the access denied view
function AccessDeniedView() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">You do not have permission to access the admin portal.</p>
        <div className="space-x-4">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Back to Dashboard
          </Link>
          <Link 
            href="/login/admin" 
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Admin Login
          </Link>
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

// Component for pending applications section
interface PendingApplicationsSectionProps {
  applications: PendingApplication[];
  allRoles: Role[];
  allUsers: User[];
}

function PendingApplicationsSection({ 
  applications, 
  allRoles, 
  allUsers 
}: PendingApplicationsSectionProps) {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-white/20 dark:border-gray-700/20">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Applications</h2>
            <span className="ml-auto bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 text-yellow-800 dark:text-yellow-100 text-xs font-medium px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-800">
              {applications.length} pending
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            New user applications awaiting approval
          </p>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {applications.map((application: PendingApplication) => (
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
  )
}

// Component for users management section
interface UsersManagementSectionProps {
  allUsers: User[];
  allRoles: Role[];
  allDepartments: Department[];
  updateUserRole: (formData: FormData) => Promise<void>;
  updateUserManager: (formData: FormData) => Promise<void>;
  updateUserDepartment: (formData: FormData) => Promise<void>;
}

function UsersManagementSection({ 
  allUsers, 
  allRoles, 
  allDepartments, 
  updateUserRole, 
  updateUserManager, 
  updateUserDepartment 
}: UsersManagementSectionProps) {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-white/20 dark:border-gray-700/20">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Users</h2>
            <span className="ml-auto bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-800 dark:text-blue-100 text-xs font-medium px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              {allUsers.length} users
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage user roles and reporting relationships
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Current Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Current Manager
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-gray-100 dark:divide-gray-700">
              {allUsers.map((user: User) => (
                <tr key={user.id} className="hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-medium text-sm">
                            {user.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                      {user.role?.name || 'No Role'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.department ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700">
                        {user.department.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                        No Department
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {user.manager ? (
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{user.manager.name}</div>
                        <div className="text-gray-500 dark:text-gray-400">({user.manager.role?.name || 'No Role'})</div>
                      </div>
                    ) : (
                      <span className="italic text-gray-400 dark:text-gray-500">No manager</span>
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
  )
}
