import { prisma } from '../src/lib/prisma'

async function setupAdminUsers() {
  try {
    console.log('🔐 Setting up admin users in database...')

    // Create Admin role if it doesn't exist
    const adminRole = await prisma.role.upsert({
      where: { name: 'Admin' },
      update: {},
      create: {
        name: 'Admin',
        level: 0 // Highest level for admin
      }
    })

    // Create CEO role if it doesn't exist
    const ceoRole = await prisma.role.upsert({
      where: { name: 'CEO' },
      update: {},
      create: {
        name: 'CEO',
        level: 1
      }
    })

    // Create admin users in our database
    const adminUsers = [
      {
        email: 'ceo@teamsync.com',
        name: 'CEO Admin',
        roleId: ceoRole.id
      },
      {
        email: 'admin@teamsync.com', 
        name: 'System Admin',
        roleId: adminRole.id
      }
    ]

    for (const adminUser of adminUsers) {
      await prisma.user.upsert({
        where: { email: adminUser.email },
        update: {
          name: adminUser.name,
          roleId: adminUser.roleId
        },
        create: {
          email: adminUser.email,
          name: adminUser.name,
          roleId: adminUser.roleId
        }
      })
      console.log(`✅ Admin user created in database: ${adminUser.email}`)
    }

    console.log('\n🎉 Admin users setup completed in database!')
    console.log('\n📋 Next steps:')
    console.log('1. Go to your Supabase Dashboard > Authentication > Users')
    console.log('2. Click "Add user" and create these accounts:')
    console.log('   - Email: ceo@teamsync.com, Password: ceo123')
    console.log('   - Email: admin@teamsync.com, Password: admin123')
    console.log('3. Make sure to set "Email confirmed" to true for both users')
    console.log('\n🔗 Then access admin portal at: /admin/login')

  } catch (error) {
    console.error('❌ Error setting up admin users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupAdminUsers()
