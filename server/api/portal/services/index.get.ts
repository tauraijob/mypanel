export default defineEventHandler(async (event) => {
    const client = requireClientAuth(event)

    const services = await prisma.service.findMany({
        where: {
            clientId: client.id
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            category: true
        }
    })

    return services
})
