import { prisma } from '../src/lib/prisma'

async function updateAdminStatus() {
  try {
    console.log('🔧 Updating admin user status to ACTIVE...')

    // Update CEO status
    await prisma.user.update({
      where: { email: 'ceo@teamsync.com' },
      data: { status: 'ACTIVE' }
    })
    console.log('✅ Updated CEO status to ACTIVE')

    // Update Admin status
    await prisma.user.update({
      where: { email: 'admin@teamsync.com' },
      data: { status: 'ACTIVE' }
    })
    console.log('✅ Updated Admin status to ACTIVE')

    // Verify the changes
    const adminUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ['ceo@teamsync.com', 'admin@teamsync.com']
        }
      },
      include: { role: true }
    })

    console.log('\n📊 Admin Users Status:')
    adminUsers.forEach(user => {
      console.log(`  ${user.name} (${user.email}) - Status: ${user.status} - Role: ${user.role?.name || 'No Role'}`)
    })

    console.log('\n🎉 Admin users are now ACTIVE and ready for login!')

  } catch (error) {
    console.error('❌ Error updating admin status:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminStatus()
