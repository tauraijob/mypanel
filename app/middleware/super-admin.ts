// Super Admin middleware - requires SUPER_ADMIN role
export default defineNuxtRouteMiddleware(async (to) => {
    if (import.meta.server) return

    const token = localStorage.getItem('auth_token')

    if (!token) {
        return navigateTo('/login')
    }

    try {
        const user = await $fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        }) as any

        if (user.role !== 'SUPER_ADMIN') {
            // Not a super admin, redirect to login
            return navigateTo('/login?error=admin-required')
        }
    } catch {
        localStorage.removeItem('auth_token')
        return navigateTo('/login')
    }
})
