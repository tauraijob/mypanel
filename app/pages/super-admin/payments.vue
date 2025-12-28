<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">Subscription Payments</h1>
        <p class="text-slate-400">View all subscription payments from organizations</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-card p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <UIcon name="i-lucide-dollar-sign" class="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p class="text-sm text-slate-400">Total Revenue</p>
            <p class="text-2xl font-bold text-white">${{ data?.stats.totalRevenue.toFixed(2) || '0.00' }}</p>
          </div>
        </div>
      </div>
      
      <div class="glass-card p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p class="text-sm text-slate-400">Completed Payments</p>
            <p class="text-2xl font-bold text-white">{{ data?.stats.completedCount || 0 }}</p>
          </div>
        </div>
      </div>
      
      <div class="glass-card p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <UIcon name="i-lucide-clock" class="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p class="text-sm text-slate-400">Pending Payments</p>
            <p class="text-2xl font-bold text-white">{{ data?.stats.pendingCount || 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="glass-card p-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-400">Status:</span>
          <div class="flex gap-2">
            <UButton 
              v-for="s in statusOptions" 
              :key="s.value"
              :color="statusFilter === s.value ? 'primary' : 'neutral'"
              :variant="statusFilter === s.value ? 'solid' : 'ghost'"
              size="sm"
              @click="statusFilter = s.value"
            >
              {{ s.label }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Payments Table -->
    <div class="glass-card overflow-hidden">
      <div v-if="pending" class="p-8 text-center">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
        <p class="text-slate-400">Loading payments...</p>
      </div>
      
      <div v-else-if="!data?.payments.length" class="p-8 text-center">
        <UIcon name="i-lucide-receipt" class="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p class="text-slate-400">No payments found</p>
      </div>
      
      <table v-else class="w-full">
        <thead class="bg-slate-800/50">
          <tr>
            <th class="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3">Date</th>
            <th class="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3">Organization</th>
            <th class="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3">Plan</th>
            <th class="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3">Amount</th>
            <th class="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3">Method</th>
            <th class="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3">Period</th>
            <th class="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3">Status</th>
            <th class="text-left text-xs font-semibold text-slate-400 uppercase px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr v-for="payment in filteredPayments" :key="payment.id" class="hover:bg-white/5">
            <td class="px-4 py-3 text-sm text-slate-300">
              {{ formatDate(payment.createdAt) }}
            </td>
            <td class="px-4 py-3">
              <div>
                <p class="text-white font-medium">{{ payment.organizationName }}</p>
                <p class="text-xs text-slate-500">{{ payment.organizationEmail }}</p>
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-slate-300">
              {{ payment.planName }}
            </td>
            <td class="px-4 py-3 text-sm font-semibold text-emerald-400">
              ${{ payment.amount.toFixed(2) }} {{ payment.currency }}
            </td>
            <td class="px-4 py-3 text-sm text-slate-300">
              <UBadge color="neutral" variant="subtle" size="sm">
                {{ payment.paymentMethod }}
              </UBadge>
            </td>
            <td class="px-4 py-3 text-xs text-slate-400">
              <template v-if="payment.periodStart && payment.periodEnd">
                {{ formatDate(payment.periodStart) }} - {{ formatDate(payment.periodEnd) }}
              </template>
              <template v-else>—</template>
            </td>
            <td class="px-4 py-3">
              <UBadge 
                :color="getStatusColor(payment.status)"
                size="sm"
              >
                {{ payment.status }}
              </UBadge>
            </td>
            <td class="px-4 py-3">
              <NuxtLink :to="`/super-admin/organizations/${payment.organizationId}`">
                <UButton 
                  color="neutral" 
                  variant="ghost" 
                  size="xs"
                  icon="i-lucide-external-link"
                >
                  View Org
                </UButton>
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'super-admin',
  middleware: ['auth', 'super-admin']
})

useHead({
  title: 'Payments - Super Admin'
})

const statusFilter = ref('all')
const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Failed', value: 'FAILED' }
]

const { data, pending, refresh } = await useFetch('/api/super-admin/payments', {
  headers: useRequestHeaders(['cookie'])
})

const filteredPayments = computed(() => {
  if (!data.value?.payments) return []
  if (statusFilter.value === 'all') return data.value.payments
  return data.value.payments.filter((p: any) => p.status === statusFilter.value)
})

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'success'
    case 'PENDING': return 'warning'
    case 'FAILED': return 'error'
    default: return 'neutral'
  }
}
</script>
