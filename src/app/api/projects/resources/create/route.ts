import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { projectId, title, url } = await req.json()

  if (!projectId || !title || !url) {
    return new NextResponse(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const resource = await prisma.resource.create({
      data: {
        projectId,
        title,
        url,
        addedById: user.id,
      },
    })

    return new NextResponse(JSON.stringify(resource), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating resource:', error)
    return new NextResponse(JSON.stringify({ error: 'Failed to create resource' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
