import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    // Get current user using Supabase
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the user in our database by email
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: {
        role: true,
      },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { taskIds, action, data } = await request.json()

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json({ error: 'Task IDs array is required' }, { status: 400 })
    }

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    // Check permissions for all tasks
    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds } },
      include: { assignee: true, assigner: true }
    })

    const canUpdateAll = tasks.every(task => 
      task.assigneeId === currentUser.id || 
      task.assignerId === currentUser.id ||
      currentUser.role?.name === 'ADMIN' ||
      currentUser.role?.name === 'CEO' ||
      currentUser.role?.name === 'MANAGER'
    )

    if (!canUpdateAll) {
      return NextResponse.json({ error: 'Insufficient permissions for some tasks' }, { status: 403 })
    }

    let updateData: any = {}
    let activityDescription = ''

    switch (action) {
      case 'status':
        if (!data.status) {
          return NextResponse.json({ error: 'Status is required' }, { status: 400 })
        }
        updateData.status = data.status
        updateData.completedAt = data.status === 'COMPLETED' ? new Date() : null
        activityDescription = `Bulk updated status to ${data.status.replace('_', ' ').toLowerCase()}`
        break
      
      case 'priority':
        if (!data.priority) {
          return NextResponse.json({ error: 'Priority is required' }, { status: 400 })
        }
        updateData.priority = data.priority
        activityDescription = `Bulk updated priority to ${data.priority.toLowerCase()}`
        break
      
      case 'assignee':
        if (!data.assigneeId) {
          return NextResponse.json({ error: 'Assignee ID is required' }, { status: 400 })
        }
        
        // Verify assignee exists
        const assignee = await prisma.user.findUnique({
          where: { id: data.assigneeId }
        })
        
        if (!assignee) {
          return NextResponse.json({ error: 'Assignee not found' }, { status: 404 })
        }
        
        updateData.assigneeId = data.assigneeId
        activityDescription = `Bulk reassigned tasks to ${assignee.name}`
        break
      
      case 'delete':
        // Delete tasks
        await prisma.task.deleteMany({
          where: { id: { in: taskIds } }
        })
        
        return NextResponse.json({ 
          message: `Successfully deleted ${taskIds.length} tasks`,
          deletedCount: taskIds.length
        })
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update tasks
    const updatedTasks = await prisma.task.updateMany({
      where: { id: { in: taskIds } },
      data: updateData
    })

    // Create activity logs for each task
    const activityLogs = taskIds.map((taskId: string) => ({
      taskId,
      userId: currentUser.id,
      action: action === 'status' && data.status === 'COMPLETED' ? 'COMPLETED' as const : 'UPDATED' as const,
      description: activityDescription
    }))

    await prisma.taskActivity.createMany({
      data: activityLogs
    })

    return NextResponse.json({ 
      message: `Successfully updated ${updatedTasks.count} tasks`,
      updatedCount: updatedTasks.count
    })
  } catch (error) {
    console.error('Error in bulk operations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
