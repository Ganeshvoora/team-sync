import { createClient } from '@/lib/supabase/server'
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import StatsClient from '@/components/StatsClient'
import ThemeToggle from '@/components/ThemeToggle'

export default async function StatsPage() {
  // Get current user using Supabase
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Find the user in our database by email with their team members
  const currentUser = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      role: true,
      directReports: {
        include: {
          role: true,
          department: true
        }
      },
    },
  })

  if (!currentUser) {
    redirect('/login')
  }

  // Get date ranges for different periods
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 7)
  
  const biweekStart = new Date(now)
  biweekStart.setDate(now.getDate() - 14)
  
  const monthStart = new Date(now)
  monthStart.setMonth(now.getMonth() - 1)

  // Determine which users to include in stats based on role
  const teamMemberIds = []
  let allMembers = []
  
  // If admin or CEO, fetch all users
  if (currentUser.role?.name === 'ADMIN' || currentUser.role?.name === 'CEO') {
    // Get all active users for admin view
    allMembers = await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      include: {
        role: true,
        manager: {
          select: {
            id: true,
            name: true,
          }
        },
        directReports: {
          select: {
            id: true
          }
        },
        department: true,
      },
      orderBy: { name: 'asc' }
    })
    
    teamMemberIds.push(...allMembers.map(user => user.id))
  } else {
    // Always include self for non-admin roles
    teamMemberIds.push(currentUser.id)
    
    // Add direct reports if they exist
    if (currentUser.directReports && currentUser.directReports.length > 0) {
      teamMemberIds.push(...currentUser.directReports.map(user => user.id))
    }
    
    // For non-admins, use only self and direct reports
    allMembers = [
      currentUser, 
      ...(currentUser.directReports || [])
    ]
  }
  
  // Get task statistics by period
  const weeklyTaskStats = await prisma.task.groupBy({
    by: ['status'],
    where: {
      assigneeId: { in: teamMemberIds },
      createdAt: { gte: weekStart }
    },
    _count: true
  })
  
  const biweeklyTaskStats = await prisma.task.groupBy({
    by: ['status'],
    where: {
      assigneeId: { in: teamMemberIds },
      createdAt: { gte: biweekStart }
    },
    _count: true
  })
  
  const monthlyTaskStats = await prisma.task.groupBy({
    by: ['status'],
    where: {
      assigneeId: { in: teamMemberIds },
      createdAt: { gte: monthStart }
    },
    _count: true
  })
  
  // Get individual team member stats with type compatibility
  const teamMemberStats = await Promise.all(allMembers.map(async (member) => {
    const completedTasks = await prisma.task.count({
      where: {
        assigneeId: member.id,
        status: 'COMPLETED'
      }
    })
    
    const totalTasks = await prisma.task.count({
      where: {
        assigneeId: member.id
      }
    })
    
    const inProgressTasks = await prisma.task.count({
      where: {
        assigneeId: member.id,
        status: 'IN_PROGRESS'
      }
    })
    
    const notStartedTasks = await prisma.task.count({
      where: {
        assigneeId: member.id,
        status: 'NOT_STARTED'
      }
    })
    
    // Create a compatible structure for StatsClient
    return {
      user: {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role ? { name: member.role.name } : undefined,
        department: { name: 'General' },
        manager: undefined
      },
      stats: {
        completed: completedTasks,
        inProgress: inProgressTasks,
        notStarted: notStartedTasks,
        total: totalTasks
      }
    }
  }))
  
  // Calculate overall team stats
  const overallTeamStats = {
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    total: 0
  }
  
  // Sum up all individual stats for team totals
  teamMemberStats.forEach(memberStat => {
    overallTeamStats.completed += memberStat.stats.completed
    overallTeamStats.inProgress += memberStat.stats.inProgress
    overallTeamStats.notStarted += memberStat.stats.notStarted
    overallTeamStats.total += memberStat.stats.total
  })
  
  // Check if user is admin or CEO
  const isAdmin = currentUser.role?.name === 'ADMIN' || currentUser.role?.name === 'CEO'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEwMCwgMTAwLCAxMDAsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20 dark:opacity-10"></div>
      
      <div className="relative p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Statistics Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Team performance and analytics overview</p>
            </div>
            <ThemeToggle />
          </div>
          
          <StatsClient
            currentUser={currentUser}
            teamMemberStats={teamMemberStats}
            weeklyTaskStats={weeklyTaskStats}
            biweeklyTaskStats={biweeklyTaskStats}
            monthlyTaskStats={monthlyTaskStats}
            teamStats={overallTeamStats}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </div>
  )
}
