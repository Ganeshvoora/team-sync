import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if the user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get the current user's profile with direct reports
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: {
        role: true,
        directReports: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                name: true,
                level: true
              }
            },
            department: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })
    
    if (!currentUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }
    
    // Create assignable users list: current user + direct reports
    const assignableUsers = [
      {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        department: currentUser.department,
        isSelf: true
      },
      ...currentUser.directReports.map(report => ({
        ...report,
        isSelf: false
      }))
    ]
    
    return NextResponse.json({
      users: assignableUsers
    })
    
  } catch (error) {
    console.error('Error fetching assignable users:', error)
    return NextResponse.json({ error: 'Failed to fetch assignable users' }, { status: 500 })
  }
}
