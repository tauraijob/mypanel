export default defineEventHandler(async (event) => {
    const client = requireClientAuth(event)

    const invoices = await prisma.invoice.findMany({
        where: {
            clientId: client.id
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            items: true
        }
    })

    return invoices
})
