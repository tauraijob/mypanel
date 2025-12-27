export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip checking for:
    // 1. Login/Register pages
    // 2. Public pages (invoicing)
    // 3. Client Portal (/portal)
    // 4. Super Admin routes
    // 5. The billing page itself (to avoid loop)

    const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/setup', '/features', '/pricing', '/how-it-works', '/privacy', '/terms', '/contact']
    if (publicRoutes.includes(to.path) || to.path.startsWith('/portal') || to.path.startsWith('/api/') || to.path.startsWith('/public/')) {
        return
    }

    if (to.path === '/billing') return

    const { user } = useAuth()

    // Skip if not logged in (auth middleware handles that)
    if (!user.value) return

    // Skip Super Admin
    if (user.value.role === 'SUPER_ADMIN') return

    // Check subscription
    // We cache this check to avoid API hitting on every nav?
    // For now, use a composable state

    const subscription = useState('subscription_status')

    if (!subscription.value) {
        try {
            const { valid, status } = await $fetch('/api/billing/status')
            subscription.value = { valid, status }
        } catch (e) {
            console.error('Failed to check subscription', e)
            return // Fail open or closed? Open for now to avoid lockout on error
        }
    }

    if (subscription.value && !subscription.value.valid) {
        // Redirect to billing
        return navigateTo('/billing')
    }
})
