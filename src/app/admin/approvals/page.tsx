import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import PageHeader from '@/components/PageHeader'
import { User, Role, PendingApplication } from '../types'
import { AccessDeniedView, NoApplicationsView, PendingApplicationsSection } from './components'

/**
 * Server Action to approve a user application
 */
async function approveApplication(formData: FormData) {
  'use server'
  
  const applicationId = formData.get('applicationId') as string
  const roleId = formData.get('roleId') as string
  const managerId = formData.get('managerId') as string
  
  // Get the application details
  const application = await prisma.pendingUser.findUnique({
    where: { id: applicationId }
  })
  
  if (!application) {
    throw new Error('Application not found')
  }
  
  // Create a new user from the application
  await prisma.user.create({
    data: {
      email: application.email,
      name: application.name,
      roleId,
      managerId: managerId === 'null' ? null : managerId,
      // Add other fields as needed
    }
  })
  
  // Update the application status to APPROVED
  await prisma.pendingUser.update({
    where: { id: applicationId },
    data: { status: 'APPROVED' }
  })
  
  revalidatePath('/admin/approvals')
}

/**
 * Server Action to reject a user application
 */
async function rejectApplication(formData: FormData) {
  'use server'
  
  const applicationId = formData.get('applicationId') as string
  
  // Update the application status to REJECTED
  await prisma.pendingUser.update({
    where: { id: applicationId },
    data: { status: 'REJECTED' }
  })
  
  revalidatePath('/admin/approvals')
}

export default async function AdminApprovalsPage() {
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

  // Fetch data needed for the approvals page
  const [allUsers, allRoles, pendingApplications] = await Promise.all([
    // Get all users for potential manager assignment
    prisma.user.findMany({
      include: {
        role: true,
      },
      orderBy: [
        { role: { level: 'asc' } },
        { name: 'asc' },
      ],
    }),
    
    // Get all roles for role assignment
    prisma.role.findMany({
      orderBy: { level: 'asc' },
    }),
    
    // Get pending applications
    prisma.pendingUser.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  // Transform user data to ensure type compatibility
  // Transform database users to match our User interface type
  const typedUsers = allUsers
    .filter(user => user.role && user.roleId)
    .map(user => ({
      ...user,
      roleId: user.roleId!,
      role: user.role!,
      department: null,  // Add missing properties to match User type
      manager: null
    })) as User[];

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-slate-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDIzOSwgNjgsIDY4LCAwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30 dark:opacity-10"></div>
      
      <div className="relative max-w-7xl mx-auto py-6">
        <PageHeader title="User Approvals" subtitle="Admin Panel" />
        
        {/* Main content */}
        <div className="mt-8">
          {pendingApplications.length > 0 ? (
            <PendingApplicationsSection 
              applications={pendingApplications as PendingApplication[]}
              allRoles={allRoles as Role[]}
              allUsers={typedUsers}
              approveApplication={approveApplication}
              rejectApplication={rejectApplication}
            />
          ) : (
            <NoApplicationsView />
          )}
        </div>
        
        {/* Navigation back to admin dashboard */}
        <div className="mt-10 flex justify-end">
          <a 
            href="/admin" 
            className="inline-flex items-center px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}