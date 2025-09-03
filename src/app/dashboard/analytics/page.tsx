import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import AnalyticsClient from '@/components/AnalyticsClient'

export default async function AnalyticsPage() {
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
      department: true,
    },
  })

  if (!currentUser) {
    redirect('/onboarding')
  }

  // Get analytics data
  const analytics = await getAnalyticsData(currentUser)

  return (
    <AdminLayout title="Analytics">
      <AnalyticsClient analytics={analytics} currentUser={currentUser} />
    </AdminLayout>
  )
}

async function getAnalyticsData(currentUser: any) {
  const isAdmin = currentUser.role?.name === 'Admin' || currentUser.role?.name === 'CEO'
  
  // Basic stats
  const totalUsers = await prisma.user.count({
    where: isAdmin ? {} : { departmentId: currentUser.departmentId }
  })
  
  const totalTasks = await prisma.task.count({
    where: isAdmin ? {} : {
      OR: [
        { assigneeId: currentUser.id },
        { assignerId: currentUser.id },
        { assignee: { departmentId: currentUser.departmentId } }
      ]
    }
  })
  
  const completedTasks = await prisma.task.count({
    where: {
      status: 'COMPLETED',
      ...(isAdmin ? {} : {
        OR: [
          { assigneeId: currentUser.id },
          { assignerId: currentUser.id },
          { assignee: { departmentId: currentUser.departmentId } }
        ]
      })
    }
  })

  const departments = await prisma.department.count()

  return {
    totalUsers,
    totalTasks,
    completedTasks,
    departments,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }
}
