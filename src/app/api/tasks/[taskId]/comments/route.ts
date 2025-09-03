import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch task comments
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: {
        role: true
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify task exists and user has permission to view comments
    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
      include: {
        assignee: true,
        assigner: true
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Users can view comments on tasks if they are:
    // 1. The assignee
    // 2. The assigner  
    // 3. Admin/CEO (can view any task)
    // 4. Manager of the assignee
    const canView = task.assigneeId === currentUser.id ||
                   task.assignerId === currentUser.id ||
                   currentUser.role?.name === 'ADMIN' ||
                   currentUser.role?.name === 'CEO' ||
                   (currentUser.role?.name === 'MANAGER' && task.assignee?.managerId === currentUser.id)

    if (!canView) {
      return NextResponse.json({ error: 'You do not have permission to view comments on this task' }, { status: 403 })
    }

    const comments = await prisma.taskComment.findMany({
      where: { taskId: params.taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePictureUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: {
        role: true
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    // Verify task exists and user has permission to comment
    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
      include: {
        assignee: true,
        assigner: true
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Users can comment on tasks if they are:
    // 1. The assignee
    // 2. The assigner  
    // 3. Admin/CEO (can comment on any task)
    // 4. Manager of the assignee
    const canComment = task.assigneeId === currentUser.id ||
                      task.assignerId === currentUser.id ||
                      currentUser.role?.name === 'ADMIN' ||
                      currentUser.role?.name === 'CEO' ||
                      (currentUser.role?.name === 'MANAGER' && task.assignee?.managerId === currentUser.id)

    if (!canComment) {
      return NextResponse.json({ error: 'You do not have permission to comment on this task' }, { status: 403 })
    }

    const taskId = params.taskId;
    
    const comment = await prisma.taskComment.create({
      data: {
        content,
        taskId,
        userId: currentUser.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePictureUrl: true
          }
        }
      }
    })

    // Create activity log
    await prisma.taskActivity.create({
      data: {
        taskId: params.taskId,
        userId: currentUser.id,
        action: 'COMMENT_ADDED',
        description: `Added a comment: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`
      }
    })

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}