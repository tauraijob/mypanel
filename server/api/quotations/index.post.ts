
import { addDays } from 'date-fns'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const {
    clientId,
    validDays,
    items,
    notes,
    terms,
    taxAmount,
    discount
  } = body

  if (!clientId || !items || items.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Client and at least one item are required'
    })
  }

  // Get settings for quote prefix
  const settings = await prisma.settings.findFirst()
  const prefix = settings?.quotePrefix || 'QUO-'

  // Get next quote number
  const lastQuote = await prisma.quotation.findFirst({
    orderBy: { id: 'desc' }
  })
  const nextNumber = (lastQuote?.id || 0) + 1
  const quoteNumber = `${prefix}${String(nextNumber).padStart(4, '0')}`

  // Calculate totals
  const subtotal = items.reduce((sum: number, item: any) => {
    return sum + (item.quantity * item.unitPrice)
  }, 0)

  const total = subtotal + (taxAmount || 0) - (discount || 0)

  // Create quotation
  const quotation = await prisma.quotation.create({
    data: {
      quoteNumber,
      clientId,
      validUntil: addDays(new Date(), validDays || 30),
      subtotal,
      taxAmount: taxAmount || 0,
      discount: discount || 0,
      total,
      notes,
      terms,
      status: 'DRAFT',
      items: {
        create: items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice
        }))
      }
    },
    include: {
      client: true,
      items: true
    }
  })

  return quotation
})


