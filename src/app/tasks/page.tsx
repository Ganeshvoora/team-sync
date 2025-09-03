import { createClient } from '@/lib/supabase/server'
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import TasksClient from "@/components/TasksClient"

export default async function TasksPage() {
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
      directReports: {
        include: {
          role: true,
          department: true,
        },
      },
      department: {
        include: {
          users: {
            include: {
              role: true,
            },
          },
        },
      },
    },
  })

  if (!currentUser) {
    redirect('/login')
  }

  // Fetch tasks from database with related data
  const tasks = await prisma.task.findMany({
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      assigner: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      project: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Check if user can create tasks (everyone can create tasks now, including self-assignment)
  const canCreateTasks = true

  // Get team members user can assign tasks to (hierarchical rules)
  let teamMembers: any[] = []
  
  if (currentUser.role?.name === 'ADMIN' || currentUser.role?.name === 'CEO') {
    // Admins and CEOs can assign to anyone
    teamMembers = await prisma.user.findMany({
      where: { status: 'ACTIVE' },
      include: {
        role: true,
        department: true,
      },
      orderBy: { name: 'asc' }
    })
  } else if (currentUser.role?.name === 'MANAGER') {
    // Managers can assign to their direct reports and themselves only
    const directReports = currentUser.directReports || []
    const memberIds = new Set([
      currentUser.id, // Include self
      ...directReports.map(u => u.id)
    ])
    
    teamMembers = await prisma.user.findMany({
      where: { 
        id: { in: Array.from(memberIds) },
        status: 'ACTIVE'
      },
      include: {
        role: true,
        department: true,
      },
      orderBy: { name: 'asc' }
    })
  } else {
    // Regular employees can only assign to themselves (no co-employees or seniors)
    teamMembers = await prisma.user.findMany({
      where: { 
        id: currentUser.id, // Only self-assignment
        status: 'ACTIVE'
      },
      include: {
        role: true,
        department: true,
      }
    })
  }

  return (
    <TasksClient 
      currentUser={currentUser}
      tasks={tasks}
      canCreateTasks={canCreateTasks}
      teamMembers={teamMembers}
    />
  )
}
