import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

async function seedOrganizationData() {
  try {
    console.log('🌱 Seeding organization data...')

    // Create departments first
    console.log('📁 Creating departments...')
    const engineering = await prisma.department.upsert({
      where: { name: 'Engineering' },
      update: {},
      create: {
        name: 'Engineering',
        description: 'Software development and technical operations',
        budget: 1500000
      }
    })

    const marketing = await prisma.department.upsert({
      where: { name: 'Marketing' },
      update: {},
      create: {
        name: 'Marketing',
        description: 'Brand management and customer acquisition',
        budget: 800000
      }
    })

    const sales = await prisma.department.upsert({
      where: { name: 'Sales' },
      update: {},
      create: {
        name: 'Sales',
        description: 'Revenue generation and customer relations',
        budget: 1200000
      }
    })

    const hr = await prisma.department.upsert({
      where: { name: 'Human Resources' },
      update: {},
      create: {
        name: 'Human Resources',
        description: 'Employee management and organizational development',
        budget: 600000
      }
    })

    // Ensure roles exist
    console.log('🎭 Creating roles...')
    const ceoRole = await prisma.role.upsert({
      where: { name: 'CEO' },
      update: {},
      create: {
        name: 'CEO',
        level: 100,
        description: 'Chief Executive Officer',
        permissions: ['all']
      }
    })

    const managerRole = await prisma.role.upsert({
      where: { name: 'Manager' },
      update: {},
      create: {
        name: 'Manager',
        level: 50,
        description: 'Department Manager',
        permissions: ['read', 'write', 'manage_team']
      }
    })

    const employeeRole = await prisma.role.upsert({
      where: { name: 'Employee' },
      update: {},
      create: {
        name: 'Employee',
        level: 1,
        description: 'Regular Employee',
        permissions: ['read', 'write_own']
      }
    })

    // Create organizational hierarchy
    console.log('👥 Creating users...')
    
    // CEO
    const ceo = await prisma.user.upsert({
      where: { email: 'ceo@teamcorp.com' },
      update: {},
      create: {
        email: 'ceo@teamcorp.com',
        name: 'Sarah Johnson',
        roleId: ceoRole.id,
        status: 'ACTIVE',
        employeeId: 'EMP001',
        location: 'New York, NY',
        hireDate: new Date('2020-01-15'),
        skills: 'Leadership, Strategy, Business Development',
        bio: 'Visionary leader with 15+ years of experience in tech industry'
      }
    })

    // Engineering Manager
    const engManager = await prisma.user.upsert({
      where: { email: 'eng.manager@teamcorp.com' },
      update: {},
      create: {
        email: 'eng.manager@teamcorp.com',
        name: 'Michael Chen',
        roleId: managerRole.id,
        managerId: ceo.id,
        departmentId: engineering.id,
        status: 'ACTIVE',
        employeeId: 'EMP002',
        location: 'San Francisco, CA',
        hireDate: new Date('2021-03-10'),
        skills: 'Software Architecture, Team Leadership, Node.js, React',
        bio: 'Experienced engineering manager leading innovative product development'
      }
    })

    // Marketing Manager
    const marketingManager = await prisma.user.upsert({
      where: { email: 'marketing.manager@teamcorp.com' },
      update: {},
      create: {
        email: 'marketing.manager@teamcorp.com',
        name: 'Emily Rodriguez',
        roleId: managerRole.id,
        managerId: ceo.id,
        departmentId: marketing.id,
        status: 'ACTIVE',
        employeeId: 'EMP003',
        location: 'Austin, TX',
        hireDate: new Date('2021-06-01'),
        skills: 'Digital Marketing, Brand Strategy, Analytics',
        bio: 'Creative marketing strategist with expertise in digital campaigns'
      }
    })

    // Sales Manager
    const salesManager = await prisma.user.upsert({
      where: { email: 'sales.manager@teamcorp.com' },
      update: {},
      create: {
        email: 'sales.manager@teamcorp.com',
        name: 'David Thompson',
        roleId: managerRole.id,
        managerId: ceo.id,
        departmentId: sales.id,
        status: 'ACTIVE',
        employeeId: 'EMP004',
        location: 'Chicago, IL',
        hireDate: new Date('2020-11-15'),
        skills: 'Sales Strategy, Client Relations, Negotiation',
        bio: 'Results-driven sales leader with proven track record'
      }
    })

    // HR Manager
    const hrManager = await prisma.user.upsert({
      where: { email: 'hr.manager@teamcorp.com' },
      update: {},
      create: {
        email: 'hr.manager@teamcorp.com',
        name: 'Lisa Park',
        roleId: managerRole.id,
        managerId: ceo.id,
        departmentId: hr.id,
        status: 'ACTIVE',
        employeeId: 'EMP005',
        location: 'Seattle, WA',
        hireDate: new Date('2021-01-20'),
        skills: 'Talent Acquisition, Employee Relations, Policy Development',
        bio: 'HR professional focused on building great workplace culture'
      }
    })

    // Engineering Team
    const engineers = [
      {
        email: 'alice.dev@teamcorp.com',
        name: 'Alice Wang',
        employeeId: 'EMP006',
        skills: 'React, TypeScript, GraphQL',
        bio: 'Frontend specialist with passion for user experience'
      },
      {
        email: 'bob.backend@teamcorp.com',
        name: 'Bob Miller',
        employeeId: 'EMP007',
        skills: 'Node.js, PostgreSQL, Docker',
        bio: 'Backend engineer focused on scalable systems'
      },
      {
        email: 'carol.fullstack@teamcorp.com',
        name: 'Carol Davis',
        employeeId: 'EMP008',
        skills: 'Full-stack, AWS, DevOps',
        bio: 'Versatile developer with cloud expertise'
      }
    ]

    for (const eng of engineers) {
      await prisma.user.upsert({
        where: { email: eng.email },
        update: {},
        create: {
          ...eng,
          roleId: employeeRole.id,
          managerId: engManager.id,
          departmentId: engineering.id,
          status: 'ACTIVE',
          location: 'Remote',
          hireDate: new Date('2022-01-15')
        }
      })
    }

    // Marketing Team
    const marketers = [
      {
        email: 'john.marketing@teamcorp.com',
        name: 'John Smith',
        employeeId: 'EMP009',
        skills: 'Content Marketing, SEO, Social Media',
        bio: 'Content strategist driving organic growth'
      },
      {
        email: 'jane.design@teamcorp.com',
        name: 'Jane Wilson',
        employeeId: 'EMP010',
        skills: 'UI/UX Design, Figma, Brand Design',
        bio: 'Creative designer shaping brand identity'
      }
    ]

    for (const marketer of marketers) {
      await prisma.user.upsert({
        where: { email: marketer.email },
        update: {},
        create: {
          ...marketer,
          roleId: employeeRole.id,
          managerId: marketingManager.id,
          departmentId: marketing.id,
          status: 'ACTIVE',
          location: 'Austin, TX',
          hireDate: new Date('2022-03-01')
        }
      })
    }

    // Sales Team
    const salespeople = [
      {
        email: 'tom.sales@teamcorp.com',
        name: 'Tom Brown',
        employeeId: 'EMP011',
        skills: 'Enterprise Sales, CRM, Lead Generation',
        bio: 'Enterprise sales specialist closing major deals'
      },
      {
        email: 'susan.sales@teamcorp.com',
        name: 'Susan Green',
        employeeId: 'EMP012',
        skills: 'Inside Sales, Customer Success, Account Management',
        bio: 'Customer-focused sales professional'
      }
    ]

    for (const salesperson of salespeople) {
      await prisma.user.upsert({
        where: { email: salesperson.email },
        update: {},
        create: {
          ...salesperson,
          roleId: employeeRole.id,
          managerId: salesManager.id,
          departmentId: sales.id,
          status: 'ACTIVE',
          location: 'Chicago, IL',
          hireDate: new Date('2022-02-15')
        }
      })
    }

    // Update department heads
    console.log('🏢 Setting department heads...')
    await prisma.department.update({
      where: { id: engineering.id },
      data: { headId: engManager.id }
    })

    await prisma.department.update({
      where: { id: marketing.id },
      data: { headId: marketingManager.id }
    })

    await prisma.department.update({
      where: { id: sales.id },
      data: { headId: salesManager.id }
    })

    await prisma.department.update({
      where: { id: hr.id },
      data: { headId: hrManager.id }
    })

    console.log('✅ Organization data seeded successfully!')
    console.log('📊 Created:')
    console.log('  - 4 Departments')
    console.log('  - 3 Roles (CEO, Manager, Employee)')
    console.log('  - 12 Users with realistic hierarchy')
    console.log('  - Complete org chart structure')

  } catch (error) {
    console.error('❌ Error seeding organization data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedOrganizationData()
