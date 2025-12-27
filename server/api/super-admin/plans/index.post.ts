export default defineEventHandler(async (event) => {
    await requireSuperAdmin(event)
    const body = await readBody(event)

    return prisma.subscriptionPlan.create({
        data: {
            name: body.name,
            monthlyPrice: body.monthlyPrice,
            yearlyPrice: body.yearlyPrice,
            maxClients: body.maxClients || -1,
            maxUsers: body.maxUsers || -1,
            features: body.features,
            isActive: true
        }
    })
})
