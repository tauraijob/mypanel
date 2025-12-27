export default defineEventHandler(async (event) => {
    await requireSuperAdmin(event)
    const id = getRouterParam(event, 'id')

    return prisma.subscriptionPlan.delete({
        where: { id: Number(id) }
    })
})
