import { prisma } from '../src/lib/prisma'

async function createTestApplication() {
  try {
    const testApplication = await prisma.pendingUser.create({
      data: {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        contactNumber: '+1234567890',
        skills: 'JavaScript, React, Node.js',
        bio: 'Experienced software developer with 3 years in web development.',
        employeeId: 'EMP001',
        status: 'PENDING'
      }
    })

    console.log('Test application created:', testApplication)
  } catch (error) {
    console.error('Error creating test application:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestApplication()
