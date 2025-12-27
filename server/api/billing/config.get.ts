export default defineEventHandler(async (event) => {
    // Require auth (any org user)
    const ctx = await requireOrgContext(event)

    const settings = await prisma.superAdminSettings.findFirst()

    return {
        paypalEmail: settings?.paypalEmail,
        paypalEnabled: settings?.paypalEnabled,
        paynowIntegrationId: settings?.paynowIntegrationId,
        paynowEnabled: settings?.paynowEnabled,
        currency: 'USD', // Platform currency
        plans: await prisma.subscriptionPlan.findMany({ where: { isActive: true } })
    }
})
