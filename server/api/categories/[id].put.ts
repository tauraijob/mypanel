export default defineEventHandler(async (event) => {
    const id = parseInt(getRouterParam(event, 'id') || '')
    const body = await readBody(event)

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Invalid category ID'
        })
    }

    const existing = await prisma.serviceCategory.findUnique({
        where: { id }
    })

    if (!existing) {
        throw createError({
            statusCode: 404,
            message: 'Category not found'
        })
    }

    const { name, description, color, icon } = body

    // Check if name conflicts with another category
    if (name && name !== existing.name) {
        const nameExists = await prisma.serviceCategory.findUnique({
            where: { name }
        })
        if (nameExists) {
            throw createError({
                statusCode: 400,
                message: 'A category with this name already exists'
            })
        }
    }

    const category = await prisma.serviceCategory.update({
        where: { id },
        data: {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(color && { color }),
            ...(icon && { icon })
        }
    })

    return category
})
