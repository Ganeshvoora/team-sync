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
    
    // Fetch all users with their relationships
    const users = await prisma.user.findMany({
      include: {
        department: true,
        role: true,
        manager: {
          include: {
            role: true
          }
        },
        directReports: {
          include: {
            role: true
          }
        }
      }
    })

    // Debug information
    const debugInfo = {
      totalUsers: users.length,
      usersWithManagers: users.filter(u => u.managerId).length,
      usersWithoutManagers: users.filter(u => !u.managerId).length,
      userDetails: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        managerId: user.managerId,
        managerName: user.manager?.name,
        directReportsCount: user.directReports?.length || 0,
        role: user.role?.name,
        department: user.department?.name
      })),
      edges: users
        .filter(user => user.managerId)
        .map(user => ({
          id: `e-${user.managerId}-${user.id}`,
          source: user.managerId!,
          target: user.id,
          sourceName: users.find(u => u.id === user.managerId)?.name,
          targetName: user.name
        }))
    }
    
    return NextResponse.json(debugInfo)
    
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: 'Failed to fetch debug info' }, { status: 500 })
  }
}
