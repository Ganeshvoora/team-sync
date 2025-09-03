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

    // Get all roles
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: { level: 'desc' }
    })

    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
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
    const { name, description, level } = body

    if (!name || !description || level === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create new role
    const newRole = await prisma.role.create({
      data: {
        name,
        description,
        level: parseInt(level)
      }
    })

    return NextResponse.json(newRole)
  } catch (error) {
    console.error('Error creating role:', error)
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
    const { id, name, description, level } = body

    if (!id || !name || !description || level === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id }
    })

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // Update role
    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        level: parseInt(level)
      }
    })

    return NextResponse.json(updatedRole)
  } catch (error) {
    console.error('Error updating role:', error)
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
    const roleId = searchParams.get('id')

    if (!roleId) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 })
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId }
    })

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // Check if role is being used by any users
    const usersWithRole = await prisma.user.findMany({
      where: { roleId: roleId }
    })

    if (usersWithRole.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete role. It is currently assigned to users.' 
      }, { status: 400 })
    }

    // Delete role
    await prisma.role.delete({
      where: { id: roleId }
    })

    return NextResponse.json({ message: 'Role deleted successfully' })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}