import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, contactNumber, skills, bio, location } = body

    // Find the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: name || currentUser.name,
        contactNumber: contactNumber || null,
        skills: skills || null,
        bio: bio || null,
        location: location || null,
      },
      include: {
        role: true,
        department: true,
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
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}