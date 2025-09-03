import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user from database
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: { role: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, priority, dueDate, assignedToId } = body

    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'NOT_STARTED',
        assigneeId: assignedToId,
        assignerId: currentUser.id,
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
        }
      }
    })

    // Create notification for the assigned user
    await prisma.notification.create({
      data: {
        userId: assignedToId,
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: `You have been assigned a new task: "${title}"`,
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user from database
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: {
        role: true,
        directReports: {
          select: { id: true }
        }
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let whereClause: any = {};
    
    // Different visibility rules based on role
    if (currentUser.role?.name === 'ADMIN' || currentUser.role?.name === 'CEO') {
      // Admins and CEOs can see all tasks
      whereClause = {};
    } else if (currentUser.role?.name === 'MANAGER') {
      // Get direct reports IDs to check for tasks assigned to subordinates
      const directReportIds = currentUser.directReports.map((user: { id: string }) => user.id);
      
      // Managers can see:
      // 1. Tasks assigned to them
      // 2. Tasks assigned by them
      // 3. Tasks assigned to their direct reports
      // NOTE: They don't see tasks assigned to their superiors
      whereClause = {
        OR: [
          { assigneeId: currentUser.id },        // Tasks assigned to them
          { assignerId: currentUser.id },        // Tasks they assigned to others
          { assigneeId: { in: directReportIds } } // Tasks assigned to their subordinates
        ]
      };
    } else {
      // Regular employees can only see:
      // 1. Tasks assigned to them
      // 2. Tasks they created and assigned to others (if any)
      // NOTE: They don't see tasks assigned to their co-workers or superiors
      whereClause = {
        OR: [
          { assigneeId: currentUser.id },  // Tasks assigned to them
          { assignerId: currentUser.id }   // Tasks they assigned (if any)
        ]
      };
    }

    // Get tasks based on visibility rules
    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assigner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
