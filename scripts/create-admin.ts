import { prisma } from '../src/lib/prisma'

async function createAdmin() {
  console.log('🔍 Checking for existing admin user...')
  
  // Check if admin user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  })
  
  if (existingUser) {
    console.log('✅ Admin user already exists:', existingUser.email)
    return
  }
  
  // Find or create Admin role
  let adminRole = await prisma.role.findFirst({
    where: { name: 'Admin' }
  })
  
  if (!adminRole) {
    console.log('📝 Creating Admin role...')
    adminRole = await prisma.role.create({
      data: {
        name: 'Admin',
        level: 100,
        description: 'System Administrator with full access'
      }
    })
  }
  
  // Create admin user
  console.log('👤 Creating admin user...')
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'System Administrator',
      roleId: adminRole.id,
      status: 'ACTIVE',
      employeeId: 'ADMIN001',
      bio: 'System Administrator with full access to all features',
      skills: 'System Administration, User Management, Full Platform Access'
    }
  })
  
  console.log('✅ Admin user created successfully:', adminUser.email)
  console.log('🔐 Admin details:', {
    email: adminUser.email,
    name: adminUser.name,
    role: adminRole.name,
    employeeId: adminUser.employeeId
  })
  
  await prisma.$disconnect()
}

createAdmin().catch(console.error)
