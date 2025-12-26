
import { addDays, differenceInDays } from 'date-fns'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const days = parseInt(query.days as string) || 7

  const now = new Date()
  const futureDate = addDays(now, days)

  const services = await prisma.service.findMany({
    where: {
      status: 'ACTIVE',
      nextDueDate: {
        gte: now,
        lte: futureDate
      }
    },
    include: {
      client: {
        select: { id: true, name: true, email: true }
      },
      category: true
    },
    orderBy: { nextDueDate: 'asc' },
    take: 10
  })

  const renewals = services.map(service => {
    const daysUntilDue = differenceInDays(service.nextDueDate, now)
    return {
      id: service.id,
      service: service.name,
      client: service.client.name,
      clientEmail: service.client.email,
      amount: Number(service.price),
      dueDate: service.nextDueDate,
      daysUntilDue,
      category: service.category.name,
      categoryColor: service.category.color
    }
  })

  return renewals
})


