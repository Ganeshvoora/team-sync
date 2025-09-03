import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('🔧 Setting up admin user with requested credentials...')

    // First, try to find existing user
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listing users:', listError)
      return
    }

    const existingUser = existingUsers.users.find(user => user.email === 'admin@example.com')

    let authUserId: string

    if (existingUser) {
      console.log('👤 User already exists, updating password...')
      
      // Update password for existing user
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password: 'admin123' }
      )
      
      if (updateError) {
        console.error('❌ Error updating password:', updateError)
        return
      }
      
      authUserId = existingUser.id
      console.log('✅ Password updated for:', existingUser.email)
    } else {
      // Create new user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@example.com',
        password: 'admin123',
        email_confirm: true,
      })

      if (authError) {
        console.error('❌ Error creating auth user:', authError)
        return
      }

      authUserId = authData.user!.id
      console.log('✅ Auth user created:', authData.user?.email)
    }

    // Find or create Admin role
    let adminRole = await prisma.role.findFirst({
      where: { name: 'Admin' }
    })

    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          name: 'Admin',
          level: 90,
          description: 'Administrator with full access',
          permissions: ['read', 'write', 'delete', 'admin']
        }
      })
      console.log('✅ Admin role created')
    }

    // Create user in our database
    const dbUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {
        name: 'Admin User',
        roleId: adminRole.id,
      },
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        roleId: adminRole.id,
      }
    })

    console.log('✅ Database user created/updated:', dbUser.email)
    console.log('\n🎯 Admin credentials ready:')
    console.log('📧 Email: admin@example.com')
    console.log('🔑 Password: admin123')
    console.log('🌐 Login URL: http://localhost:3001/login/admin')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
