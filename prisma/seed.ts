import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding production database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'taujob1111@gmail.com' },
    update: {
      role: 'ADMIN',
      password: hashedPassword,
      isActive: true
    },
    create: {
      email: 'taujob1111@gmail.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
      isActive: true
    }
  })
  console.log('✅ Admin user created:', admin.email)

  // Create default settings
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      companyName: 'My Company',
      companyEmail: 'taujob1111@gmail.com',
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
  console.log('✅ Default settings created')

  // Create default service categories
  const categoriesData = [
    { name: 'Web Hosting', description: 'Web hosting services', color: '#3b82f6', icon: 'server' },
    { name: 'Website Development', description: 'Website design and development', color: '#8b5cf6', icon: 'globe' },
    { name: 'Software Development', description: 'Custom software solutions', color: '#10b981', icon: 'code' },
    { name: 'Domain Registration', description: 'Domain name registration', color: '#f59e0b', icon: 'at-sign' },
    { name: 'Maintenance', description: 'Website and software maintenance', color: '#06b6d4', icon: 'wrench' },
    { name: 'Consulting', description: 'IT consulting services', color: '#ec4899', icon: 'message-circle' }
  ]

  for (const cat of categoriesData) {
    await prisma.serviceCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    })
  }
  console.log('✅ Service categories created')

  console.log('')
  console.log('🎉 Production database seeded successfully!')
  console.log('')
  console.log('📋 Login credentials:')
  console.log('   Email: taujob1111@gmail.com')
  console.log('   Password: admin123')
  console.log('')
  console.log('⚠️  IMPORTANT: Change the admin password after first login!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
