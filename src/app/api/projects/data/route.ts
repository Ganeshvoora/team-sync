import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get current user using Supabase
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the user in our database by email
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: {
        role: true,
      },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all active managers for project assignment
    const managers = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        role: {
          name: {
            in: ['MANAGER', 'CEO', 'ADMIN']
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true
          }
        },
        department: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Get all departments
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            users: true,
            projects: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ managers, departments })
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
