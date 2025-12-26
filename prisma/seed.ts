import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mypanel.com' },
    update: {
      role: 'ADMIN',
      password: hashedPassword,
      isActive: true
    },
    create: {
      email: 'admin@mypanel.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
      isActive: true
    }
  })
  console.log('✅ Admin user created:', admin.email)

  // Create a sample sales user
  const salesPassword = await bcrypt.hash('sales123', 12)
  const salesUser = await prisma.user.upsert({
    where: { email: 'sales@mypanel.com' },
    update: {
      role: 'SALES',
      password: salesPassword,
      isActive: true
    },
    create: {
      email: 'sales@mypanel.com',
      password: salesPassword,
      name: 'John Sales',
      phone: '+1 234 567 890',
      role: 'SALES',
      isActive: true
    }
  })
  console.log('✅ Sales user created:', salesUser.email)

  // Create default settings
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      companyName: 'My Company',
      companyEmail: 'admin@mypanel.com',
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

  // Create service categories
  const categoriesData = [
    { name: 'Web Hosting', description: 'Web hosting services', color: '#3b82f6', icon: 'server' },
    { name: 'Website Development', description: 'Website design and development', color: '#8b5cf6', icon: 'globe' },
    { name: 'Software Development', description: 'Custom software solutions', color: '#10b981', icon: 'code' },
    { name: 'Domain Registration', description: 'Domain name registration', color: '#f59e0b', icon: 'at-sign' },
    { name: 'Maintenance', description: 'Website and software maintenance', color: '#06b6d4', icon: 'wrench' },
    { name: 'Consulting', description: 'IT consulting services', color: '#ec4899', icon: 'message-circle' }
  ]

  const categories: Record<string, any> = {}
  for (const cat of categoriesData) {
    categories[cat.name] = await prisma.serviceCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    })
  }
  console.log('✅ Service categories created')

  // Create sample clients
  const clientsData = [
    {
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1 234 567 890',
      company: 'Smith Industries',
      billingAddress: '123 Main Street',
      billingCity: 'New York',
      billingState: 'NY',
      billingZip: '10001',
      billingCountry: 'USA'
    },
    {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1 987 654 321',
      company: 'Doe Enterprises',
      billingAddress: '456 Oak Avenue',
      billingCity: 'Los Angeles',
      billingState: 'CA',
      billingZip: '90001',
      billingCountry: 'USA'
    },
    {
      name: 'Bob Wilson',
      email: 'bob@example.com',
      phone: '+1 555 123 456',
      company: 'Wilson Tech',
      billingAddress: '789 Pine Road',
      billingCity: 'Chicago',
      billingState: 'IL',
      billingZip: '60601',
      billingCountry: 'USA'
    },
    {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '+1 444 789 012',
      company: 'Johnson & Co',
      billingAddress: '321 Elm Street',
      billingCity: 'Houston',
      billingState: 'TX',
      billingZip: '77001',
      billingCountry: 'USA'
    },
    {
      name: 'Mike Brown',
      email: 'mike@example.com',
      phone: '+1 333 456 789',
      company: 'Brown Solutions',
      billingAddress: '654 Maple Drive',
      billingCity: 'Miami',
      billingState: 'FL',
      billingZip: '33101',
      billingCountry: 'USA'
    }
  ]

  const clients: any[] = []
  for (const clientData of clientsData) {
    const client = await prisma.client.upsert({
      where: { email: clientData.email },
      update: {},
      create: clientData
    })
    clients.push(client)
  }
  console.log('✅ Sample clients created')

  // Create sample services
  const now = new Date()
  const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
  const addMonths = (date: Date, months: number) => {
    const d = new Date(date)
    d.setMonth(d.getMonth() + months)
    return d
  }

  const servicesData = [
    // John Smith's services
    { clientId: clients[0].id, categoryId: categories['Web Hosting'].id, name: 'Business Hosting - smithindustries.com', price: 29.99, billingCycle: 'MONTHLY', domain: 'smithindustries.com', status: 'ACTIVE' },
    { clientId: clients[0].id, categoryId: categories['Domain Registration'].id, name: 'Domain - smithindustries.com', price: 14.99, billingCycle: 'ANNUALLY', domain: 'smithindustries.com', status: 'ACTIVE' },
    { clientId: clients[0].id, categoryId: categories['Maintenance'].id, name: 'Website Maintenance', price: 99.00, billingCycle: 'MONTHLY', status: 'ACTIVE' },

    // Jane Doe's services
    { clientId: clients[1].id, categoryId: categories['Website Development'].id, name: 'E-commerce Website Development', price: 2500.00, billingCycle: 'ONETIME', status: 'ACTIVE' },
    { clientId: clients[1].id, categoryId: categories['Web Hosting'].id, name: 'Premium Hosting - doeenterprises.com', price: 49.99, billingCycle: 'MONTHLY', domain: 'doeenterprises.com', status: 'ACTIVE' },

    // Bob Wilson's services
    { clientId: clients[2].id, categoryId: categories['Software Development'].id, name: 'Custom CRM Development', price: 5000.00, billingCycle: 'ONETIME', status: 'ACTIVE' },
    { clientId: clients[2].id, categoryId: categories['Maintenance'].id, name: 'Software Support & Updates', price: 199.00, billingCycle: 'MONTHLY', status: 'ACTIVE' },

    // Alice Johnson's services
    { clientId: clients[3].id, categoryId: categories['Web Hosting'].id, name: 'Starter Hosting - johnsonco.com', price: 9.99, billingCycle: 'MONTHLY', domain: 'johnsonco.com', status: 'ACTIVE' },
    { clientId: clients[3].id, categoryId: categories['Consulting'].id, name: 'IT Consulting (10 hours)', price: 1500.00, billingCycle: 'MONTHLY', status: 'PENDING' },

    // Mike Brown's services
    { clientId: clients[4].id, categoryId: categories['Website Development'].id, name: 'Portfolio Website', price: 800.00, billingCycle: 'ONETIME', status: 'ACTIVE' },
    { clientId: clients[4].id, categoryId: categories['Domain Registration'].id, name: 'Domain - brownsolutions.io', price: 39.99, billingCycle: 'ANNUALLY', domain: 'brownsolutions.io', status: 'ACTIVE' },
    { clientId: clients[4].id, categoryId: categories['Web Hosting'].id, name: 'Business Hosting - brownsolutions.io', price: 29.99, billingCycle: 'MONTHLY', domain: 'brownsolutions.io', status: 'SUSPENDED' }
  ]

  const services: any[] = []
  for (const serviceData of servicesData) {
    const startDate = addDays(now, -Math.floor(Math.random() * 180))
    const service = await prisma.service.create({
      data: {
        ...serviceData,
        startDate,
        nextDueDate: serviceData.billingCycle === 'MONTHLY' ? addMonths(startDate, 1) :
          serviceData.billingCycle === 'ANNUALLY' ? addMonths(startDate, 12) :
            addDays(now, 30)
      }
    })
    services.push(service)
  }
  console.log('✅ Sample services created')

  // Create sample invoices
  const invoicesData = [
    // Paid invoices
    { clientId: clients[0].id, status: 'PAID', daysAgo: 45, items: [{ description: 'Business Hosting - January', amount: 29.99 }, { description: 'Website Maintenance - January', amount: 99.00 }] },
    { clientId: clients[0].id, status: 'PAID', daysAgo: 15, items: [{ description: 'Business Hosting - February', amount: 29.99 }, { description: 'Website Maintenance - February', amount: 99.00 }] },
    { clientId: clients[1].id, status: 'PAID', daysAgo: 60, items: [{ description: 'E-commerce Website Development', amount: 2500.00 }] },
    { clientId: clients[2].id, status: 'PAID', daysAgo: 30, items: [{ description: 'Custom CRM Development - Phase 1', amount: 2500.00 }] },
    { clientId: clients[4].id, status: 'PAID', daysAgo: 90, items: [{ description: 'Portfolio Website Development', amount: 800.00 }] },

    // Sent/pending invoices
    { clientId: clients[0].id, status: 'SENT', daysAgo: -10, items: [{ description: 'Business Hosting - March', amount: 29.99 }, { description: 'Website Maintenance - March', amount: 99.00 }] },
    { clientId: clients[1].id, status: 'SENT', daysAgo: -5, items: [{ description: 'Premium Hosting - March', amount: 49.99 }] },
    { clientId: clients[2].id, status: 'SENT', daysAgo: -14, items: [{ description: 'Custom CRM Development - Phase 2', amount: 2500.00 }] },

    // Overdue invoices
    { clientId: clients[3].id, status: 'OVERDUE', daysAgo: 20, items: [{ description: 'Starter Hosting - Feb & Mar', amount: 19.98 }] },
    { clientId: clients[4].id, status: 'OVERDUE', daysAgo: 35, items: [{ description: 'Business Hosting - Feb & Mar', amount: 59.98 }, { description: 'Domain Renewal', amount: 39.99 }] },

    // Partially paid
    { clientId: clients[2].id, status: 'PARTIALLY_PAID', daysAgo: 5, items: [{ description: 'Software Support - Q1', amount: 597.00 }], amountPaid: 300 }
  ]

  let invoiceNumber = 1
  for (const invoiceData of invoicesData) {
    const issueDate = addDays(now, -invoiceData.daysAgo)
    const dueDate = addDays(issueDate, 14)
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0)

    await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${String(invoiceNumber++).padStart(4, '0')}`,
        clientId: invoiceData.clientId,
        issueDate,
        dueDate,
        paidDate: invoiceData.status === 'PAID' ? addDays(issueDate, Math.floor(Math.random() * 10) + 1) : null,
        subtotal,
        taxAmount: 0,
        discount: 0,
        total: subtotal,
        amountPaid: invoiceData.status === 'PAID' ? subtotal : (invoiceData.amountPaid || 0),
        status: invoiceData.status as any,
        items: {
          create: invoiceData.items.map(item => ({
            description: item.description,
            quantity: 1,
            unitPrice: item.amount,
            amount: item.amount
          }))
        }
      }
    })
  }
  console.log('✅ Sample invoices created')

  // Create sample payments for paid invoices
  const paidInvoices = await prisma.invoice.findMany({
    where: { status: 'PAID' }
  })

  for (const invoice of paidInvoices) {
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        amount: invoice.total,
        paymentDate: invoice.paidDate || new Date(),
        paymentMethod: ['BANK_TRANSFER', 'CREDIT_CARD', 'PAYPAL'][Math.floor(Math.random() * 3)] as any,
        reference: `PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      }
    })
  }
  console.log('✅ Sample payments created')

  // Create sample quotations
  const quotationsData = [
    { clientId: clients[0].id, status: 'SENT', items: [{ description: 'Website Redesign', amount: 1500 }, { description: 'SEO Optimization', amount: 500 }] },
    { clientId: clients[1].id, status: 'ACCEPTED', items: [{ description: 'Mobile App Development', amount: 8000 }] },
    { clientId: clients[3].id, status: 'DRAFT', items: [{ description: 'Cloud Migration Services', amount: 3000 }, { description: 'Training (5 hours)', amount: 750 }] },
    { clientId: clients[4].id, status: 'DECLINED', items: [{ description: 'Enterprise CRM System', amount: 15000 }] }
  ]

  let quoteNumber = 1
  for (const quoteData of quotationsData) {
    const issueDate = addDays(now, -Math.floor(Math.random() * 30))
    const validUntil = addDays(issueDate, 30)
    const subtotal = quoteData.items.reduce((sum, item) => sum + item.amount, 0)

    await prisma.quotation.create({
      data: {
        quoteNumber: `QUO-${String(quoteNumber++).padStart(4, '0')}`,
        clientId: quoteData.clientId,
        issueDate,
        validUntil,
        subtotal,
        taxAmount: 0,
        discount: 0,
        total: subtotal,
        status: quoteData.status as any,
        items: {
          create: quoteData.items.map(item => ({
            description: item.description,
            quantity: 1,
            unitPrice: item.amount,
            amount: item.amount
          }))
        }
      }
    })
  }
  console.log('✅ Sample quotations created')

  console.log('🎉 Database seeded successfully!')
  console.log('')
  console.log('📋 Login credentials:')
  console.log('   Email: admin@mypanel.com')
  console.log('   Password: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
