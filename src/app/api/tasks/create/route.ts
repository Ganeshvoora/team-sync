import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
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

    // Everyone can create tasks now (including self-assignment)
    const canCreateTasks = true

    if (!canCreateTasks) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { title, description, assigneeId, priority, dueDate, projectId } = await request.json()

    if (!title || !assigneeId) {
      return NextResponse.json({ error: 'Title and assignee are required' }, { status: 400 })
    }

    // Verify assignee exists and user has permission to assign to them
    const assignee = await prisma.user.findUnique({
      where: { id: assigneeId },
      include: {
        role: true,
        department: true,
        manager: true,
      }
    })

    if (!assignee) {
      return NextResponse.json({ error: 'Assignee not found' }, { status: 404 })
    }

    // Check assignment permissions based on workplace hierarchy
    let canAssignToUser = false

    if (currentUser.role?.name === 'ADMIN' || currentUser.role?.name === 'CEO') {
      // Admins and CEOs can assign to anyone
      canAssignToUser = true
    } else if (currentUser.role?.name === 'MANAGER') {
      // Managers can assign to their direct reports or themselves only
      canAssignToUser = assigneeId === currentUser.id || // Self-assignment
                       assignee.managerId === currentUser.id // Direct report
    } else {
      // Regular employees can only assign to themselves (no co-employees or seniors)
      canAssignToUser = assigneeId === currentUser.id // Self-assignment only
    }

    if (!canAssignToUser) {
      return NextResponse.json({ error: 'You cannot assign tasks to this user' }, { status: 403 })
    }

    // Create the task
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        assigneeId,
        assignerId: currentUser.id,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: projectId || null,
        status: 'NOT_STARTED'
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

    // Create initial activity log
    await prisma.taskActivity.create({
      data: {
        taskId: newTask.id,
        userId: currentUser.id,
        action: 'CREATED',
        description: `Created the task and assigned it to ${assignee.name}`
      }
    })

    return NextResponse.json({ task: newTask })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
