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

    // Optimized function to get all visible users based on "Fog of War" rules
    const getVisibleUsers = async (userId: string, userRole: any) => {
      console.log('Getting visible users for', userId)
      const visibleUserIds = new Set<string>()
      
      // If user is Admin or CEO, they can see everyone in the organization
      if (userRole?.name === 'ADMIN' || userRole?.name === 'CEO') {
        console.log('Admin/CEO detected - returning all active users')
        // Use more efficient query with pagination
        const batchSize = 1000
        let lastId = ''
        let hasMore = true
        
        while (hasMore) {
          const batch = await prisma.user.findMany({
            where: { 
              status: 'ACTIVE',
              ...(lastId ? { id: { gt: lastId } } : {})
            },
            select: { id: true },
            orderBy: { id: 'asc' },
            take: batchSize
          })
          
          if (batch.length === 0 || batch.length < batchSize) {
            hasMore = false
          } else {
            lastId = batch[batch.length - 1].id
          }
          
          batch.forEach(user => visibleUserIds.add(user.id))
        }
        
        console.log(`Found ${visibleUserIds.size} visible users (admin view)`)
        return Array.from(visibleUserIds)
      }
      
      // Add current user
      visibleUserIds.add(userId)
      
      // Get manager chain efficiently (all the way up to CEO)
      let currentManagerId = currentUser.managerId
      const processedManagers = new Set<string>()
      
      while (currentManagerId && !processedManagers.has(currentManagerId)) {
        processedManagers.add(currentManagerId)
        visibleUserIds.add(currentManagerId)
        
        const manager = await prisma.user.findUnique({
          where: { id: currentManagerId },
          select: { managerId: true }
        })
        
        currentManagerId = manager?.managerId || null
      }
      
      // Get peers efficiently (users with same manager)
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
      
      // Get downstream hierarchy using a more efficient approach
      // This builds a complete map of the hierarchy to avoid recursive DB calls
      const managersToDirectReports: Record<string, string[]> = {}
      
      // Get all direct report relationships in one query
      const allDirectReports = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, managerId: true }
      })
      
      // Build the hierarchy map
      for (const user of allDirectReports) {
        if (user.managerId) {
          if (!managersToDirectReports[user.managerId]) {
            managersToDirectReports[user.managerId] = []
          }
          managersToDirectReports[user.managerId].push(user.id)
        }
      }
      
      // Function to traverse the hierarchy without database calls
      function traverseHierarchy(managerId: string) {
        const directReports = managersToDirectReports[managerId] || []
        for (const reportId of directReports) {
          visibleUserIds.add(reportId)
          traverseHierarchy(reportId)
        }
      }
      
      // Start traversal from current user
      traverseHierarchy(userId)
      
      console.log(`Found ${visibleUserIds.size} visible users for ${currentUser.name}`)
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

    // Optimized approach to build a complete hierarchy map in one go
    async function buildHierarchyMap(): Promise<Record<string, string[]>> {
      console.log('Building hierarchy map for all users...')
      const hierarchyMap: Record<string, string[]> = {}
      
      // Initialize each user with an empty array
      for (const user of users) {
        hierarchyMap[user.id] = []
      }
      
      // For each user, add their direct reports to their hierarchy
      for (const user of users) {
        if (user.managerId && hierarchyMap[user.managerId]) {
          hierarchyMap[user.managerId].push(user.id)
        }
      }
      
      console.log('Initial hierarchy map built with direct reports')
      return hierarchyMap
    }
    
    // Function to get all downstream users for a manager
    function getAllDownstreamUsers(hierarchyMap: Record<string, string[]>, managerId: string): Set<string> {
      const result = new Set<string>()
      
      function traverse(userId: string) {
        const directReports = hierarchyMap[userId] || []
        for (const reportId of directReports) {
          result.add(reportId)
          traverse(reportId)
        }
      }
      
      traverse(managerId)
      return result
    }

    // Check downstream relationships for each user
    const downstreamMap: Record<string, boolean> = {}
    const isAdminOrCEO = currentUser.role?.name === 'ADMIN' || currentUser.role?.name === 'CEO'
    
    // If admin/CEO, all users are considered in their downstream for management purposes
    if (isAdminOrCEO) {
      console.log('Admin/CEO access - setting all users as manageable')
      for (const user of users) {
        // An admin/CEO can manage everyone except themselves
        downstreamMap[user.id] = user.id !== currentUser.id
      }
    } else {
      // For regular managers, use the optimized hierarchy calculation
      console.log('Regular user - calculating hierarchy for', currentUser.name)
      const hierarchyMap = await buildHierarchyMap()
      const downstreamUsers = getAllDownstreamUsers(hierarchyMap, currentUser.id)
      
      for (const user of users) {
        downstreamMap[user.id] = downstreamUsers.has(user.id)
      }
      
      console.log(`Found ${downstreamUsers.size} downstream users for ${currentUser.name}`)
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
          canManage: downstreamMap[user.id], // We've already calculated this in the downstream map
          isAdmin: currentUser.role?.name === 'ADMIN' || currentUser.role?.name === 'CEO' // Pass admin status to frontend
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

    // Get all active users to provide better stats for admins/CEOs
    let totalActiveUsers = users.length;
    let totalDepartments = [...new Set(users.map(u => u.department?.name).filter(Boolean))].length;
    let totalManagers = users.filter(u => (u.role?.level || 0) >= 50).length;
    
    // If admin/CEO, get comprehensive stats from entire organization
    if (isAdminOrCEO) {
      const allActiveUsersCount = await prisma.user.count({
        where: { status: 'ACTIVE' }
      });
      
      const allDepartments = await prisma.department.count();
      
      totalActiveUsers = allActiveUsersCount;
      totalDepartments = allDepartments;
      
      console.log('Admin stats:', { totalActiveUsers, totalDepartments });
    }
    
    return NextResponse.json({
      nodes,
      edges,
      stats: {
        totalUsers: totalActiveUsers,
        departments: totalDepartments,
        managers: totalManagers,
        directReports: users.filter(u => u.directReports.length > 0).length,
        adminView: isAdminOrCEO,
        userRole: currentUser.role?.name || 'Employee'
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
