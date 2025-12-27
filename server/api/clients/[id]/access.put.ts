import { hashPassword } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
    const ctx = await requireOrgContext(event)
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!body.password || body.password.length < 6) {
        throw createError({ statusCode: 400, message: 'Password must be at least 6 characters' })
    }

    // Ensure client belongs to organization
    const client = await prisma.client.findFirst({
        where: { id: Number(id), organizationId: ctx.organizationId }
    })

    if (!client) {
        throw createError({ statusCode: 404, message: 'Client not found' })
    }

    const hashedPassword = await hashPassword(body.password)

    await prisma.client.update({
        where: { id: client.id },
        data: {
            password: hashedPassword,
            portalAccess: true
        }
    })

    return { success: true }
})
