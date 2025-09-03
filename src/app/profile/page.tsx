import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ProfileClient } from '@/components/ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Find the user in our database
  const dbUser = await prisma.user.findUnique({
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
        where: {
          status: {
            not: 'COMPLETED'
          }
        },
        orderBy: {
          dueDate: 'asc'
        }
      },
      tasksAssignedByMe: {
        where: {
          status: {
            not: 'COMPLETED'
          }
        },
        orderBy: {
          dueDate: 'asc'
        }
      }
    },
  })

  if (!dbUser) {
    redirect('/onboarding')
  }

  // Serialize the user data to handle Decimal types
  const currentUser = {
    ...dbUser,
    department: dbUser.department ? {
      ...dbUser.department,
      budget: dbUser.department.budget ? Number(dbUser.department.budget) : null
    } : null
  }

  return <ProfileClient currentUser={currentUser} />
}