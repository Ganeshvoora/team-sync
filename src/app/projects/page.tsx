import { createClient } from '@/lib/supabase/server'
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProjectsClient from "@/components/ProjectsClient"

export default async function ProjectsPage() {
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

  // Fetch projects from database with related data
  const projects = await prisma.project.findMany({
    include: {
      manager: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      department: {
        select: {
          id: true,
          name: true
        }
      },
      tasks: {
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Check if user can create projects (managers and above)
  const canCreateProjects = currentUser.role?.name === 'ADMIN' || 
                           currentUser.role?.name === 'CEO' || 
                           currentUser.role?.name === 'MANAGER'

  return (
    <ProjectsClient 
      currentUser={currentUser}
      projects={projects}
      canCreateProjects={canCreateProjects}
    />
  )
}
