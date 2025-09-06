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

    // Get all departments with user count
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
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
    const { name, description, budget } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Create new department
    const newDepartment = await prisma.department.create({
      data: {
        name,
        description: description || '',
        budget: budget !== null ? budget : null
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

export async function PUT(request: NextRequest) {
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
    const { id, name, description, budget } = body

    if (!id || !name) {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 })
    }

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id }
    })

    if (!existingDepartment) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    // Update department
    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: {
        name,
        description: description || '',
        budget: budget !== null ? budget : null
      }
    })

    // Convert Decimal fields to numbers for client compatibility
    const serializedDepartment = {
      ...updatedDepartment,
      budget: updatedDepartment.budget ? Number(updatedDepartment.budget) : null
    }

    return NextResponse.json(serializedDepartment)
  } catch (error) {
    console.error('Error updating department:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('id')

    if (!departmentId) {
      return NextResponse.json({ error: 'Department ID is required' }, { status: 400 })
    }

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id: departmentId }
    })

    if (!existingDepartment) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    // Check if department is being used by any users
    const usersInDepartment = await prisma.user.findMany({
      where: { departmentId }
    })

    if (usersInDepartment.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete department. It is currently assigned to users.' 
      }, { status: 400 })
    }

    // Check if department has roles assigned
    const rolesInDepartment = await prisma.role.findMany({
      where: { departmentId }
    })

    if (rolesInDepartment.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete department. It has roles assigned to it.' 
      }, { status: 400 })
    }

    // Delete department
    await prisma.department.delete({
      where: { id: departmentId }
    })

    return NextResponse.json({ message: 'Department deleted successfully' })
  } catch (error) {
    console.error('Error deleting department:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
