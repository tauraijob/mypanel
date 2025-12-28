// Poll Paynow for payment status
import { Paynow } from 'paynow'

export default defineEventHandler(async (event) => {
    const ctx = await requireOrgContext(event)
    const query = getQuery(event)
    const paymentId = query.paymentId as string

    if (!paymentId) {
        throw createError({ statusCode: 400, message: 'Payment ID required' })
    }

    // Get the pending payment
    const payment = await prisma.organizationPayment.findFirst({
        where: {
            id: parseInt(paymentId),
            organizationId: ctx.organizationId!
        }
    })

    if (!payment) {
        throw createError({ statusCode: 404, message: 'Payment not found' })
    }

    // If already completed, return success
    if (payment.status === 'COMPLETED') {
        return {
            status: 'COMPLETED',
            message: 'Payment successful! Your subscription is now active.'
        }
    }

    // If failed, return that
    if (payment.status === 'FAILED') {
        return {
            status: 'FAILED',
            message: 'Payment failed. Please try again.'
        }
    }

    // Poll Paynow for status
    const settings = await prisma.superAdminSettings.findFirst()

    if (!settings?.paynowIntegrationId || !settings?.paynowIntegrationKey || !payment.transactionId) {
        return { status: 'PENDING', message: 'Awaiting payment confirmation...' }
    }

    const paynow = new Paynow(
        settings.paynowIntegrationId,
        settings.paynowIntegrationKey
    )

    try {
        const pollResponse = await paynow.pollTransaction(payment.transactionId)

        console.log('Poll response:', pollResponse)

        if (pollResponse.paid) {
            // Update payment status
            await prisma.organizationPayment.update({
                where: { id: payment.id },
                data: {
                    status: 'COMPLETED',
                    transactionId: pollResponse.paynowReference || payment.transactionId
                }
            })

            // Activate the subscription
            await prisma.organization.update({
                where: { id: ctx.organizationId! },
                data: {
                    subscriptionStatus: 'ACTIVE',
                    subscriptionStart: payment.periodStart,
                    subscriptionEnd: payment.periodEnd
                }
            })

            return {
                status: 'COMPLETED',
                message: 'Payment successful! Your subscription is now active.'
            }
        }

        return {
            status: 'PENDING',
            message: 'Payment is being processed. Please wait...'
        }
    } catch (error) {
        console.error('Poll error:', error)
        return {
            status: 'PENDING',
            message: 'Checking payment status...'
        }
    }
})
