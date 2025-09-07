import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import AdminLayout from '@/components/AdminLayout'
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
    <AdminLayout title="User Approvals" subtitle="Admin Panel">
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
    </AdminLayout>
  )
}