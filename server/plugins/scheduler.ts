import { Cron } from 'croner'
import { addDays, addMonths, addYears, format } from 'date-fns'
import { getPublicInvoiceUrl } from '../utils/publicToken'

export default defineNitroPlugin(() => {
  // Run every day at 8:00 AM
  new Cron('0 8 * * *', async () => {
    console.log('Running daily scheduled jobs...')

    try {
      await generateDueInvoices()
      await sendRenewalReminders()
      await sendOverdueReminders()
      await sendAdminDailySummary()
    } catch (error) {
      console.error('Scheduled job error:', error)
    }
  })

  console.log('📧 Email reminder scheduler initialized')
  console.log('🧾 Auto-invoice generation scheduler initialized')
})

async function sendRenewalReminders() {
  const settings = await prisma.settings.findFirst()
  if (!settings) return

  const reminderDays = settings.reminderDays.split(',').map(d => parseInt(d.trim()))
  const companyName = settings.companyName
  const currency = settings.currencySymbol || '$'
  const now = new Date()

  for (const days of reminderDays) {
    const targetDate = addDays(now, days)
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))

    // Find services due on this day
    const services = await prisma.service.findMany({
      where: {
        status: 'ACTIVE',
        nextDueDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: { client: true }
    })

    for (const service of services) {
      // Check if we have unpaid invoice for this service
      const unpaidInvoice = await prisma.invoice.findFirst({
        where: {
          clientId: service.clientId,
          status: { in: ['SENT', 'DRAFT'] },
          items: {
            some: { serviceId: service.id }
          }
        }
      })

      if (unpaidInvoice) {
        const template = emailTemplates.paymentReminder({
          clientName: service.client.name,
          invoiceNumber: unpaidInvoice.invoiceNumber,
          amount: `${currency}${Number(unpaidInvoice.total).toFixed(2)}`,
          dueDate: format(unpaidInvoice.dueDate, 'MMMM d, yyyy'),
          daysUntilDue: days,
          companyName,
          viewUrl: getPublicInvoiceUrl(unpaidInvoice.id)
        })

        await sendEmail({
          to: service.client.email,
          subject: template.subject,
          html: template.html,
          type: 'INVOICE_REMINDER',
          referenceType: 'invoice',
          referenceId: unpaidInvoice.id
        })

        // Update reminder count
        await prisma.invoice.update({
          where: { id: unpaidInvoice.id },
          data: {
            lastReminderSent: new Date(),
            reminderCount: { increment: 1 }
          }
        })
      }
    }
  }
}

async function sendOverdueReminders() {
  const settings = await prisma.settings.findFirst()
  if (!settings) return

  const overdueDays = settings.overdueDays.split(',').map(d => parseInt(d.trim()))
  const companyName = settings.companyName
  const currency = settings.currencySymbol || '$'
  const now = new Date()

  for (const days of overdueDays) {
    const targetDate = addDays(now, -days)
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))

    // Find invoices that became overdue on this day
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: 'OVERDUE',
        dueDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: { client: true }
    })

    for (const invoice of overdueInvoices) {
      const template = emailTemplates.invoiceOverdue({
        clientName: invoice.client.name,
        invoiceNumber: invoice.invoiceNumber,
        amount: `${currency}${(Number(invoice.total) - Number(invoice.amountPaid)).toFixed(2)}`,
        dueDate: format(invoice.dueDate, 'MMMM d, yyyy'),
        daysOverdue: days,
        companyName,
        viewUrl: getPublicInvoiceUrl(invoice.id)
      })

      await sendEmail({
        to: invoice.client.email,
        subject: template.subject,
        html: template.html,
        type: 'INVOICE_OVERDUE',
        referenceType: 'invoice',
        referenceId: invoice.id
      })

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          lastReminderSent: new Date(),
          reminderCount: { increment: 1 }
        }
      })
    }
  }
}

async function sendAdminDailySummary() {
  const settings = await prisma.settings.findFirst()
  if (!settings?.companyEmail) return

  const now = new Date()
  const sevenDaysFromNow = addDays(now, 7)
  const currency = settings.currencySymbol || '$'

  // Get upcoming renewals
  const upcomingServices = await prisma.service.findMany({
    where: {
      status: 'ACTIVE',
      nextDueDate: {
        gte: now,
        lte: sevenDaysFromNow
      }
    },
    include: { client: true }
  })

  if (upcomingServices.length === 0) return

  const servicesData = upcomingServices.map(s => ({
    clientName: s.client.name,
    serviceName: s.name,
    dueDate: format(s.nextDueDate, 'MMM d, yyyy'),
    amount: `${currency}${Number(s.price).toFixed(2)}`
  }))

  const template = emailTemplates.adminRenewalReminder({
    services: servicesData
  })

  await sendEmail({
    to: settings.companyEmail,
    subject: template.subject,
    html: template.html,
    type: 'SERVICE_EXPIRING'
  })
}

// Calculate next due date based on billing cycle
function calculateNextDueDate(currentDueDate: Date, billingCycle: string): Date {
  switch (billingCycle) {
    case 'MONTHLY':
      return addMonths(currentDueDate, 1)
    case 'QUARTERLY':
      return addMonths(currentDueDate, 3)
    case 'SEMIANNUALLY':
      return addMonths(currentDueDate, 6)
    case 'ANNUALLY':
      return addYears(currentDueDate, 1)
    case 'BIENNIALLY':
      return addYears(currentDueDate, 2)
    case 'ONETIME':
    default:
      return currentDueDate
  }
}

// Generate invoices for services due today
async function generateDueInvoices() {
  const settings = await prisma.settings.findFirst()
  if (!settings) return

  const companyName = settings.companyName
  const currency = settings.currencySymbol || '$'
  const invoicePrefix = settings.invoicePrefix || 'INV-'

  const now = new Date()
  const startOfDay = new Date(now.setHours(0, 0, 0, 0))
  const endOfDay = new Date(now.setHours(23, 59, 59, 999))

  // Find active services with recurring billing due today
  const dueServices = await prisma.service.findMany({
    where: {
      status: 'ACTIVE',
      billingCycle: { not: 'ONETIME' },
      nextDueDate: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    include: { client: true, category: true }
  })

  console.log(`Found ${dueServices.length} services due for invoicing today`)

  for (const service of dueServices) {
    try {
      // Check if invoice already exists for this service and date
      const existingInvoice = await prisma.invoice.findFirst({
        where: {
          items: {
            some: { serviceId: service.id }
          },
          issueDate: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      })

      if (existingInvoice) {
        console.log(`Invoice already exists for service ${service.id}, skipping`)
        continue
      }

      // Get next invoice number
      const lastInvoice = await prisma.invoice.findFirst({
        orderBy: { id: 'desc' }
      })
      const nextNumber = lastInvoice
        ? parseInt(lastInvoice.invoiceNumber.replace(invoicePrefix, '')) + 1
        : 1
      const invoiceNumber = `${invoicePrefix}${String(nextNumber).padStart(4, '0')}`

      // Create invoice
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          clientId: service.clientId,
          issueDate: new Date(),
          dueDate: addDays(new Date(), 14),
          subtotal: service.price,
          taxAmount: 0,
          discount: 0,
          total: service.price,
          amountPaid: 0,
          status: 'SENT',
          items: {
            create: [{
              description: `${service.name} - ${format(new Date(), 'MMMM yyyy')}`,
              quantity: 1,
              unitPrice: service.price,
              amount: service.price,
              serviceId: service.id
            }]
          }
        },
        include: { client: true }
      })

      console.log(`Created invoice ${invoiceNumber} for service ${service.name}`)

      // Send invoice email to client
      const viewUrl = getPublicInvoiceUrl(invoice.id)
      const clientTemplate = emailTemplates.invoiceCreated({
        clientName: service.client.name,
        invoiceNumber: invoice.invoiceNumber,
        amount: `${currency}${Number(invoice.total).toFixed(2)}`,
        dueDate: format(invoice.dueDate, 'MMMM d, yyyy'),
        companyName,
        viewUrl
      })

      await sendEmail({
        to: service.client.email,
        subject: clientTemplate.subject,
        html: clientTemplate.html,
        type: 'INVOICE_CREATED',
        referenceType: 'invoice',
        referenceId: invoice.id
      })

      // Send notification to admin
      if (settings.companyEmail) {
        const adminSubject = `New Invoice Generated: ${invoice.invoiceNumber}`
        const adminHtml = `
          <p>A new invoice has been automatically generated:</p>
          <ul>
            <li><strong>Invoice:</strong> ${invoice.invoiceNumber}</li>
            <li><strong>Client:</strong> ${service.client.name}</li>
            <li><strong>Service:</strong> ${service.name}</li>
            <li><strong>Amount:</strong> ${currency}${Number(invoice.total).toFixed(2)}</li>
            <li><strong>Due Date:</strong> ${format(invoice.dueDate, 'MMMM d, yyyy')}</li>
          </ul>
        `
        await sendEmail({
          to: settings.companyEmail,
          subject: adminSubject,
          html: adminHtml,
          type: 'INVOICE_CREATED',
          referenceType: 'invoice',
          referenceId: invoice.id
        })
      }

      // Calculate and update the next due date for the service
      const newNextDueDate = calculateNextDueDate(service.nextDueDate, service.billingCycle)
      await prisma.service.update({
        where: { id: service.id },
        data: { nextDueDate: newNextDueDate }
      })

      console.log(`Updated next due date for service ${service.id} to ${format(newNextDueDate, 'yyyy-MM-dd')}`)

    } catch (error) {
      console.error(`Error generating invoice for service ${service.id}:`, error)
    }
  }
}
