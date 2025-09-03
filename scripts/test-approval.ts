import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

async function testApprovalWorkflow() {
  try {
    console.log('🧪 Testing user approval workflow...')

    // 1. Create a test pending user
    console.log('\n1️⃣ Creating test pending user...')
    const testPendingUser = await prisma.pendingUser.create({
      data: {
        email: 'test.user@example.com',
        name: 'Test User',
        contactNumber: '+1234567890',
        skills: 'JavaScript, TypeScript',
        bio: 'Test user for approval workflow',
        status: 'PENDING'
      }
    })
    console.log('✅ Created pending user:', testPendingUser.id)

    // 2. Find a role to assign
    console.log('\n2️⃣ Finding available roles...')
    const roles = await prisma.role.findMany()
    console.log('📝 Available roles:', roles.map(r => ({ id: r.id, name: r.name })))
    
    if (roles.length === 0) {
      console.log('❌ No roles found. Creating a test role...')
      const testRole = await prisma.role.create({
        data: {
          name: 'Employee',
          level: 1,
          description: 'Regular employee'
        }
      })
      roles.push(testRole)
    }

    // 3. Check current state
    console.log('\n3️⃣ Current database state:')
    const usersInMainTable = await prisma.user.findMany({
      where: { email: 'test.user@example.com' }
    })
    const pendingUsers = await prisma.pendingUser.findMany({
      where: { email: 'test.user@example.com' }
    })
    
    console.log('👥 Users in main table:', usersInMainTable.length)
    console.log('⏳ Pending users:', pendingUsers.length)

    // 4. Simulate approval API call
    console.log('\n4️⃣ Simulating approval process...')
    console.log('🔄 Processing application:', {
      applicationId: testPendingUser.id,
      action: 'APPROVE',
      roleId: roles[0].id
    })

    await prisma.$transaction(async (tx) => {
      // Create the user in the main users table
      console.log('➕ Creating user in main table...')
      const newUser = await tx.user.create({
        data: {
          email: testPendingUser.email,
          name: testPendingUser.name,
          roleId: roles[0].id,
          status: 'ACTIVE',
        }
      })
      console.log('✅ User created successfully:', newUser.id)

      // Update the application status
      console.log('📝 Updating pending user status to APPROVED...')
      await tx.pendingUser.update({
        where: { id: testPendingUser.id },
        data: { status: 'APPROVED' }
      })
      console.log('✅ Pending user status updated')
    })

    // 5. Verify final state
    console.log('\n5️⃣ Final database state:')
    const finalUsersInMainTable = await prisma.user.findMany({
      where: { email: 'test.user@example.com' },
      include: { role: true }
    })
    const finalPendingUsers = await prisma.pendingUser.findMany({
      where: { email: 'test.user@example.com' }
    })
    
    console.log('👥 Users in main table:', finalUsersInMainTable.length)
    if (finalUsersInMainTable.length > 0) {
      console.log('✅ Created user details:', {
        id: finalUsersInMainTable[0].id,
        email: finalUsersInMainTable[0].email,
        name: finalUsersInMainTable[0].name,
        status: finalUsersInMainTable[0].status,
        role: finalUsersInMainTable[0].role?.name
      })
    }
    
    console.log('⏳ Pending users status:', finalPendingUsers.map(u => ({ id: u.id, status: u.status })))

    // 6. Cleanup
    console.log('\n6️⃣ Cleaning up test data...')
    await prisma.user.deleteMany({
      where: { email: 'test.user@example.com' }
    })
    await prisma.pendingUser.deleteMany({
      where: { email: 'test.user@example.com' }
    })
    console.log('✅ Cleanup completed')

    console.log('\n🎉 Test completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testApprovalWorkflow()
