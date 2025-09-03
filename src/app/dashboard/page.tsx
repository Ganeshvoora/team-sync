import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/DashboardClient'

export default async function DashboardPage() {
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
      department: true,
      manager: {
        include: {
          role: true,
        },
      },
      directReports: {
        include: {
          role: true,
        },
      },
      tasksAssignedToMe: {
        include: {
          assigner: {
            include: {
              role: true,
            },
          },
        },
      },
    },
  })

  if (!currentUser) {
    // User authenticated via Supabase but not in our database yet
    // Redirect to profile creation/onboarding
    redirect('/onboarding')
  }

  // Get recent tasks (active tasks)
  const recentTasks = currentUser.tasksAssignedToMe
    .filter(task => task.status !== 'COMPLETED')
    .map(task => ({
      ...task,
      status: task.status as 'TODO' | 'IN_PROGRESS' | 'DONE',
      assigner: {
        ...task.assigner,
        role: {
          name: task.assigner.role!.name
        }
      }
    }))

  // Get team members (direct reports and peers)
  let teamMembers: any[] = []
  
  // Add direct reports
  if (currentUser.directReports.length > 0) {
    teamMembers = [...teamMembers, ...currentUser.directReports]
  }

  // Add peers (co-workers with same manager)
  if (currentUser.managerId) {
    const peers = await prisma.user.findMany({
      where: {
        managerId: currentUser.managerId,
        id: { not: currentUser.id },
        status: 'ACTIVE'
      },
      include: {
        role: true,
        department: true
      },
    })
    teamMembers = [...teamMembers, ...peers]
  }

  // Get pending invitations (if user can manage teams)
  let invitations: any[] = []
  if ((currentUser.role?.level && currentUser.role.level >= 50) || currentUser.role?.name === 'Admin' || currentUser.role?.name === 'CEO') {
    invitations = await prisma.invitation.findMany({
      where: {
        inviterId: currentUser.id,
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  return (
    <DashboardClient
      currentUser={currentUser}
      recentTasks={recentTasks}
      teamMembers={teamMembers}
      invitations={invitations}
    />
  )
}