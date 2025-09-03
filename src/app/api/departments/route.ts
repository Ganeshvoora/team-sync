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

    // Get all departments
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    })

    // Convert Decimal fields to numbers for client compatibility
    const serializedDepartments = departments.map(dept => ({
      ...dept,
      budget: dept.budget ? Number(dept.budget) : null
    }))

    return NextResponse.json(serializedDepartments)
  } catch (error) {
    console.error('Error fetching departments:', error)
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
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Create new department
    const newDepartment = await prisma.department.create({
      data: {
        name,
        description: description || ''
      }
    })

    // Convert Decimal fields to numbers for client compatibility
    const serializedDepartment = {
      ...newDepartment,
      budget: newDepartment.budget ? Number(newDepartment.budget) : null
    }

    return NextResponse.json(serializedDepartment)
  } catch (error) {
    console.error('Error creating department:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
