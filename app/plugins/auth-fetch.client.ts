// Global fetch interceptor that adds auth token to all API requests
export default defineNuxtPlugin(() => {
    const token = () => {
        if (import.meta.client) {
            return localStorage.getItem('auth_token')
        }
        return null
    }

    // Add global fetch interceptor
    globalThis.$fetch = $fetch.create({
        onRequest({ options }) {
            const authToken = token()
            if (authToken) {
                const headers = options.headers || {}
                if (Array.isArray(headers)) {
                    headers.push(['Authorization', `Bearer ${authToken}`])
                } else if (headers instanceof Headers) {
                    headers.set('Authorization', `Bearer ${authToken}`)
                } else {
                    (headers as Record<string, string>).Authorization = `Bearer ${authToken}`
                }
                options.headers = headers
            }
        }
    })
})
