import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding production database...')

  const password = 'DevTeam24.$.$.'
  const hashedPassword = await bcrypt.hash(password, 12)

  // 1. Create Default Subscription Plan
  const plan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Professional' },
    update: {
      monthlyPrice: 10,
      yearlyPrice: 100,
      maxClients: -1,
      maxUsers: -1,
      maxServices: -1,
      features: 'Full Access, Analytics, Unlimited Clients'
    },
    create: {
      name: 'Professional',
      monthlyPrice: 10,
      yearlyPrice: 100,
      maxClients: -1,
      maxUsers: -1,
      maxServices: -1,
      features: 'Full Access, Analytics, Unlimited Clients'
    }
  })
  console.log('✅ Default plan created:', plan.name)

  // 2. Create Initial Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'default' },
    update: {
      planId: plan.id,
      subscriptionStatus: 'ACTIVE'
    },
    create: {
      name: 'My Company',
      slug: 'default',
      email: 'taujob1111@gmail.com',
      planId: plan.id,
      subscriptionStatus: 'ACTIVE'
    }
  })
  console.log('✅ Initial organization created:', org.name)

  // 3. Create Super Admin (Platform Owner)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'taujob1111@gmail.com' },
    update: {
      role: 'SUPER_ADMIN',
      password: hashedPassword,
      isActive: true
    },
    create: {
      email: 'taujob1111@gmail.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      isActive: true
    }
  })
  console.log('✅ Super Admin created:', superAdmin.email)

  // 4. Create Organization Admin
  const admin = await prisma.user.upsert({
    where: { email: 'mtauraij@gmail.com' },
    update: {
      role: 'ADMIN',
      password: hashedPassword,
      isActive: true,
      organizationId: org.id
    },
    create: {
      email: 'mtauraij@gmail.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
      isActive: true,
      organizationId: org.id
    }
  })
  console.log('✅ Admin user created:', admin.email)

  // 5. Create Organization Settings
  await prisma.settings.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      companyName: org.name,
      companyEmail: org.email,
      currency: 'USD',
      currencySymbol: '$',
      invoicePrefix: 'INV-',
      quotePrefix: 'QUO-',
      taxRate: 0,
      reminderDays: '14,7,3,1',
      overdueDays: '1,3,7,14',
      autoSuspendDays: 14,
      paymentTerms: 'Payment is due within 14 days of invoice date.',
      invoiceFooter: 'Thank you for your business!'
    }
  })
  console.log('✅ Organization settings created')

  // 6. Create Global Super Admin Settings
  await prisma.superAdminSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      platformName: 'MyPanel',
      supportEmail: 'taujob1111@gmail.com'
    }
  })
  console.log('✅ Super Admin settings created')

  // 7. Create default service categories for the org
  const categoriesData = [
    { name: 'Web Hosting', description: 'Web hosting services', color: '#3b82f6', icon: 'server' },
    { name: 'Website Development', description: 'Website design and development', color: '#8b5cf6', icon: 'globe' },
    { name: 'Software Development', description: 'Custom software solutions', color: '#10b981', icon: 'code' }
  ]

  for (const cat of categoriesData) {
    await prisma.serviceCategory.upsert({
      where: { name_organizationId: { name: cat.name, organizationId: org.id } },
      update: {},
      create: { ...cat, organizationId: org.id }
    })
  }
  console.log('✅ Default categories created')

  console.log('')
  console.log('🎉 Database seeded successfully!')
  console.log('')
  console.log('📋 Login credentials:')
  console.log('   Super Admin: taujob1111@gmail.com')
  console.log('   Admin:       mtauraij@gmail.com')
  console.log('   Password:    ' + password)
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
