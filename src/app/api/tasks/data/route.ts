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

    // Get all active users for task assignment
    const users = await prisma.user.findMany({
      where: {
        status: 'ACTIVE'
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

    // Also get projects for task assignment
    const projects = await prisma.project.findMany({
      where: {
        status: {
          in: ['PLANNING', 'ACTIVE']
        }
      },
      select: {
        id: true,
        name: true,
        status: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ users, projects })
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
