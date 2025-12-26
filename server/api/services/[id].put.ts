import { addMonths, addYears } from 'date-fns'

// Calculate next due date based on billing cycle
function calculateNextDueDate(startDate: Date, billingCycle: string): Date {
  switch (billingCycle) {
    case 'MONTHLY':
      return addMonths(startDate, 1)
    case 'QUARTERLY':
      return addMonths(startDate, 3)
    case 'SEMIANNUALLY':
      return addMonths(startDate, 6)
    case 'ANNUALLY':
      return addYears(startDate, 1)
    case 'BIENNIALLY':
      return addYears(startDate, 2)
    case 'ONETIME':
    default:
      return startDate
  }
}

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid service ID'
    })
  }

  const existing = await prisma.service.findUnique({
    where: { id }
  })

  if (!existing) {
    throw createError({
      statusCode: 404,
      message: 'Service not found'
    })
  }

  // Determine the next due date
  let nextDueDate: Date | undefined

  if (body.nextDueDate) {
    // User explicitly set the next due date
    nextDueDate = new Date(body.nextDueDate)
  } else if (body.startDate || body.billingCycle) {
    // Recalculate based on start date and billing cycle
    const startDate = body.startDate ? new Date(body.startDate) : existing.startDate
    const billingCycle = body.billingCycle || existing.billingCycle
    nextDueDate = calculateNextDueDate(startDate, billingCycle)
  }

  const service = await prisma.service.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      price: body.price,
      billingCycle: body.billingCycle,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      nextDueDate: nextDueDate,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      status: body.status,
      domain: body.domain,
      server: body.server,
      username: body.username,
      notes: body.notes,
      categoryId: body.categoryId
    },
    include: {
      client: true,
      category: true
    }
  })

  return service
})
