import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all users with their relationships
    const users = await prisma.user.findMany({
      include: {
        role: true,
        department: true,
        manager: {
          select: {
            id: true,
            name: true,
            role: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Serialize users data to handle Decimal types
    const serializedUsers = users.map(user => ({
      ...user,
      department: user.department ? {
        ...user.department,
        budget: user.department.budget ? Number(user.department.budget) : null
      } : null
    }))

    return NextResponse.json(serializedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: { role: true }
    })

    if (!currentUser || (currentUser.role?.name !== 'Admin' && currentUser.role?.name !== 'CEO')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, employeeId, roleId, departmentId, managerId } = body

    if (!name || !email || !employeeId || !roleId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        employeeId,
        roleId,
        departmentId: departmentId || null,
        managerId: managerId || null,
        status: 'ACTIVE'
      },
      include: {
        role: true,
        department: true,
        manager: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(newUser)
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
