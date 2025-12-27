export default defineEventHandler(async (event) => {
    await requireSuperAdmin(event)
    return prisma.subscriptionPlan.findMany({
        orderBy: { sortOrder: 'asc' }
    })
})
