// Initiate Paynow payment for subscription plans
import { Paynow } from 'paynow'
import { getAppUrl } from '../../utils/config'

export default defineEventHandler(async (event) => {
    const ctx = await requireOrgContext(event)
    const body = await readBody(event)

    const { planId, billingCycle = 'MONTHLY' } = body

    if (!planId) {
        throw createError({ statusCode: 400, message: 'Plan ID is required' })
    }

    // Get the plan
    const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId }
    })

    if (!plan || !plan.isActive) {
        throw createError({ statusCode: 404, message: 'Plan not found' })
    }

    // Get Super Admin's Paynow credentials
    const settings = await prisma.superAdminSettings.findFirst()

    if (!settings?.paynowIntegrationId || !settings?.paynowIntegrationKey) {
        throw createError({
            statusCode: 500,
            message: 'Paynow is not configured. Please contact the administrator.'
        })
    }

    // Get the organization
    const organization = await prisma.organization.findUnique({
        where: { id: ctx.organizationId! }
    })

    if (!organization) {
        throw createError({ statusCode: 404, message: 'Organization not found' })
    }

    // Calculate amount
    const amount = billingCycle === 'YEARLY' ? Number(plan.yearlyPrice) : Number(plan.monthlyPrice)

    // Create Paynow instance with Super Admin credentials
    const paynow = new Paynow(
        settings.paynowIntegrationId,
        settings.paynowIntegrationKey
    )

    // Set return and result URLs
    const baseUrl = getAppUrl()
    paynow.resultUrl = `${baseUrl}/api/billing/paynow-callback`
    paynow.returnUrl = `${baseUrl}/billing?payment=pending`

    // Create payment
    const payment = paynow.createPayment(
        `SUB-${organization.id}-${Date.now()}`, // Reference
        organization.email
    )

    // Add item
    payment.add(`${plan.name} Subscription (${billingCycle})`, amount)

    try {
        // Send to Paynow
        const response = await paynow.send(payment)

        if (response.success) {
            // Store payment reference for callback handling
            await prisma.organizationPayment.create({
                data: {
                    organizationId: organization.id,
                    amount,
                    currency: 'USD',
                    paymentMethod: 'PAYNOW',
                    transactionId: response.pollUrl,
                    status: 'PENDING',
                    periodStart: new Date(),
                    periodEnd: billingCycle === 'YEARLY'
                        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            })

            return {
                success: true,
                redirectUrl: response.redirectUrl,
                pollUrl: response.pollUrl
            }
        } else {
            throw createError({
                statusCode: 400,
                message: response.error || 'Failed to initiate payment'
            })
        }
    } catch (error: any) {
        console.error('Paynow error:', error)
        throw createError({
            statusCode: 500,
            message: error.message || 'Failed to process payment'
        })
    }
})
