// Paynow callback handler for subscription payments
import { Paynow } from 'paynow'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    // Get Super Admin's Paynow credentials
    const settings = await prisma.superAdminSettings.findFirst()

    if (!settings?.paynowIntegrationId || !settings?.paynowIntegrationKey) {
        throw createError({ statusCode: 500, message: 'Paynow not configured' })
    }

    const { reference, paynowreference, pollurl, status, amount } = body

    console.log('Paynow callback received:', { reference, paynowreference, status, amount })

    // Find the pending payment by pollUrl
    const payment = await prisma.organizationPayment.findFirst({
        where: {
            transactionId: pollurl,
            status: 'PENDING'
        }
    })

    if (!payment) {
        console.log('No pending payment found for pollUrl:', pollurl)
        return { success: false, message: 'Payment not found' }
    }

    // Handle based on status
    if (status === 'Paid' || status === 'Awaiting Delivery') {
        // Update payment status
        await prisma.organizationPayment.update({
            where: { id: payment.id },
            data: {
                status: 'COMPLETED',
                transactionId: paynowreference || pollurl
            }
        })

        // Get organization and plan details
        const organization = await prisma.organization.findUnique({
            where: { id: payment.organizationId },
            include: { plan: true }
        })

        // Activate the subscription
        await prisma.organization.update({
            where: { id: payment.organizationId },
            data: {
                subscriptionStatus: 'ACTIVE',
                subscriptionStart: payment.periodStart,
                subscriptionEnd: payment.periodEnd
            }
        })

        // Notify super admin about the payment
        if (organization) {
            notifySuperAdminPayment({
                organizationId: organization.id,
                organizationName: organization.name,
                organizationEmail: organization.email,
                amount: Number(payment.amount),
                currency: payment.currency,
                planName: organization.plan?.name || 'Subscription',
                periodStart: payment.periodStart,
                periodEnd: payment.periodEnd,
                paymentMethod: payment.paymentMethod
            })
        }

        console.log(`Subscription activated for org ${payment.organizationId}`)

        return { success: true, message: 'Payment processed' }
    } else if (status === 'Failed' || status === 'Cancelled') {
        await prisma.organizationPayment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' }
        })

        return { success: false, message: 'Payment failed' }
    }

    return { success: true, message: 'Callback received' }
})
