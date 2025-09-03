import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the current user and check if they're an admin
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: { role: true }
    })

    if (!currentUser || currentUser.role?.name !== 'Admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      name, 
      employeeId, 
      contactNumber, 
      skills, 
      bio, 
      location, 
      hireDate,
      roleId,
      departmentId,
      managerId 
    } = body

    // Validate that the target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { role: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If changing role, validate hierarchy (manager must have lower level)
    if (roleId && managerId) {
      const [newRole, potentialManager] = await Promise.all([
        prisma.role.findUnique({ where: { id: roleId } }),
        prisma.user.findUnique({ 
          where: { id: managerId },
          include: { role: true }
        })
      ])

      if (newRole && potentialManager?.role && potentialManager.role.level >= newRole.level) {
        return NextResponse.json(
          { error: 'Manager must have a higher role level than the user' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name
    if (employeeId !== undefined) updateData.employeeId = employeeId || null
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber || null
    if (skills !== undefined) updateData.skills = skills || null
    if (bio !== undefined) updateData.bio = bio || null
    if (location !== undefined) updateData.location = location || null
    if (hireDate !== undefined) updateData.hireDate = hireDate ? new Date(hireDate) : null
    if (roleId !== undefined) updateData.roleId = roleId || null
    if (departmentId !== undefined) updateData.departmentId = departmentId || null
    if (managerId !== undefined) updateData.managerId = managerId || null

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
        department: true,
        manager: {
          include: {
            role: true
          }
        },
        directReports: true,
        tasksAssignedToMe: true,
        tasksAssignedByMe: true
      },
    })

    // Serialize the user data to handle Decimal types
    const serializedUser = {
      ...updatedUser,
      department: updatedUser.department ? {
        ...updatedUser.department,
        budget: updatedUser.department.budget ? Number(updatedUser.department.budget) : null
      } : null
    }

    return NextResponse.json(serializedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
