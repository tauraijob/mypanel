import { format } from 'date-fns'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const exportFormat = (query.format as string) || 'json'

    // Fetch all data
    const [clients, services, invoices, payments, categories, settings] = await Promise.all([
        prisma.client.findMany({
            include: {
                services: true,
                invoices: true,
                payments: true
            }
        }),
        prisma.service.findMany({
            include: {
                client: { select: { id: true, name: true, email: true } },
                category: { select: { id: true, name: true } }
            }
        }),
        prisma.invoice.findMany({
            include: {
                client: { select: { id: true, name: true, email: true } },
                items: true,
                payments: true
            }
        }),
        prisma.payment.findMany({
            include: {
                client: { select: { id: true, name: true, email: true } },
                invoice: { select: { id: true, invoiceNumber: true } }
            }
        }),
        prisma.serviceCategory.findMany(),
        prisma.settings.findFirst()
    ])

    const exportData = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        data: {
            settings,
            categories,
            clients,
            services,
            invoices,
            payments
        },
        summary: {
            totalClients: clients.length,
            totalServices: services.length,
            totalInvoices: invoices.length,
            totalPayments: payments.length,
            totalCategories: categories.length
        }
    }

    if (exportFormat === 'json') {
        // Return JSON
        setHeader(event, 'Content-Type', 'application/json')
        setHeader(event, 'Content-Disposition', `attachment; filename="mypanel-export-${format(new Date(), 'yyyy-MM-dd')}.json"`)
        return exportData
    } else if (exportFormat === 'csv') {
        // Generate CSV for clients (main export)
        const csvLines: string[] = []

        // Clients CSV
        csvLines.push('=== CLIENTS ===')
        csvLines.push('ID,Name,Email,Phone,Company,Status,Created At')
        clients.forEach(c => {
            csvLines.push(`${c.id},"${c.name}","${c.email}","${c.phone || ''}","${c.company || ''}",${c.status},"${c.createdAt}"`)
        })

        csvLines.push('')
        csvLines.push('=== SERVICES ===')
        csvLines.push('ID,Name,Client,Category,Price,Billing Cycle,Status,Next Due Date')
        services.forEach(s => {
            csvLines.push(`${s.id},"${s.name}","${s.client?.name || ''}","${s.category?.name || ''}",${s.price},${s.billingCycle},${s.status},"${s.nextDueDate}"`)
        })

        csvLines.push('')
        csvLines.push('=== INVOICES ===')
        csvLines.push('ID,Invoice Number,Client,Total,Amount Paid,Status,Issue Date,Due Date')
        invoices.forEach(i => {
            csvLines.push(`${i.id},"${i.invoiceNumber}","${i.client?.name || ''}",${i.total},${i.amountPaid},${i.status},"${i.issueDate}","${i.dueDate}"`)
        })

        csvLines.push('')
        csvLines.push('=== PAYMENTS ===')
        csvLines.push('ID,Client,Invoice,Amount,Method,Date,Reference')
        payments.forEach(p => {
            csvLines.push(`${p.id},"${p.client?.name || ''}","${p.invoice?.invoiceNumber || ''}",${p.amount},${p.paymentMethod},"${p.paymentDate}","${p.reference || ''}"`)
        })

        const csvContent = csvLines.join('\n')

        setHeader(event, 'Content-Type', 'text/csv')
        setHeader(event, 'Content-Disposition', `attachment; filename="mypanel-export-${format(new Date(), 'yyyy-MM-dd')}.csv"`)
        return csvContent
    }

    return exportData
})
