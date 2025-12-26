import { Cron } from 'croner'
import { addDays, format } from 'date-fns'
import { getPublicInvoiceUrl } from '../utils/publicToken'

export default defineNitroPlugin(() => {
  // Run every day at 8:00 AM
  new Cron('0 8 * * *', async () => {
    console.log('Running daily email reminder job...')

    try {
      await sendRenewalReminders()
      await sendOverdueReminders()
      await sendAdminDailySummary()
    } catch (error) {
      console.error('Email reminder job error:', error)
    }
  })

  console.log('📧 Email reminder scheduler initialized')
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


