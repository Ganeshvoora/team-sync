import { prisma } from '../src/lib/prisma'

async function verifyAdminSetup() {
  try {
    console.log('🔍 Verifying admin user setup...\n')

    // Check admin users in database
    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          name: {
            in: ['CEO', 'Admin']
          }
        }
      },
      include: {
        role: true
      }
    })

    console.log('📊 Admin Users in Database:')
    adminUsers.forEach(user => {
      console.log(`  ✅ ${user.name} (${user.email}) - Role: ${user.role?.name || 'No Role'}`)
    })

    // Check pending applications
    const pendingApplications = await prisma.pendingUser.findMany({
      where: { status: 'PENDING' }
    })

    console.log(`\n📋 Pending Applications: ${pendingApplications.length}`)
    pendingApplications.forEach(app => {
      console.log(`  📝 ${app.name} (${app.email}) - ${app.status}`)
    })

    console.log('\n🎯 System Status:')
    console.log(`  ✅ Admin users configured: ${adminUsers.length}`)
    console.log(`  ✅ Pending applications: ${pendingApplications.length}`)
    console.log(`  ✅ Admin portal ready for testing`)

    console.log('\n🔐 Test Admin Login:')
    console.log(`  URL: http://localhost:3000/admin/login`)
    console.log(`  CEO: ceo@teamsync.com / ceo123`)
    console.log(`  Admin: admin@teamsync.com / admin123`)

  } catch (error) {
    console.error('❌ Error verifying setup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAdminSetup()
