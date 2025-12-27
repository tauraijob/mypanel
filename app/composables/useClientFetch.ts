export const useClientFetch = (url: string, options: any = {}) => {
    const token = useCookie('client_token')

    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token.value}`
    }

    return useFetch(url, {
        ...options,
        headers
    })
}
