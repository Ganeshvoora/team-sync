import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
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

    // Check if user can create projects (managers and above)
    const canCreateProjects = currentUser.role?.name === 'ADMIN' || 
                             currentUser.role?.name === 'CEO' || 
                             currentUser.role?.name === 'MANAGER'

    if (!canCreateProjects) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { name, description, managerId, departmentId, budget, startDate, endDate } = await request.json()

    if (!name || !managerId || !departmentId) {
      return NextResponse.json({ error: 'Name, manager, and department are required' }, { status: 400 })
    }

    // Verify manager exists
    const manager = await prisma.user.findUnique({
      where: { id: managerId }
    })

    if (!manager) {
      return NextResponse.json({ error: 'Manager not found' }, { status: 404 })
    }

    // Verify department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    })

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    // Create the project
    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        managerId,
        departmentId,
        budget: budget ? parseFloat(budget) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: 'PLANNING'
      },
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
      }
    })

    return NextResponse.json({ project: newProject })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
