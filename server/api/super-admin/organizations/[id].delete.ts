// Delete an organization (super admin only)
import { notifySuperAdminAccountDeletion } from '../../utils/superAdminNotifications'

export default defineEventHandler(async (event) => {
    await requireSuperAdmin(event)

    const id = parseInt(getRouterParam(event, 'id') as string)

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Organization ID is required'
        })
    }

    // Get organization details before deletion
    const organization = await prisma.organization.findUnique({
        where: { id },
        include: {
            users: true,
            clients: true,
            services: true
        }
    })

    if (!organization) {
        throw createError({
            statusCode: 404,
            message: 'Organization not found'
        })
    }

    try {
        // Delete in order to respect foreign key constraints
        // Delete payments first
        await prisma.organizationPayment.deleteMany({
            where: { organizationId: id }
        })

        // Delete invoices
        await prisma.invoice.deleteMany({
            where: { organizationId: id }
        })

        // Delete services
        await prisma.service.deleteMany({
            where: { organizationId: id }
        })

        // Delete clients
        await prisma.client.deleteMany({
            where: { organizationId: id }
        })

        // Delete users
        await prisma.user.deleteMany({
            where: { organizationId: id }
        })

        // Finally delete the organization
        await prisma.organization.delete({
            where: { id }
        })

        // Note: Super admin notification is optional here since they're the one deleting
        console.log(`Organization ${organization.name} (ID: ${id}) deleted by super admin`)

        return {
            success: true,
            message: `Organization "${organization.name}" has been deleted`
        }
    } catch (error: any) {
        console.error('Delete organization error:', error)
        throw createError({
            statusCode: 500,
            message: error.message || 'Failed to delete organization'
        })
    }
})
