import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user from database
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId: currentUser.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to recent 50 notifications
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user from database
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { notificationId, markAsRead } = body

    if (markAsRead && notificationId) {
      // Mark specific notification as read
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId: currentUser.id // Ensure user can only mark their own notifications
        },
        data: {
          isRead: true
        }
      })
    } else if (markAsRead) {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: currentUser.id,
          isRead: false
        },
        data: {
          isRead: true
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
