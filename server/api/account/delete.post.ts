// Delete organization account and all associated data
export default defineEventHandler(async (event) => {
    const authUser = requireAuth(event)
    const body = await readBody(event)

    // Get user's organization
    const user = await prisma.user.findUnique({
        where: { id: authUser.userId },
        select: { organizationId: true, role: true, email: true }
    })

    if (!user?.organizationId) {
        throw createError({
            statusCode: 403,
            message: 'No organization associated with your account'
        })
    }

    // Only admins can delete organization
    if (user.role !== 'ADMIN') {
        throw createError({
            statusCode: 403,
            message: 'Only organization admins can delete the account'
        })
    }

    // Require confirmation phrase
    if (body.confirmation !== 'DELETE MY ACCOUNT') {
        throw createError({
            statusCode: 400,
            message: 'Please type "DELETE MY ACCOUNT" to confirm'
        })
    }

    const orgId = user.organizationId

    // Delete all organization data in order (respect foreign keys)
    await prisma.$transaction(async (tx) => {
        // Delete email logs
        await tx.emailLog.deleteMany({ where: { organizationId: orgId } })

        // Delete invoice items
        await tx.invoiceItem.deleteMany({
            where: { invoice: { organizationId: orgId } }
        })

        // Delete quotation items
        await tx.quotationItem.deleteMany({
            where: { quotation: { organizationId: orgId } }
        })

        // Delete payments
        await tx.payment.deleteMany({ where: { organizationId: orgId } })

        // Delete invoices
        await tx.invoice.deleteMany({ where: { organizationId: orgId } })

        // Delete quotations
        await tx.quotation.deleteMany({ where: { organizationId: orgId } })

        // Delete services
        await tx.service.deleteMany({ where: { organizationId: orgId } })

        // Delete service categories
        await tx.serviceCategory.deleteMany({ where: { organizationId: orgId } })

        // Delete clients
        await tx.client.deleteMany({ where: { organizationId: orgId } })

        // Delete settings
        await tx.settings.deleteMany({ where: { organizationId: orgId } })

        // Delete users
        await tx.user.deleteMany({ where: { organizationId: orgId } })

        // Delete organization
        await tx.organization.delete({ where: { id: orgId } })
    })

    return {
        success: true,
        message: 'Your account and all data have been permanently deleted'
    }
})
