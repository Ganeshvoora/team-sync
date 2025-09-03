import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
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
    const { subject, content, recipientId } = body

    // For now, we'll create a notification as a message system
    // In a full implementation, you might want a separate Message model
    const notification = await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'SYSTEM',
        title: `Message: ${subject}`,
        message: `From ${currentUser.name}: ${content}`,
      }
    })

    return NextResponse.json({ success: true, message: 'Message sent successfully' })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    // Get user's notifications (messages)
    const notifications = await prisma.notification.findMany({
      where: {
        userId: currentUser.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
