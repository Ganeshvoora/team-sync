import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Create a new table for pending applications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, contactNumber, skills, bio, employeeId, location, profilePictureUrl } = body

    // Validate required fields
    if (!email || !name || !contactNumber || !location) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, contactNumber, and location are required' },
        { status: 400 }
      )
    }

    // Check if user already exists in the main users table
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists in the system' },
        { status: 400 }
      )
    }

    // Check if there's already a pending application for this email
    const existingApplication = await prisma.pendingUser.findUnique({
      where: { email }
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Application already exists and is pending review' },
        { status: 400 }
      )
    }

    // Create the pending user application
    const pendingUser = await prisma.pendingUser.create({
      data: {
        email,
        name,
        contactNumber,
        skills: skills || null,
        bio: bio || null,
        employeeId: employeeId || null,
        location: location || null,
        profilePictureUrl: profilePictureUrl || null,
        status: 'PENDING'
      }
    })

    console.log('New user application created:', pendingUser)

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully'
    })

  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
