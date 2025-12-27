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

    <!-- Payment Info -->
    <div class="glass-card p-6 border-l-4 border-l-amber-500 bg-amber-500/5">
      <div class="flex items-start gap-4">
        <UIcon name="i-lucide-info" class="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 class="font-semibold text-white mb-2">Payment Information</h4>
          <p class="text-slate-400 text-sm">
            After completing payment, your subscription will be activated within 24 hours. 
            For Paynow payments, please use your organization email as the reference.
            Contact support if your subscription isn't activated after payment.
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

// Use refs for client-side data fetching (token is in localStorage)
const status = ref<any>(null)
const config = ref<any>(null)
const loading = ref(true)

// Fetch billing data on client-side with auth headers
onMounted(async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    loading.value = false
    return
  }
  
  const headers = { Authorization: `Bearer ${token}` }
  
  try {
    const [statusData, configData] = await Promise.all([
      $fetch('/api/billing/status', { headers }),
      $fetch('/api/billing/config', { headers })
    ])
    status.value = statusData
    config.value = configData
  } catch (error) {
    console.error('Failed to fetch billing data:', error)
  } finally {
    loading.value = false
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
