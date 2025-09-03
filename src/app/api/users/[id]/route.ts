import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const userId = params.id

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: body,
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

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
