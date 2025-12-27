export default defineEventHandler(async (event) => {
    const client = requireClientAuth(event)

    const [unpaidInvoices, activeServices] = await Promise.all([
        prisma.invoice.count({
            where: {
                clientId: client.id,
                status: { in: ['SENT', 'OVERDUE', 'PARTIALLY_PAID'] }
            }
        }),
        prisma.service.count({
            where: {
                clientId: client.id,
                status: 'ACTIVE'
            }
        })
    ])

    const nextDueService = await prisma.service.findFirst({
        where: {
            clientId: client.id,
            status: 'ACTIVE'
        },
        orderBy: { nextDueDate: 'asc' },
        select: { nextDueDate: true }
    })

    return {
        unpaidInvoices,
        activeServices,
        nextDueDate: nextDueService?.nextDueDate
    }
})
