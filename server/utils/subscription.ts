import { differenceInDays, isPast, addDays } from 'date-fns'

export const checkSubscriptionStatus = (organization: any) => {
    if (!organization) return { status: 'UNKNOWN', valid: false }

    const status = organization.subscriptionStatus
    const expiresAt = organization.subscriptionEnd ? new Date(organization.subscriptionEnd) : null

    // Super Admin organization is always valid (assuming ID 1 or specific flag)
    // But for tenants:

    if (status === 'ACTIVE') {
        if (expiresAt && isPast(expiresAt)) {
            return { status: 'EXPIRED', valid: false, message: 'Subscription expired' }
        }
        return { status: 'ACTIVE', valid: true }
    }

    if (status === 'TRIAL') {
        // Assume 14 day trial if no date set, but usually date is set on creation
        if (expiresAt && isPast(expiresAt)) {
            return { status: 'EXPIRED', valid: false, message: 'Trial expired' }
        }
        return { status: 'TRIAL', valid: true, daysLeft: expiresAt ? differenceInDays(expiresAt, new Date()) : 0 }
    }

    return { status, valid: false }
}

export const getTrialEndDate = () => {
    return addDays(new Date(), 14) // 14 Day Free Trial
}
