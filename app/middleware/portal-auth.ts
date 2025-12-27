export default defineNuxtRouteMiddleware((to, from) => {
    const token = useCookie('client_token')

    if (!token.value && to.path !== '/portal/login') {
        return navigateTo('/portal/login')
    }

    if (token.value && to.path === '/portal/login') {
        return navigateTo('/portal')
    }
})
