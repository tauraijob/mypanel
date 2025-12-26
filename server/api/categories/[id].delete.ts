export default defineEventHandler(async (event) => {
    const id = parseInt(getRouterParam(event, 'id') || '')

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Invalid category ID'
        })
    }

    const existing = await prisma.serviceCategory.findUnique({
        where: { id },
        include: {
            _count: {
                select: { services: true }
            }
        }
    })

    if (!existing) {
        throw createError({
            statusCode: 404,
            message: 'Category not found'
        })
    }

    // Prevent deletion if category has services
    if (existing._count.services > 0) {
        throw createError({
            statusCode: 400,
            message: `Cannot delete category with ${existing._count.services} associated service(s). Please reassign or delete those services first.`
        })
    }

    await prisma.serviceCategory.delete({
        where: { id }
    })

    return { success: true, message: 'Category deleted successfully' }
})
