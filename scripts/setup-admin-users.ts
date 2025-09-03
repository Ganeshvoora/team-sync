import { createClient } from '@supabase/supabase-js'
import { prisma } from '../src/lib/prisma'

// Supabase admin client (requires service role key)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function createAdminUsers() {
  try {
    console.log('🔐 Creating admin users with password authentication...')

    // Admin user credentials
    const adminUsers = [
      {
        email: 'ceo@teamsync.com',
        password: 'ceo123',
        name: 'CEO Admin',
        role: 'CEO'
      },
      {
        email: 'admin@teamsync.com', 
        password: 'admin123',
        name: 'System Admin',
        role: 'Admin'
      }
    ]

    for (const adminUser of adminUsers) {
      console.log(`Creating admin user: ${adminUser.email}`)

      // First, check if user already exists in Supabase Auth
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = existingUsers.users?.find(u => u.email === adminUser.email)

      if (existingUser) {
        console.log(`User ${adminUser.email} already exists in Supabase Auth`)
      } else {
        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: adminUser.email,
          password: adminUser.password,
          email_confirm: true
        })

        if (authError) {
          console.error(`Error creating auth user ${adminUser.email}:`, authError)
          continue
        } else {
          console.log(`✅ Created Supabase Auth user: ${adminUser.email}`)
        }
      }

      // Get or create role
      let role = await prisma.role.findUnique({
        where: { name: adminUser.role }
      })

      if (!role) {
        role = await prisma.role.create({
          data: {
            name: adminUser.role,
            level: adminUser.role === 'CEO' ? 1 : 0
          }
        })
        console.log(`✅ Created role: ${adminUser.role}`)
      }

      // Create or update user in our database
      await prisma.user.upsert({
        where: { email: adminUser.email },
        update: {
          name: adminUser.name,
          roleId: role.id
        },
        create: {
          email: adminUser.email,
          name: adminUser.name,
          roleId: role.id
        }
      })

      console.log(`✅ Admin user created in database: ${adminUser.email}`)
    }

    console.log('\n🎉 Admin users setup completed!')
    console.log('\nAdmin Login Credentials:')
    console.log('CEO: ceo@teamsync.com / ceo123')
    console.log('Admin: admin@teamsync.com / admin123')
    console.log('\nAccess admin portal at: http://localhost:3000/admin/login')

  } catch (error) {
    console.error('❌ Error setting up admin users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUsers()
