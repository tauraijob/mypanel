export default defineEventHandler(async (event) => {
    await requireSuperAdmin(event)
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    return prisma.subscriptionPlan.update({
        where: { id: Number(id) },
        data: {
            name: body.name,
            monthlyPrice: body.monthlyPrice,
            yearlyPrice: body.yearlyPrice,
            maxClients: body.maxClients,
            maxUsers: body.maxUsers,
            features: body.features
        }
    })
})
