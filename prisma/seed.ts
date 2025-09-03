import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('🌱 Starting database seeding...');

  // Delete all existing data (idempotent)
  console.log('🗑️  Clearing existing data...');
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});

  // Create Roles
  console.log('👑 Creating roles...');
  const ceoRole = await prisma.role.create({
    data: {
      name: 'CEO',
      level: 0,
    },
  });

  const directorRole = await prisma.role.create({
    data: {
      name: 'Director',
      level: 1,
    },
  });

  const managerRole = await prisma.role.create({
    data: {
      name: 'Manager',
      level: 2,
    },
  });

  const associateRole = await prisma.role.create({
    data: {
      name: 'Associate',
      level: 3,
    },
  });

  // Create Users with hierarchy
  console.log('👥 Creating users...');
  
  // CEO (no manager)
  const ceo = await prisma.user.create({
    data: {
      email: 'ceo@teamsync.com',
      name: 'Alice Johnson',
      roleId: ceoRole.id,
      managerId: null,
    },
  });

  // Directors (report to CEO)
  const director1 = await prisma.user.create({
    data: {
      email: 'director1@teamsync.com',
      name: 'Bob Smith',
      roleId: directorRole.id,
      managerId: ceo.id,
    },
  });

  const director2 = await prisma.user.create({
    data: {
      email: 'director2@teamsync.com',
      name: 'Carol Williams',
      roleId: directorRole.id,
      managerId: ceo.id,
    },
  });

  // Managers (report to Directors)
  const manager1 = await prisma.user.create({
    data: {
      email: 'manager1@teamsync.com',
      name: 'David Brown',
      roleId: managerRole.id,
      managerId: director1.id,
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      email: 'manager2@teamsync.com',
      name: 'Emma Davis',
      roleId: managerRole.id,
      managerId: director2.id,
    },
  });

  // Associates (report to Managers)
  const associate1 = await prisma.user.create({
    data: {
      email: 'associate1@teamsync.com',
      name: 'Frank Wilson',
      roleId: associateRole.id,
      managerId: manager1.id,
    },
  });

  const associate2 = await prisma.user.create({
    data: {
      email: 'associate2@teamsync.com',
      name: 'Grace Miller',
      roleId: associateRole.id,
      managerId: manager2.id,
    },
  });

  // Create some tasks
  console.log('📋 Creating tasks...');
  
  await prisma.task.create({
    data: {
      title: 'Prepare Q4 financial report',
      status: 'IN_PROGRESS',
      assigneeId: associate1.id,
      assignerId: manager1.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Review marketing strategy',
      status: 'NOT_STARTED',
      assigneeId: associate2.id,
      assignerId: manager2.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Team performance evaluation',
      status: 'COMPLETED',
      assigneeId: manager1.id,
      assignerId: director1.id,
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log(`
    Created:
    - 4 Roles (CEO, Director, Manager, Associate)
    - 7 Users in hierarchical structure
    - 3 Tasks assigned between users
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
