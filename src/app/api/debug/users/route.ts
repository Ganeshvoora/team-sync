import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all users with their relationships
    const users = await prisma.user.findMany({
      include: {
        role: true,
        department: true,
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
      },
      orderBy: [
        { role: { level: 'desc' } },
        { name: 'asc' }
      ]
    })

    const userSummary = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role?.name,
      level: user.role?.level,
      department: user.department?.name,
      managerId: user.managerId,
      managerName: user.manager?.name,
      directReportsCount: user.directReports.length,
      directReportsNames: user.directReports.map(dr => dr.name)
    }))

    // Create potential edges
    const potentialEdges = users
      .filter(user => user.managerId)
      .map(user => ({
        id: `edge-${user.managerId}-${user.id}`,
        source: user.managerId,
        target: user.id,
        sourceUser: user.manager?.name,
        targetUser: user.name
      }))

    return NextResponse.json({
      totalUsers: users.length,
      users: userSummary,
      potentialEdges: potentialEdges,
      hierarchyCheck: {
        ceoCount: users.filter(u => (u.role?.level || 0) >= 100).length,
        managerCount: users.filter(u => (u.role?.level || 0) >= 50 && (u.role?.level || 0) < 100).length,
        employeeCount: users.filter(u => (u.role?.level || 0) < 50).length,
        withManagerCount: users.filter(u => u.managerId).length,
        withDirectReportsCount: users.filter(u => u.directReports.length > 0).length
      }
    })
  } catch (error) {
    console.error('Error in debug endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to fetch debug data' },
      { status: 500 }
    )
  }
}
