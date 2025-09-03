import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This endpoint is for initial setup only
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Use service role key to create users
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Need service role key
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (error) {
      console.error('Error creating admin user:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'Admin user created successfully',
      userId: data.user?.id
    })

  } catch (error) {
    console.error('Error in admin setup:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
