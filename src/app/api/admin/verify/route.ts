import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Admin verification started')
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log('❌ No user found in Supabase auth')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ Supabase user found:', user.email)

    // Check if user has admin privileges in our database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: { role: true },
    })

    if (!dbUser) {
      console.log('❌ User not found in database:', user.email)
      return NextResponse.json(
        { error: 'User not found in system' },
        { status: 403 }
      )
    }

    console.log('✅ Database user found:', dbUser.email, 'Role:', dbUser.role?.name, 'Status:', dbUser.status)

    // Check if user has admin role (CEO or Admin)
    if (dbUser.role?.name !== 'CEO' && dbUser.role?.name !== 'Admin') {
      console.log('❌ Insufficient privileges. Role:', dbUser.role?.name)
      return NextResponse.json(
        { error: 'Insufficient privileges' },
        { status: 403 }
      )
    }

    console.log('✅ Admin verification successful')
    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role.name
      }
    })

  } catch (error) {
    console.error('Admin verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
