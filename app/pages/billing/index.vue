<template>
  <div v-if="loading" class="flex items-center justify-center h-64">
    <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-blue-400 animate-spin" />
  </div>
  <div v-else class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">Billing & Subscription</h1>
        <p class="text-slate-400">Manage your subscription and view available plans</p>
      </div>
    </div>

    <!-- Current Plan Status Card -->
    <div class="glass-card p-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="statusBgClass">
              <UIcon :name="statusIcon" class="w-6 h-6" :class="statusIconClass" />
            </div>
            <div>
              <p class="text-sm text-slate-400">Current Status</p>
              <p class="text-xl font-bold" :class="statusTextClass">{{ statusLabel }}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-slate-500">Current Plan</p>
              <p class="text-white font-semibold">{{ status?.plan?.name || 'No Plan' }}</p>
            </div>
            <div>
              <p class="text-slate-500">{{ status?.status === 'TRIAL' ? 'Trial Ends In' : 'Next Renewal' }}</p>
              <p class="text-white font-semibold">
                <template v-if="status?.daysLeft !== undefined">
                  {{ status.daysLeft }} days
                </template>
                <template v-else-if="status?.expiresAt">
                  {{ new Date(status.expiresAt).toLocaleDateString() }}
                </template>
                <template v-else>—</template>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Available Plans -->
    <div>
      <h2 class="text-xl font-bold text-white mb-4">
        {{ status?.status === 'TRIAL' || status?.status === 'EXPIRED' ? 'Choose a Plan to Subscribe' : 'Upgrade or Renew' }}
      </h2>
      
      <div v-if="config?.plans?.length" class="grid md:grid-cols-3 gap-6">
        <div 
          v-for="plan in config.plans" 
          :key="plan.id" 
          class="glass-card p-6 flex flex-col relative overflow-hidden transition-all hover:scale-[1.02]"
          :class="{ 'ring-2 ring-blue-500': currentPlanId === plan.id }"
        >
          <div v-if="currentPlanId === plan.id" class="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
            CURRENT
          </div>
          
          <h3 class="text-xl font-bold text-white mb-2">{{ plan.name }}</h3>
          <p class="text-slate-400 text-sm mb-4 min-h-[40px]">{{ plan.description || 'Perfect for your business needs.' }}</p>
          
          <div class="text-3xl font-bold text-white mb-4">
            ${{ Number(plan.monthlyPrice).toFixed(0) }}
            <span class="text-sm text-slate-400 font-normal">/month</span>
          </div>
          
          <div class="flex-1 text-slate-400 text-sm space-y-2 mb-6">
            <p class="flex items-center gap-2">
              <UIcon name="i-lucide-users" class="w-4 h-4" />
              {{ plan.maxClients === -1 ? 'Unlimited' : plan.maxClients }} Clients
            </p>
            <p class="flex items-center gap-2">
              <UIcon name="i-lucide-users-2" class="w-4 h-4" />
              {{ plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers }} Team Members
            </p>
            <p class="flex items-center gap-2">
              <UIcon name="i-lucide-server" class="w-4 h-4" />
              {{ plan.maxServices === -1 ? 'Unlimited' : plan.maxServices }} Services
            </p>
          </div>
          
          <!-- Payment Options -->
          <div class="space-y-2">
            <!-- Paynow -->
            <UButton 
              block 
              color="primary"
              :icon="processingPayment ? 'i-lucide-loader-2' : 'i-lucide-smartphone'"
              :loading="processingPayment"
              :disabled="processingPayment"
              @click="initiatePaynow(plan)"
            >
              {{ currentPlanId === plan.id ? 'Renew with Paynow' : 'Pay with Paynow' }}
            </UButton>
          </div>
        </div>
      </div>
      
      <div v-else class="glass-card p-12 text-center">
        <UIcon name="i-lucide-package-x" class="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p class="text-slate-400">No subscription plans are currently available.</p>
        <p class="text-slate-500 text-sm mt-2">Please contact the administrator.</p>
      </div>
    </div>

    <!-- Pending Payment Status -->
    <div v-if="pendingPayment" class="glass-card p-6 border-l-4 border-l-blue-500 bg-blue-500/5">
      <div class="flex items-center gap-4">
        <UIcon name="i-lucide-loader-2" class="w-6 h-6 text-blue-400 animate-spin shrink-0" />
        <div class="flex-1">
          <h4 class="font-semibold text-white mb-1">Payment Processing</h4>
          <p class="text-slate-400 text-sm">{{ paymentStatus }}</p>
        </div>
        <UButton 
          v-if="paymentCompleted"
          color="primary"
          @click="refreshData"
        >
          Refresh Status
        </UButton>
      </div>
    </div>

    <!-- Payment History -->
    <div>
      <h2 class="text-xl font-bold text-white mb-4">Payment History</h2>
      
      <div v-if="payments?.length" class="glass-card overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-800/50">
            <tr>
              <th class="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3">Date</th>
              <th class="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3">Description</th>
              <th class="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3">Amount</th>
              <th class="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="payment in payments" :key="payment.id" class="hover:bg-white/5">
              <td class="px-4 py-3 text-sm text-slate-300">
                {{ new Date(payment.createdAt).toLocaleDateString() }}
              </td>
              <td class="px-4 py-3 text-sm text-white">
                {{ payment.planName }} Subscription
              </td>
              <td class="px-4 py-3 text-sm text-white font-medium">
                ${{ payment.amount.toFixed(2) }}
              </td>
              <td class="px-4 py-3">
                <UBadge 
                  :color="payment.status === 'COMPLETED' ? 'success' : payment.status === 'FAILED' ? 'error' : 'warning'"
                  size="sm"
                >
                  {{ payment.status }}
                </UBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-else class="glass-card p-8 text-center">
        <UIcon name="i-lucide-receipt" class="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p class="text-slate-400">No payment history yet.</p>
      </div>
    </div>

    <!-- Payment Info -->
    <div class="glass-card p-6 border-l-4 border-l-amber-500 bg-amber-500/5">
      <div class="flex items-start gap-4">
        <UIcon name="i-lucide-info" class="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 class="font-semibold text-white mb-2">Payment Information</h4>
          <p class="text-slate-400 text-sm">
            After completing payment, your subscription will be activated automatically.
            If your subscription isn't activated within a few minutes, try refreshing the page or contact support.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const runtimeConfig = useRuntimeConfig()
const baseUrl = runtimeConfig.public.appUrl || 'http://localhost:3000'
const route = useRoute()
const toast = useToast()

// Use refs for client-side data fetching (token is in localStorage)
const status = ref<any>(null)
const config = ref<any>(null)
const payments = ref<any[]>([])
const loading = ref(true)

// Pending payment tracking
const pendingPayment = ref(false)
const paymentStatus = ref('Checking payment status...')
const paymentCompleted = ref(false)
let pollInterval: NodeJS.Timeout | null = null

const fetchData = async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) return

  const headers = { Authorization: `Bearer ${token}` }

  try {
    const [statusData, configData, paymentsData] = await Promise.all([
      $fetch('/api/billing/status', { headers }),
      $fetch('/api/billing/config', { headers }),
      $fetch('/api/billing/payments', { headers })
    ])
    status.value = statusData
    config.value = configData
    payments.value = paymentsData as any[]
  } catch (error) {
    console.error('Failed to fetch billing data:', error)
  }
}

const refreshData = async () => {
  loading.value = true
  pendingPayment.value = false
  paymentCompleted.value = false
  await fetchData()
  loading.value = false
}

// Poll for payment status
const pollPaymentStatus = async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) return

  // Find the most recent pending payment
  const pendingPaymentRecord = payments.value.find(p => p.status === 'PENDING')
  if (!pendingPaymentRecord) {
    pendingPayment.value = false
    return
  }

  try {
    const result = await $fetch(`/api/billing/check-payment?paymentId=${pendingPaymentRecord.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }) as { status: string; message: string }

    paymentStatus.value = result.message

    if (result.status === 'COMPLETED') {
      paymentCompleted.value = true
      pendingPayment.value = false
      if (pollInterval) {
        clearInterval(pollInterval)
        pollInterval = null
      }
      toast.add({
        title: 'Payment Successful!',
        description: 'Your subscription is now active.',
        color: 'success'
      })
      await fetchData()
    } else if (result.status === 'FAILED') {
      pendingPayment.value = false
      if (pollInterval) {
        clearInterval(pollInterval)
        pollInterval = null
      }
      toast.add({
        title: 'Payment Failed',
        description: 'Please try again.',
        color: 'error'
      })
    }
  } catch (error) {
    console.error('Failed to check payment:', error)
  }
}

// Fetch billing data on client-side with auth headers
onMounted(async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    loading.value = false
    return
  }

  await fetchData()
  loading.value = false

  // Check if returning from payment
  if (route.query.payment === 'pending') {
    pendingPayment.value = true
    // Start polling for payment status
    pollPaymentStatus()
    pollInterval = setInterval(pollPaymentStatus, 5000) // Poll every 5 seconds
  }
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})

const currentPlanId = computed(() => status.value?.plan?.id)

const statusLabel = computed(() => {
  switch (status.value?.status) {
    case 'ACTIVE': return 'Active'
    case 'TRIAL': return 'Trial Period'
    case 'EXPIRED': return 'Expired'
    case 'SUSPENDED': return 'Suspended'
    default: return status.value?.status || 'Unknown'
  }
})

const statusBgClass = computed(() => {
  switch (status.value?.status) {
    case 'ACTIVE': return 'bg-emerald-500/20'
    case 'TRIAL': return 'bg-blue-500/20'
    case 'EXPIRED': return 'bg-red-500/20'
    case 'SUSPENDED': return 'bg-amber-500/20'
    default: return 'bg-slate-500/20'
  }
})

const statusIconClass = computed(() => {
  switch (status.value?.status) {
    case 'ACTIVE': return 'text-emerald-400'
    case 'TRIAL': return 'text-blue-400'
    case 'EXPIRED': return 'text-red-400'
    case 'SUSPENDED': return 'text-amber-400'
    default: return 'text-slate-400'
  }
})

const statusTextClass = computed(() => {
  switch (status.value?.status) {
    case 'ACTIVE': return 'text-emerald-400'
    case 'TRIAL': return 'text-blue-400'
    case 'EXPIRED': return 'text-red-400'
    case 'SUSPENDED': return 'text-amber-400'
    default: return 'text-white'
  }
})

const statusIcon = computed(() => {
  switch (status.value?.status) {
    case 'ACTIVE': return 'i-lucide-check-circle'
    case 'TRIAL': return 'i-lucide-clock'
    case 'EXPIRED': return 'i-lucide-alert-circle'
    case 'SUSPENDED': return 'i-lucide-pause-circle'
    default: return 'i-lucide-help-circle'
  }
})

const processingPayment = ref(false)

const initiatePaynow = async (plan: any) => {
  const toast = useToast()
  const token = localStorage.getItem('auth_token')
  
  if (!token) {
    toast.add({
      title: 'Authentication Required',
      description: 'Please log in to continue with payment.',
      color: 'error'
    })
    return
  }
  
  processingPayment.value = true
  
  try {
    const response = await $fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { planId: plan.id, billingCycle: 'MONTHLY' }
    }) as { success: boolean; redirectUrl: string }
    
    if (response.success && response.redirectUrl) {
      toast.add({
        title: 'Redirecting to Paynow',
        description: 'You will be redirected to complete your payment.',
        color: 'info'
      })
      // Redirect to Paynow payment page
      window.location.href = response.redirectUrl
    }
  } catch (error: any) {
    toast.add({
      title: 'Payment Error',
      description: error.data?.message || 'Failed to initiate payment. Please try again.',
      color: 'error'
    })
  } finally {
    processingPayment.value = false
  }
}
</script>
