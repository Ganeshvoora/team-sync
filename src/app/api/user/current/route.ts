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

    // Get current user info
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
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

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update lastLoginAt timestamp
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { lastLoginAt: new Date() }
    })

    return NextResponse.json(currentUser)
  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
