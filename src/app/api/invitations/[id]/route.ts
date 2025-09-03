import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: {
    id: string
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
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

    const invitationId = params.id

    // Find the invitation and verify ownership
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (invitation.inviterId !== currentUser.id) {
      return NextResponse.json({ error: 'Not authorized to cancel this invitation' }, { status: 403 })
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Cannot cancel this invitation' }, { status: 400 })
    }

    // Update the invitation status to cancelled
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'CANCELLED' }
    })

    return NextResponse.json({ message: 'Invitation cancelled successfully' })

  } catch (error) {
    console.error('Error cancelling invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
