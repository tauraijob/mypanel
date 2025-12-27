import { format } from 'date-fns'
import { getPublicInvoiceUrl } from '../utils/publicToken'
import { sendEmail, emailTemplates } from '../utils/email'

interface InvoiceItemInput {
    description: string
    quantity: number
    unitPrice: number
    serviceId?: number | null
}

interface CreateInvoiceParams {
    organizationId: number
    clientId: number
    dueDate: Date
    items: InvoiceItemInput[]
    notes?: string
    terms?: string
    taxAmount?: number
    discount?: number
    sendEmail?: boolean
}

export const createInvoice = async (params: CreateInvoiceParams) => {
    const {
        organizationId,
        clientId,
        dueDate,
        items,
        notes,
        terms,
        taxAmount = 0,
        discount = 0,
        sendEmail: shouldSendEmail = false
    } = params

    if (!clientId || !items || items.length === 0) {
        throw createError({
            statusCode: 400,
            message: 'Client and at least one item are required'
        })
    }

    // Get organization settings
    const settings = await prisma.settings.findUnique({
        where: { organizationId }
    })

    if (!settings) {
        throw createError({
            statusCode: 404,
            message: 'Organization settings not found'
        })
    }

    const prefix = settings.invoicePrefix || 'INV-'
    const currency = settings.currencySymbol || '$'

    // Get next invoice number for this organization
    const lastInvoice = await prisma.invoice.findFirst({
        where: { organizationId },
        orderBy: { id: 'desc' }
    })

    // Simple increment logic - in production you might want checking for gaps or format parsing
    // For now, we append a sequential number. 
    // Should ideally extract number from last string, but simple count + 1 is MVP safe enough for now
    // or just use total count.
    // Let's use count of invoices + 1 to be safe against non-numeric suffixes?
    // Or better: Use global sequence or try to parse. 
    // Let's stick to existing logic: (lastInvoice.id) is global ID, not per org sequence.
    // We need per-org sequence support in future, but for now let's reuse the simple logic
    // WAIT: Invoice number must be unique per org. 
    // Let's count invoices in org and add 1.
    const invoiceCount = await prisma.invoice.count({
        where: { organizationId }
    })
    const nextNumber = invoiceCount + 1
    const invoiceNumber = `${prefix}${String(nextNumber).padStart(4, '0')}`

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
        return sum + (Number(item.quantity) * Number(item.unitPrice))
    }, 0)

    const total = subtotal + Number(taxAmount) - Number(discount)

    // Create invoice
    const invoice = await prisma.invoice.create({
        data: {
            invoiceNumber,
            organizationId,
            clientId,
            dueDate: new Date(dueDate),
            subtotal,
            taxAmount: Number(taxAmount),
            discount: Number(discount),
            total,
            notes,
            terms: terms || settings.invoiceNotes, // Default to settings notes/terms if not provided ??
            status: 'DRAFT',
            items: {
                create: items.map(item => ({
                    description: item.description,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice),
                    amount: Number(item.quantity) * Number(item.unitPrice),
                    serviceId: item.serviceId || null
                }))
            }
        },
        include: {
            client: true,
            items: true
        }
    })

    // Send email if requested
    if (shouldSendEmail) {
        const companyName = settings.companyName || 'MyPanel'

        // For URL generation, we need base URL. In Cron context, event might not exist.
        // We should use process.env.APP_URL
        const baseUrl = process.env.APP_URL || 'http://localhost:3000'
        const viewUrl = getPublicInvoiceUrl(invoice.id, baseUrl)

        const template = emailTemplates.invoiceCreated({
            clientName: invoice.client.name,
            invoiceNumber: invoice.invoiceNumber,
            amount: `${currency}${total.toFixed(2)}`,
            dueDate: format(new Date(dueDate), 'MMMM d, yyyy'),
            companyName,
            viewUrl
        })

        // Using existing sendEmail utility which handles org/platform settings lookup internally?
        // sendEmail uses prisma.settings.findFirst() without orgId context?
        // We should probably pass orgId to sendEmail if possible, or context.
        // The current sendEmail implementation looks up *global* findFirst(). 
        // We need to fix sendEmail to awareness of Organization context eventually.
        // For now, it falls back to whatever it finds. 
        // BUT createInvoice passes specific orgId.

        await sendEmail({
            to: invoice.client.email,
            subject: template.subject,
            html: template.html,
            type: 'INVOICE_CREATED',
            referenceType: 'invoice',
            referenceId: invoice.id,
            organizationId
        })

        // Update status to SENT
        await prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: 'SENT' }
        })
    }

    return invoice
}
