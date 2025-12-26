import { verifyPublicToken } from '../../../utils/publicToken'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token') || ''

  const verified = verifyPublicToken(token)
  
  if (!verified || verified.type !== 'invoice') {
    throw createError({
      statusCode: 404,
      message: 'Invoice not found or link has expired'
    })
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: verified.id },
    include: {
      client: true,
      items: {
        include: {
          service: true
        }
      },
      payments: {
        orderBy: { paymentDate: 'desc' }
      }
    }
  })

  if (!invoice) {
    throw createError({
      statusCode: 404,
      message: 'Invoice not found'
    })
  }

  const settings = await prisma.settings.findFirst()

  // Return limited data for public view (hide sensitive info)
  return {
    invoice: {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      discount: invoice.discount,
      total: invoice.total,
      amountPaid: invoice.amountPaid,
      status: invoice.status,
      notes: invoice.notes,
      terms: invoice.terms,
      items: invoice.items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount
      })),
      client: {
        name: invoice.client.name,
        company: invoice.client.company,
        email: invoice.client.email
      },
      payments: invoice.payments.map(p => ({
        amount: p.amount,
        paymentDate: p.paymentDate,
        paymentMethod: p.paymentMethod
      }))
    },
    settings: settings ? {
      companyName: settings.companyName,
      companyEmail: settings.companyEmail,
      companyPhone: settings.companyPhone,
      companyAddress: settings.companyAddress,
      companyCity: settings.companyCity,
      companyState: settings.companyState,
      companyZip: settings.companyZip,
      companyWebsite: settings.companyWebsite,
      logoUrl: settings.logoUrl,
      currencySymbol: settings.currencySymbol,
      bankDetails: settings.bankDetails,
      invoiceFooter: settings.invoiceFooter
    } : null,
    token
  }
})

