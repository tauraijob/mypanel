<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">Dashboard</h1>
        <p class="text-slate-400 mt-1">Welcome back! Here's your business overview.</p>
      </div>
      <div class="flex items-center gap-3">
        <NuxtLink to="/invoices/new">
          <UButton color="primary" icon="i-lucide-plus">
            New Invoice
          </UButton>
        </NuxtLink>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="stats-card p-6 animate-fade-in stagger-1">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-400 text-sm font-medium">Total Clients</p>
            <p class="text-3xl font-bold text-white mt-2">{{ stats?.totalClients || 0 }}</p>
            <p class="text-sm mt-2" :class="(stats?.clientChange || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'">
              <UIcon :name="(stats?.clientChange || 0) >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" class="w-4 h-4 inline" />
              {{ stats?.clientChange || 0 }}% from last month
            </p>
          </div>
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-500/20">
            <UIcon name="i-lucide-users" class="w-7 h-7 text-blue-400" />
          </div>
        </div>
      </div>
      
      <div class="stats-card p-6 animate-fade-in stagger-2">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-400 text-sm font-medium">Active Services</p>
            <p class="text-3xl font-bold text-white mt-2">{{ stats?.activeServices || 0 }}</p>
            <p class="text-sm mt-2 text-emerald-400">
              <UIcon name="i-lucide-check-circle" class="w-4 h-4 inline" />
              All systems operational
            </p>
          </div>
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-500/20">
            <UIcon name="i-lucide-server" class="w-7 h-7 text-emerald-400" />
          </div>
        </div>
      </div>
      
      <div class="stats-card p-6 animate-fade-in stagger-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-400 text-sm font-medium">Pending Amount</p>
            <p class="text-3xl font-bold text-white mt-2">${{ formatNumber(stats?.pendingAmount || 0) }}</p>
            <p class="text-sm mt-2 text-amber-400">
              <UIcon name="i-lucide-clock" class="w-4 h-4 inline" />
              Awaiting payment
            </p>
          </div>
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-500/20">
            <UIcon name="i-lucide-clock" class="w-7 h-7 text-amber-400" />
          </div>
        </div>
      </div>
      
    </div>

    <!-- Reports Section -->
    <div class="glass-card p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-white flex items-center gap-2">
          <UIcon name="i-lucide-bar-chart-3" class="w-5 h-5 text-blue-400" />
          Revenue & Invoices Report
        </h2>
        <div class="flex gap-2">
          <UButton 
            v-for="p in periods" 
            :key="p.value"
            :variant="selectedPeriod === p.value ? 'solid' : 'ghost'"
            :color="selectedPeriod === p.value ? 'primary' : 'neutral'"
            size="sm"
            @click="changePeriod(p.value)"
          >
            {{ p.label }}
          </UButton>
        </div>
      </div>

      <!-- Chart -->
      <div class="h-72">
        <Line v-if="chartData" :data="chartData" :options="chartOptions" />
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div class="p-4 rounded-xl bg-white/5">
          <p class="text-slate-400 text-sm">Total Revenue</p>
          <p class="text-xl font-bold text-emerald-400">${{ formatNumber(reports?.summary?.totalRevenue || 0) }}</p>
        </div>
        <div class="p-4 rounded-xl bg-white/5">
          <p class="text-slate-400 text-sm">Total Invoiced</p>
          <p class="text-xl font-bold text-blue-400">${{ formatNumber(reports?.summary?.totalInvoiced || 0) }}</p>
        </div>
        <div class="p-4 rounded-xl bg-white/5">
          <p class="text-slate-400 text-sm">Collection Rate</p>
          <p class="text-xl font-bold text-amber-400">{{ reports?.summary?.collectionRate || 0 }}%</p>
        </div>
        <div class="p-4 rounded-xl bg-white/5">
          <p class="text-slate-400 text-sm">Payments Received</p>
          <p class="text-xl font-bold text-cyan-400">{{ reports?.summary?.paymentCount || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Upcoming Renewals -->
      <div class="lg:col-span-2 glass-card p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-white flex items-center gap-2">
            <UIcon name="i-lucide-calendar-clock" class="w-5 h-5 text-amber-400" />
            Upcoming Renewals
          </h2>
          <NuxtLink to="/services">
            <UButton variant="ghost" color="neutral" size="sm">View All</UButton>
          </NuxtLink>
        </div>
        
        <div class="space-y-3">
          <div
            v-for="renewal in upcomingRenewals"
            :key="renewal.id"
            class="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div 
              class="w-12 h-12 rounded-xl flex items-center justify-center"
              :class="getUrgencyClass(renewal.daysUntilDue).bg"
            >
              <UIcon name="i-lucide-server" class="w-6 h-6" :class="getUrgencyClass(renewal.daysUntilDue).text" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-white truncate">{{ renewal.service }}</p>
              <p class="text-sm text-slate-400">{{ renewal.client }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-white">${{ renewal.amount.toFixed(2) }}</p>
              <p class="text-sm" :class="getUrgencyClass(renewal.daysUntilDue).text">
                {{ renewal.daysUntilDue === 0 ? 'Due today' : renewal.daysUntilDue === 1 ? 'Due tomorrow' : `Due in ${renewal.daysUntilDue} days` }}
              </p>
            </div>
            <UButton 
              icon="i-lucide-file-plus" 
              variant="soft" 
              color="primary" 
              size="sm"
              @click="createInvoiceForService(renewal)"
            />
          </div>
          
          <div v-if="!upcomingRenewals || upcomingRenewals.length === 0" class="text-center py-8 text-slate-400">
            <UIcon name="i-lucide-calendar-check" class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No upcoming renewals in the next 7 days</p>
          </div>
        </div>
      </div>

      <!-- Overdue Invoices -->
      <div class="glass-card p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-white flex items-center gap-2">
            <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-rose-400" />
            Overdue Invoices
          </h2>
          <UBadge color="error">{{ overdueInvoices?.length || 0 }}</UBadge>
        </div>
        
        <div class="space-y-3">
          <NuxtLink
            v-for="invoice in overdueInvoices"
            :key="invoice.id"
            :to="`/invoices?id=${invoice.id}`"
            class="block p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-white">{{ invoice.number }}</span>
              <span class="text-rose-400 font-semibold">${{ invoice.amount.toFixed(2) }}</span>
            </div>
            <p class="text-sm text-slate-400">{{ invoice.client }}</p>
            <p class="text-xs text-rose-400 mt-1">{{ invoice.daysOverdue }} days overdue</p>
          </NuxtLink>
          
          <div v-if="!overdueInvoices || overdueInvoices.length === 0" class="text-center py-8 text-slate-400">
            <UIcon name="i-lucide-check-circle" class="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-50" />
            <p>All invoices are paid!</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity & Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Activity -->
      <div class="lg:col-span-2 glass-card p-6">
        <h2 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <UIcon name="i-lucide-activity" class="w-5 h-5 text-purple-400" />
          Recent Activity
        </h2>
        
        <div class="space-y-4">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="flex items-start gap-4"
          >
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              :class="getActivityClass(activity.color).bg"
            >
              <UIcon :name="`i-lucide-${activity.icon}`" class="w-5 h-5" :class="getActivityClass(activity.color).text" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white">{{ activity.message }}</p>
              <p class="text-sm text-slate-400 mt-1">{{ activity.detail }} • {{ activity.timeAgo }}</p>
            </div>
          </div>
          
          <div v-if="!recentActivity || recentActivity.length === 0" class="text-center py-8 text-slate-400">
            <UIcon name="i-lucide-inbox" class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No recent activity</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="glass-card p-6">
        <h2 class="text-lg font-semibold text-white mb-6">Quick Actions</h2>
        
        <div class="grid grid-cols-2 gap-3">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.label"
            :to="action.to"
            class="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-center group"
          >
            <div class="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-transform group-hover:scale-110" :class="action.iconBg">
              <UIcon :name="action.icon" class="w-6 h-6" :class="action.iconColor" />
            </div>
            <p class="text-sm font-medium text-white">{{ action.label }}</p>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Invoice Status & Payment Methods -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Invoice Status Breakdown -->
      <div class="glass-card p-6">
        <h2 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <UIcon name="i-lucide-pie-chart" class="w-5 h-5 text-purple-400" />
          Invoice Status Overview
        </h2>
        
        <div class="grid grid-cols-3 gap-4">
          <div class="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <UIcon name="i-lucide-check-circle" class="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p class="text-3xl font-bold text-emerald-400">{{ reports?.invoiceStatus?.paid || 0 }}</p>
            <p class="text-sm text-slate-400 mt-1">Paid</p>
          </div>
          <div class="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
            <UIcon name="i-lucide-clock" class="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <p class="text-3xl font-bold text-amber-400">{{ reports?.invoiceStatus?.pending || 0 }}</p>
            <p class="text-sm text-slate-400 mt-1">Pending</p>
          </div>
          <div class="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
            <UIcon name="i-lucide-alert-circle" class="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <p class="text-3xl font-bold text-rose-400">{{ reports?.invoiceStatus?.overdue || 0 }}</p>
            <p class="text-sm text-slate-400 mt-1">Overdue</p>
          </div>
        </div>

      </div>

      <!-- Payment Methods -->
      <div class="glass-card p-6">
        <h2 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <UIcon name="i-lucide-credit-card" class="w-5 h-5 text-cyan-400" />
          Payment Methods
        </h2>
        
        <div v-if="reports?.paymentMethods && Object.keys(reports.paymentMethods).length > 0" class="space-y-4">
          <div v-for="(amount, method) in reports.paymentMethods" :key="method" class="flex items-center gap-3">
            <div class="flex-1">
              <div class="flex justify-between text-sm mb-2">
                <span class="text-white font-medium">{{ formatPaymentMethod(method) }}</span>
                <span class="text-slate-400">${{ formatNumber(amount) }}</span>
              </div>
              <div class="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                  :style="{ width: `${reports.summary.totalRevenue > 0 ? (amount / reports.summary.totalRevenue) * 100 : 0}%` }"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-slate-400">
          <UIcon name="i-lucide-credit-card" class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No payments recorded yet</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

definePageMeta({
  layout: 'default'
})

const router = useRouter()
const toast = useToast()

// Period selection
const periods = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' }
]
const selectedPeriod = ref('month')

// Fetch dashboard data
const { data: stats, refresh: refreshStats } = await useFetch('/api/dashboard/stats')
const { data: upcomingRenewals, refresh: refreshRenewals } = await useFetch('/api/dashboard/upcoming-renewals', {
  query: { days: 7 }
})
const { data: overdueInvoices, refresh: refreshOverdue } = await useFetch('/api/dashboard/overdue-invoices')
const { data: reports, refresh: refreshReports } = await useFetch('/api/dashboard/reports', {
  query: { period: selectedPeriod }
})
const { data: recentActivity, refresh: refreshActivity } = await useFetch('/api/dashboard/activity')

// Chart configuration
const chartData = computed(() => {
  if (!reports.value) return null
  
  return {
    labels: reports.value.labels,
    datasets: [
      {
        label: 'Revenue',
        data: reports.value.revenueData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Invoiced',
        data: reports.value.invoiceData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: '#94a3b8',
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#fff',
      bodyColor: '#94a3b8',
      borderColor: '#334155',
      borderWidth: 1,
      padding: 12,
      callbacks: {
        label: (context: any) => `${context.dataset.label}: $${context.raw.toFixed(2)}`
      }
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: '#94a3b8' }
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { 
        color: '#94a3b8',
        callback: (value: number) => '$' + value
      }
    }
  }
}

// Quick actions
const quickActions = [
  {
    label: 'Add Client',
    to: '/clients',
    icon: 'i-lucide-user-plus',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400'
  },
  {
    label: 'New Invoice',
    to: '/invoices/new',
    icon: 'i-lucide-file-plus',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400'
  },
  {
    label: 'Add Service',
    to: '/services',
    icon: 'i-lucide-plus-circle',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400'
  },
  {
    label: 'New Quote',
    to: '/quotations',
    icon: 'i-lucide-file-check',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-400'
  }
]

// Helper functions
const formatNumber = (num: number) => {
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatPaymentMethod = (method: string) => {
  const methods: Record<string, string> = {
    BANK_TRANSFER: 'Bank Transfer',
    CREDIT_CARD: 'Credit Card',
    PAYPAL: 'PayPal',
    CASH: 'Cash',
    MOBILE_MONEY: 'Mobile Money',
    CRYPTO: 'Crypto',
    OTHER: 'Other'
  }
  return methods[method] || method
}

const getUrgencyClass = (daysUntilDue: number) => {
  if (daysUntilDue <= 2) return { bg: 'bg-rose-500/20', text: 'text-rose-400' }
  if (daysUntilDue <= 5) return { bg: 'bg-amber-500/20', text: 'text-amber-400' }
  return { bg: 'bg-blue-500/20', text: 'text-blue-400' }
}

const getActivityClass = (color: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
    rose: { bg: 'bg-rose-500/20', text: 'text-rose-400' },
    amber: { bg: 'bg-amber-500/20', text: 'text-amber-400' }
  }
  return colors[color] || colors.blue
}

const changePeriod = async (period: string) => {
  selectedPeriod.value = period
  await refreshReports()
}

const createInvoiceForService = (renewal: any) => {
  router.push(`/invoices/new?clientId=${renewal.id}`)
}

// Refresh data periodically
onMounted(() => {
  const interval = setInterval(() => {
    refreshStats()
    refreshRenewals()
    refreshOverdue()
    refreshActivity()
  }, 60000) // Refresh every minute
  
  onUnmounted(() => clearInterval(interval))
})
</script>
