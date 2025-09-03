import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// Get all pending applications
export async function GET() {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: { role: true },
    })

    if (!currentUser || !currentUser.role || (currentUser.role.name !== 'CEO' && currentUser.role.name !== 'Admin')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Fetch all pending applications
    const pendingApplications = await prisma.pendingUser.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ applications: pendingApplications })

  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Approve or reject an application
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: { role: true },
    })

    if (!currentUser || !currentUser.role || (currentUser.role.name !== 'CEO' && currentUser.role.name !== 'Admin')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { applicationId, action, roleId, managerId } = body

    console.log('🔄 Processing application:', { applicationId, action, roleId, managerId })

    if (!applicationId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return NextResponse.json(
        { error: 'Invalid action. Must be APPROVE or REJECT' },
        { status: 400 }
      )
    }

    // Get the pending application
    const pendingUser = await prisma.pendingUser.findUnique({
      where: { id: applicationId }
    })

    console.log('👤 Found pending user:', pendingUser)

    if (!pendingUser) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (pendingUser.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Application has already been processed' },
        { status: 400 }
      )
    }

    if (action === 'APPROVE') {
      if (!roleId) {
        return NextResponse.json(
          { error: 'Role ID is required for approval' },
          { status: 400 }
        )
      }

      // Use transaction to ensure both operations succeed or fail together
      console.log('🔄 Starting approval transaction...')
      await prisma.$transaction(async (tx) => {
        // Create the user in the main users table
        console.log('➕ Creating user in main table:', { 
          email: pendingUser.email, 
          name: pendingUser.name, 
          roleId, 
          managerId,
          skills: pendingUser.skills,
          bio: pendingUser.bio,
          employeeId: pendingUser.employeeId,
          location: pendingUser.location,
          profilePictureUrl: pendingUser.profilePictureUrl
        })
        const newUser = await tx.user.create({
          data: {
            email: pendingUser.email,
            name: pendingUser.name,
            roleId,
            managerId: managerId || null,
            contactNumber: pendingUser.contactNumber,
            skills: pendingUser.skills,
            bio: pendingUser.bio,
            employeeId: pendingUser.employeeId,
            location: pendingUser.location,
            profilePictureUrl: pendingUser.profilePictureUrl,
            hireDate: new Date(), // Set hire date to current date (first login)
            status: 'ACTIVE', // Set user as active upon approval
          }
        })
        console.log('✅ User created successfully:', newUser.id)

        // Update the application status
        console.log('📝 Updating pending user status to APPROVED...')
        await tx.pendingUser.update({
          where: { id: applicationId },
          data: { status: 'APPROVED' }
        })
        console.log('✅ Pending user status updated')
      })
      console.log('✅ Transaction completed successfully')

      return NextResponse.json({
        success: true,
        message: 'Application approved and user created successfully'
      })

    } else {
      // Reject the application
      await prisma.pendingUser.update({
        where: { id: applicationId },
        data: { status: 'REJECTED' }
      })

      return NextResponse.json({
        success: true,
        message: 'Application rejected'
      })
    }

  } catch (error) {
    console.error('Error processing application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
