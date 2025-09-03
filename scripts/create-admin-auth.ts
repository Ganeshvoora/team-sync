import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminAuth() {
  console.log('Creating admin user in Supabase Auth...')
  
  try {
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'admin123',
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        name: 'System Administrator',
        role: 'Admin'
      }
    })

    if (error) {
      console.error('Error creating admin user:', error.message)
      return
    }

    console.log('✅ Admin user created successfully in Supabase Auth!')
    console.log('Email: admin@example.com')
    console.log('Password: admin123')
    console.log('User ID:', data.user.id)
    
    // Update the database user record with the Supabase Auth ID
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    const updatedUser = await prisma.user.update({
      where: {
        email: 'admin@example.com'
      },
      data: {
        id: data.user.id
      }
    })
    
    console.log('✅ Database user record updated with Auth ID')
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('Error:', error)
  }
}

createAdminAuth()
