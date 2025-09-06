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

    const { taskId, status } = await request.json()

    if (!taskId || !status) {
      return NextResponse.json({ error: 'Missing taskId or status' }, { status: 400 })
    }

    // Check if user can update tasks
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: true,
        assigner: true
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if task is overdue
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      
      // Set both dates to midnight for accurate day comparison
      dueDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        return NextResponse.json({ 
          error: 'Status updates are not allowed for overdue tasks. You can still add comments.' 
        }, { status: 403 })
      }
    }

    // Check permissions: enhanced rules for workplace hierarchy
    // Users can update tasks if they are:
    // 1. The assignee (can update their own tasks)
    // 2. The assigner (can update tasks they assigned)
    // 3. Admin/CEO (can update any task)
    // 4. Manager of the assignee (can update subordinate's tasks)
    const canUpdate = task.assigneeId === currentUser.id || // Assignee can update
                     task.assignerId === currentUser.id || // Assigner can update
                     currentUser.role?.name === 'ADMIN' ||
                     currentUser.role?.name === 'CEO' ||
                     (currentUser.role?.name === 'MANAGER' && task.assignee?.managerId === currentUser.id) // Manager can update subordinate's tasks

    if (!canUpdate) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { 
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assigner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Create activity log for status change
    await prisma.taskActivity.create({
      data: {
        taskId,
        userId: currentUser.id,
        action: status === 'COMPLETED' ? 'COMPLETED' : 'STATUS_CHANGED',
        description: status === 'COMPLETED' 
          ? `Marked the task as completed`
          : `Changed status to ${status.replace('_', ' ').toLowerCase()}`
      }
    })

    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
