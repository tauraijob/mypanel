export default defineNuxtRouteMiddleware(async (to, from) => {
    // Only run on client side
    if (import.meta.server) return

    const { user, loading, fetchUser } = useAuth()

    // If we haven't loaded the user yet, fetch them
    if (loading.value && !user.value) {
        await fetchUser()
    }

    // If no user after fetching, redirect to login
    if (!user.value) {
        return navigateTo('/login')
    }

    // Prevent non-super-admins from accessing super-admin routes
    if (to.path.startsWith('/super-admin') && user.value.role !== 'SUPER_ADMIN') {
        return navigateTo('/login?error=admin-required')
    }

    // Redirect Super Admin to super-admin dashboard if trying to access regular pages
    if (user.value.role === 'SUPER_ADMIN' && !to.path.startsWith('/super-admin')) {
        return navigateTo('/super-admin')
    }
})

