import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Org chart API called')
    
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log('No authenticated user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', user.email)

    // Find the current user in our database
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: {
        role: true,
        manager: true
      }
    })

    if (!currentUser) {
      console.log('User not found in database:', user.email)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('Current user found:', currentUser.name)

    // Get all visible users based on "Fog of War" rules and admin privileges
    const getVisibleUsers = async (userId: string, userRole: any) => {
      const visibleUserIds = new Set<string>()
      
      // If user is Admin or CEO, they can see everyone
      if (userRole?.name === 'Admin' || userRole?.name === 'CEO') {
        const allUsers = await prisma.user.findMany({
          where: { status: 'ACTIVE' },
          select: { id: true }
        })
        return allUsers.map(u => u.id)
      }
      
      // Add current user
      visibleUserIds.add(userId)
      
      // Get the current user's complete hierarchy path up to CEO
      const getManagerChain = async (managerId: string | null): Promise<string[]> => {
        if (!managerId) return []
        const manager = await prisma.user.findUnique({
          where: { id: managerId },
          select: { id: true, managerId: true }
        })
        if (!manager) return []
        return [manager.id, ...await getManagerChain(manager.managerId)]
      }
      
      // Add all managers up the chain (See Up)
      const managerChain = await getManagerChain(currentUser.managerId)
      managerChain.forEach(id => visibleUserIds.add(id))
      
      // Get all peers (users with the same manager) (See Across)
      if (currentUser.managerId) {
        const peers = await prisma.user.findMany({
          where: {
            managerId: currentUser.managerId,
            status: 'ACTIVE'
          },
          select: { id: true }
        })
        peers.forEach(peer => visibleUserIds.add(peer.id))
      }
      
      // Get all downstream users (See Down - Own Team Only)
      const getAllDownstream = async (managerId: string): Promise<string[]> => {
        const directReports = await prisma.user.findMany({
          where: { 
            managerId,
            status: 'ACTIVE' 
          },
          select: { id: true }
        })
        
        let allDownstream = directReports.map(u => u.id)
        
        for (const report of directReports) {
          const subReports = await getAllDownstream(report.id)
          allDownstream = [...allDownstream, ...subReports]
        }
        
        return allDownstream
      }
      
      const downstreamUsers = await getAllDownstream(currentUser.id)
      downstreamUsers.forEach(id => visibleUserIds.add(id))
      
      return Array.from(visibleUserIds)
    }

    const visibleUserIds = await getVisibleUsers(currentUser.id, currentUser.role)

    // Fetch only visible users with their relationships
    const users = await prisma.user.findMany({
      where: {
        id: { in: visibleUserIds },
        status: 'ACTIVE'
      },
      include: {
        role: true,
        department: true,
        manager: {
          include: {
            role: true,
            department: true
          }
        },
        directReports: {
          where: {
            id: { in: visibleUserIds } // Only show visible direct reports
          },
          include: {
            role: true,
            department: true
          }
        }
      },
      orderBy: [
        { role: { level: 'desc' } },
        { name: 'asc' }
      ]
    })

    // Helper function to check if a user is in the downstream hierarchy
    async function isUserInDownstreamHierarchy(managerId: string, targetUserId: string): Promise<boolean> {
      const directReports = await prisma.user.findMany({
        where: { managerId },
        select: { id: true }
      })
      
      if (directReports.some(report => report.id === targetUserId)) {
        return true
      }
      
      for (const report of directReports) {
        if (await isUserInDownstreamHierarchy(report.id, targetUserId)) {
          return true
        }
      }
      
      return false
    }

    // Check downstream relationships for each user
    const downstreamMap: Record<string, boolean> = {}
    for (const user of users) {
      downstreamMap[user.id] = await isUserInDownstreamHierarchy(currentUser.id, user.id)
    }

    // Transform users into org chart nodes and edges
    const nodes = users.map((user, index) => {
      // Calculate position based on hierarchy
      const roleLevel = user.role?.level || 0
      let x = 0
      let y = 0

      // Position CEO at top center
      if (roleLevel >= 100) {
        x = 400
        y = 50
      }
      // Position managers in second row
      else if (roleLevel >= 50) {
        const managerIndex = users.filter(u => (u.role?.level || 0) >= 50 && (u.role?.level || 0) < 100).indexOf(user)
        x = 100 + (managerIndex * 200)
        y = 200
      }
      // Position employees in third row
      else {
        const employeeIndex = users.filter(u => (u.role?.level || 0) < 50).indexOf(user)
        const managerId = user.managerId
        const managerIndex = users.filter(u => (u.role?.level || 0) >= 50 && (u.role?.level || 0) < 100).findIndex(m => m.id === managerId)
        x = 50 + (managerIndex * 200) + ((employeeIndex % 3) * 80)
        y = 350 + (Math.floor(employeeIndex / 8) * 120)
      }

      return {
        id: String(user.id), // Ensure string type for node ID
        type: 'orgNode',
        position: { x, y },
        data: {
          name: user.name,
          role: user.role?.name || 'Employee',
          department: user.department?.name || 'Unassigned',
          email: user.email,
          employeeId: user.employeeId,
          skills: user.skills,
          bio: user.bio,
          location: user.location,
          hireDate: user.hireDate,
          teamSize: user.directReports.length,
          level: user.role?.level || 0,
          managerId: user.managerId,
          isCurrentUser: user.id === currentUser.id,
          canManage: user.managerId === currentUser.id || downstreamMap[user.id]
        }
      }
    })

    // Create edges for manager-employee relationships (only for visible users)
    const edges = users
      .filter(user => user.managerId && visibleUserIds.includes(user.managerId))
      .map(user => {
        const edgeId = `edge-${user.managerId}-${user.id}`
        console.log(`Creating edge: ${edgeId} (${user.managerId} -> ${user.id})`)
        
        return {
          id: edgeId,
          source: String(user.managerId), // Ensure string type
          target: String(user.id), // Ensure string type
          type: 'smoothstep',
          style: { 
            stroke: '#8b5cf6',
            strokeWidth: 3
          },
          animated: true
        }
      })

    console.log(`Generated ${edges.length} edges for ${users.length} users`)
    console.log('Sample edges:', edges.slice(0, 3))

    return NextResponse.json({
      nodes,
      edges,
      stats: {
        totalUsers: users.length,
        departments: [...new Set(users.map(u => u.department?.name).filter(Boolean))].length,
        managers: users.filter(u => (u.role?.level || 0) >= 50).length,
        directReports: users.filter(u => u.directReports.length > 0).length
      }
    })

  } catch (error) {
    console.error('Error fetching org chart data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch org chart data' },
      { status: 500 }
    )
  }
}
