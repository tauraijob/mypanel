import { runBillingCycle } from '../utils/billing'

export default defineNitroPlugin((nitroApp) => {
  console.log('⏰ Scheduler Plugin Loaded')

  // Run immediately on server start (useful for verifying logic during dev)
  // In production, you might want to wrap this in a check or delay
  setTimeout(() => {
    runBillingCycle()
  }, 5000) // 5s delay to let DB connect

  // Run every hour
  setInterval(() => {
    runBillingCycle()
  }, 60 * 60 * 1000)
})
