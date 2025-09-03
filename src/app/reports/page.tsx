import { createClient } from '@/lib/supabase/server'
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ReportsClient from "@/components/ReportsClient"

export default async function ReportsPage() {
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
      manager: {
        include: {
          role: true,
        },
      },
    },
  })

  if (!currentUser) {
    redirect('/login')
  }

  // Check if user can access reports (managers and above)
  const canAccessReports = currentUser.role?.name === 'ADMIN' || 
                          currentUser.role?.name === 'CEO' || 
                          currentUser.role?.name === 'MANAGER'

  if (!canAccessReports) {
    redirect('/dashboard')
  }

  // Fetch analytics data
  const [
    totalUsers,
    totalProjects,
    totalTasks,
    completedTasks,
    departments,
    projectStats,
    taskStats
  ] = await Promise.all([
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.project.count(),
    prisma.task.count(),
    prisma.task.count({ where: { status: 'COMPLETED' } }),
    prisma.department.findMany({
      include: {
        _count: {
          select: {
            users: true,
            projects: true
          }
        }
      }
    }),
    prisma.project.findMany({
      include: {
        _count: {
          select: {
            tasks: true
          }
        },
        tasks: {
          select: {
            status: true
          }
        },
        manager: {
          select: {
            name: true
          }
        },
        department: {
          select: {
            name: true
          }
        }
      }
    }),
    prisma.task.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })
  ])

  const analyticsData = {
    overview: {
      totalUsers,
      totalProjects,
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    },
    departments,
    projectStats,
    taskStats
  }

  return (
    <ReportsClient 
      currentUser={currentUser}
      analyticsData={analyticsData}
    />
  )
}
