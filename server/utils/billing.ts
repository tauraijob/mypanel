import { addDays, differenceInDays, format } from 'date-fns'
import { createInvoice } from './invoice'
import { sendEmail, emailTemplates } from './email'

export const runBillingCycle = async () => {
    console.log('🔄 Running Billing Cycle...')

    try {
        const services = await prisma.service.findMany({
            where: {
                status: { in: ['ACTIVE', 'SUSPENDED'] }
            },
            include: {
                client: true,
                organization: {
                    include: {
                        settings: true
                    }
                }
            }
        })

        console.log(`Checking ${services.length} services...`)

        for (const service of services) {
            if (!service.organization.settings) continue

            const settings = service.organization.settings
            const reminderDays = (settings.reminderDays || '14,7,3,1').split(',').map(d => parseInt(d))
            const overdueDays = (settings.overdueDays || '1,3,7,14').split(',').map(d => parseInt(d))
            const suspendDays = settings.autoSuspendDays || 14

            const today = new Date()
            const daysUntilDue = differenceInDays(service.nextDueDate, today)
            const daysOverdue = -daysUntilDue

            // 1. Invoice Generation
            const generateOnDay = reminderDays[0] // e.g. 14

            if (daysUntilDue === generateOnDay) {
                // Check if invoice already exists for this service and due date
                const existingInvoice = await prisma.invoice.findFirst({
                    where: {
                        clientId: service.clientId,
                        items: {
                            some: { serviceId: service.id }
                        },
                        dueDate: {
                            gte: new Date(new Date(service.nextDueDate).setHours(0, 0, 0, 0)),
                            lt: new Date(new Date(service.nextDueDate).setHours(23, 59, 59, 999))
                        }
                    }
                })

                if (!existingInvoice) {
                    console.log(`Generating invoice for service ${service.name} (Client: ${service.client.name})`)
                    await createInvoice({
                        organizationId: service.organizationId,
                        clientId: service.clientId,
                        dueDate: service.nextDueDate,
                        items: [{
                            description: `Renewal: ${service.name} (${format(service.nextDueDate, 'MMM d, yyyy')} - ${format(getNextDueDate(service.nextDueDate, service.billingCycle), 'MMM d, yyyy')})`,
                            quantity: 1,
                            unitPrice: Number(service.price),
                            serviceId: service.id
                        }],
                        sendEmail: true
                    })
                }
            }

            // 3. Auto-Suspension
            if (service.status === 'ACTIVE' && daysOverdue >= suspendDays) {
                console.log(`Suspending overdue service ${service.name}`)
                await prisma.service.update({
                    where: { id: service.id },
                    data: { status: 'SUSPENDED' }
                })

                // Notify
                await sendEmail({
                    to: service.client.email,
                    subject: `Service Suspended: ${service.name}`,
                    html: emailTemplates.serviceSuspended({
                        clientName: service.client.name,
                        serviceName: service.name,
                        reason: `Payment overdue by ${daysOverdue} days`,
                        companyName: settings.companyName
                    }).html,
                    organizationId: service.organizationId,
                    type: 'SERVICE_SUSPENDED'
                })
            }
        }

        // Process Invoices for Reminders
        const invoicesToday = new Date()
        const unpaidInvoices = await prisma.invoice.findMany({
            where: {
                status: { in: ['SENT', 'OVERDUE', 'PARTIALLY_PAID'] },
                organization: { isActive: true }
            },
            include: { client: true, organization: { include: { settings: true } } }
        })

        for (const invoice of unpaidInvoices) {
            if (!invoice.organization.settings) continue

            const settings = invoice.organization.settings
            const daysOverdue = differenceInDays(invoicesToday, invoice.dueDate)
            const daysUntilDue = -daysOverdue

            // Overdue Reminders
            if (daysOverdue > 0 && settings.overdueDays.includes(String(daysOverdue))) {
                await sendEmail({
                    to: invoice.client.email,
                    subject: `Overdue Invoice #${invoice.invoiceNumber}`,
                    html: emailTemplates.invoiceOverdue({
                        clientName: invoice.client.name,
                        invoiceNumber: invoice.invoiceNumber,
                        amount: invoice.total.toString(),
                        dueDate: format(invoice.dueDate, 'MMM d, yyyy'),
                        daysOverdue,
                        companyName: settings.companyName
                    }).html,
                    organizationId: invoice.organizationId,
                    type: 'INVOICE_OVERDUE'
                })
            }

            // Due Soon Reminders
            if (daysUntilDue > 0 && settings.reminderDays.includes(String(daysUntilDue))) {
                await sendEmail({
                    to: invoice.client.email,
                    subject: `Payment Reminder: Invoice #${invoice.invoiceNumber}`,
                    html: emailTemplates.paymentReminder({
                        clientName: invoice.client.name,
                        invoiceNumber: invoice.invoiceNumber,
                        amount: invoice.total.toString(),
                        dueDate: format(invoice.dueDate, 'MMM d, yyyy'),
                        daysUntilDue,
                        companyName: settings.companyName
                    }).html,
                    organizationId: invoice.organizationId,
                    type: 'INVOICE_REMINDER'
                })
            }
        }

    } catch (error) {
        console.error('Billing Cycle Error:', error)
    }
}

function getNextDueDate(date: Date, cycle: string): Date {
    const d = new Date(date)
    switch (cycle) {
        case 'MONTHLY': return addDays(d, 30)
        case 'QUARTERLY': return addDays(d, 90)
        case 'SEMIANNUALLY': return addDays(d, 180)
        case 'ANNUALLY': return addDays(d, 365)
        default: return addDays(d, 30)
    }
}
