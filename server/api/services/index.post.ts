
import { addMonths, addDays, addYears } from 'date-fns'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const {
    name,
    description,
    price,
    billingCycle,
    startDate,
    clientId,
    categoryId,
    domain,
    server,
    username,
    notes
  } = body

  if (!name || !price || !clientId || !categoryId) {
    throw createError({
      statusCode: 400,
      message: 'Name, price, client, and category are required'
    })
  }

  // Calculate next due date based on billing cycle
  const start = new Date(startDate || new Date())
  let nextDueDate = start

  switch (billingCycle) {
    case 'MONTHLY':
      nextDueDate = addMonths(start, 1)
      break
    case 'QUARTERLY':
      nextDueDate = addMonths(start, 3)
      break
    case 'SEMIANNUALLY':
      nextDueDate = addMonths(start, 6)
      break
    case 'ANNUALLY':
      nextDueDate = addYears(start, 1)
      break
    case 'BIENNIALLY':
      nextDueDate = addYears(start, 2)
      break
    case 'ONETIME':
      nextDueDate = start
      break
  }

  const service = await prisma.service.create({
    data: {
      name,
      description,
      price,
      billingCycle: billingCycle || 'MONTHLY',
      startDate: start,
      nextDueDate,
      clientId,
      categoryId,
      domain,
      server,
      username,
      notes,
      status: 'PENDING'
    },
    include: {
      client: true,
      category: true
    }
  })

  return service
})


