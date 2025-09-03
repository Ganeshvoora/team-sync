import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { randomBytes } from 'crypto'

const inviteSchema = z.object({
  email: z.string().email(),
  roleId: z.string(),
  managerId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the current user in our database
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: { role: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { email, roleId, managerId } = inviteSchema.parse(body)

    // Verify that the current user is authorized to invite (is a manager or has authority)
    const isAuthorized = currentUser.id === managerId || 
                        currentUser.role?.name === 'CEO' ||
                        currentUser.role?.name === 'Manager'

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Not authorized to send invitations' }, { status: 403 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        status: 'PENDING'
      }
    })

    if (existingInvitation) {
      return NextResponse.json({ error: 'Invitation already sent to this email' }, { status: 400 })
    }

    // Generate a unique token
    const token = randomBytes(32).toString('hex')
    
    // Create the invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        inviterId: currentUser.id,
        managerId,
        roleId,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'PENDING'
      },
      include: {
        role: true,
        inviter: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Here you would send an email with the invitation link
    // For now, we'll just log the invitation URL
    const invitationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/invite?token=${token}`
    console.log(`Invitation URL for ${email}: ${invitationUrl}`)

    // TODO: Send email with magic link
    // await sendInvitationEmail(email, invitationUrl, invitation.inviter.name)

    return NextResponse.json({
      id: invitation.id,
      email: invitation.email,
      status: invitation.status,
      role: invitation.role,
      createdAt: invitation.createdAt,
      invitationUrl // Return this for testing purposes
    })

  } catch (error) {
    console.error('Error creating invitation:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the current user in our database
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get invitations sent by this user
    const invitations = await prisma.invitation.findMany({
      where: {
        inviterId: currentUser.id
      },
      include: {
        role: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(invitations)

  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
