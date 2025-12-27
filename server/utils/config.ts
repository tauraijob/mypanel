/**
 * Utility to get a clean APP_URL from environment variables.
 * Handles cases where comments or extra whitespace might be present in the .env file.
 */
export const getAppUrl = () => {
    const rawUrl = process.env.APP_URL || 'http://localhost:3000'

    // Remove any trailing comments (starting with #) and trim whitespace
    let cleanUrl = rawUrl.split('#')[0].trim()

    // Remove trailing slash if present for consistency
    if (cleanUrl.endsWith('/')) {
        cleanUrl = cleanUrl.slice(0, -1)
    }

    return cleanUrl
}
