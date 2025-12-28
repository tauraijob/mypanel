<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">Subscription Payments</h1>
        <p class="text-slate-400">View all subscription payments from organizations</p>
      </div>
      <UButton 
        icon="i-lucide-refresh-cw" 
        color="neutral" 
        variant="ghost"
        :loading="loading"
        @click="fetchPayments"
      >
        Refresh
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-blue-400 animate-spin" />
    </div>

    <template v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass-card p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <UIcon name="i-lucide-dollar-sign" class="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p class="text-sm text-slate-400">Total Revenue</p>
              <p class="text-2xl font-bold text-white">${{ stats.totalRevenue.toFixed(2) }}</p>
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
              <p class="text-2xl font-bold text-white">{{ stats.completedCount }}</p>
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
              <p class="text-2xl font-bold text-white">{{ stats.pendingCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue Chart -->
      <div class="glass-card p-6">
        <h3 class="text-lg font-semibold text-white mb-4">Revenue Over Time</h3>
        <div v-if="chartData.labels.length" class="h-64">
          <canvas ref="chartCanvas"></canvas>
        </div>
        <div v-else class="h-64 flex items-center justify-center">
          <p class="text-slate-500">No payment data for chart</p>
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
        <div v-if="!filteredPayments.length" class="p-8 text-center">
          <UIcon name="i-lucide-receipt" class="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p class="text-slate-400">No payments found</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="w-full">
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
  </div>
</template>

<script setup lang="ts">
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

definePageMeta({
  layout: 'super-admin',
  middleware: ['auth', 'super-admin']
})

useHead({
  title: 'Payments - Super Admin'
})

const loading = ref(true)
const payments = ref<any[]>([])
const stats = ref({ totalRevenue: 0, completedCount: 0, pendingCount: 0 })
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const statusFilter = ref('all')
const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Failed', value: 'FAILED' }
]

const fetchPayments = async () => {
  loading.value = true
  const token = localStorage.getItem('auth_token')
  
  if (!token) {
    loading.value = false
    return
  }

  try {
    const data = await $fetch('/api/super-admin/payments', {
      headers: { Authorization: `Bearer ${token}` }
    }) as any

    payments.value = data.payments || []
    stats.value = data.stats || { totalRevenue: 0, completedCount: 0, pendingCount: 0 }
    
    // Render chart after data loads
    nextTick(() => {
      renderChart()
    })
  } catch (error) {
    console.error('Failed to fetch payments:', error)
  } finally {
    loading.value = false
  }
}

const filteredPayments = computed(() => {
  if (statusFilter.value === 'all') return payments.value
  return payments.value.filter(p => p.status === statusFilter.value)
})

// Prepare chart data - group by month
const chartData = computed(() => {
  const completedPayments = payments.value.filter(p => p.status === 'COMPLETED')
  
  if (!completedPayments.length) {
    return { labels: [], data: [] }
  }

  // Group by month
  const monthlyData: Record<string, number> = {}
  
  completedPayments.forEach(payment => {
    const date = new Date(payment.createdAt)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + payment.amount
  })

  // Sort by date and get last 12 months
  const sortedKeys = Object.keys(monthlyData).sort().slice(-12)
  
  return {
    labels: sortedKeys.map(key => {
      const [year, month] = key.split('-')
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }),
    data: sortedKeys.map(key => monthlyData[key])
  }
})

const renderChart = () => {
  if (!chartCanvas.value || !chartData.value.labels.length) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: chartData.value.labels,
      datasets: [{
        label: 'Revenue',
        data: chartData.value.data,
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `$${ctx.raw?.toLocaleString()}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#94a3b8',
            callback: (value) => `$${value}`
          },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        x: {
          ticks: { color: '#94a3b8' },
          grid: { display: false }
        }
      }
    }
  })
}

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

onMounted(() => {
  fetchPayments()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>
