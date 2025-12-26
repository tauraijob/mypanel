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
})
