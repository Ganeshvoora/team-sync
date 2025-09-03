import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ManagementClient from '@/components/ManagementClient'

export default async function ManagementPage() {
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
      directReports: {
        include: {
          role: true,
          tasksAssignedToMe: {
            where: {
              status: {
                not: 'COMPLETED'
              }
            }
          }
        }
      }
    },
  })

  if (!currentUser) {
    redirect('/onboarding')
  }

  // Check if user is a manager (has direct reports or is CEO/Manager role)
  const isManager = currentUser.directReports.length > 0 || 
                   currentUser.role?.name === 'CEO' || 
                   currentUser.role?.name === 'Manager'

  if (!isManager) {
    redirect('/dashboard?error=access-denied')
  }

  // Get all users that this manager can potentially manage (for invitations)
  // This includes their entire downstream hierarchy
  const getAllDownstreamUsers = async (managerId: string): Promise<string[]> => {
    const directReports = await prisma.user.findMany({
      where: { managerId },
      select: { id: true }
    })
    
    let allDownstream = directReports.map(u => u.id)
    
    for (const report of directReports) {
      const subReports = await getAllDownstreamUsers(report.id)
      allDownstream = [...allDownstream, ...subReports]
    }
    
    return allDownstream
  }

  const downstreamUserIds = await getAllDownstreamUsers(currentUser.id)

  // Get all roles for invitation dropdown
  const roles = await prisma.role.findMany({
    orderBy: { level: 'asc' }
  })

  // Get pending invitations sent by this user
  const pendingInvitations = await prisma.invitation.findMany({
    where: {
      inviterId: currentUser.id,
      status: 'PENDING'
    },
    include: {
      role: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <ManagementClient 
      currentUser={currentUser}
      directReports={currentUser.directReports}
      roles={roles}
      pendingInvitations={pendingInvitations}
      downstreamUserIds={downstreamUserIds}
    />
  )
}
