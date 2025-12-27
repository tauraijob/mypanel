<template>
  <div class="space-y-6">
    <NuxtLayout name="super-admin">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-white">Platform Dashboard</h1>
        <p class="text-slate-400 mt-1">Overview of your SaaS platform</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="glass-card p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <UIcon name="i-lucide-building-2" class="w-7 h-7 text-white" />
            </div>
            <div>
              <p class="text-3xl font-bold text-white">{{ stats?.totalOrganizations || 0 }}</p>
              <p class="text-slate-400">Organizations</p>
            </div>
          </div>
        </div>

        <div class="glass-card p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <UIcon name="i-lucide-check-circle" class="w-7 h-7 text-white" />
            </div>
            <div>
              <p class="text-3xl font-bold text-white">{{ stats?.activeOrganizations || 0 }}</p>
              <p class="text-slate-400">Active</p>
            </div>
          </div>
        </div>

        <div class="glass-card p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <UIcon name="i-lucide-users" class="w-7 h-7 text-white" />
            </div>
            <div>
              <p class="text-3xl font-bold text-white">{{ stats?.totalUsers || 0 }}</p>
              <p class="text-slate-400">Total Users</p>
            </div>
          </div>
        </div>

        <div class="glass-card p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <UIcon name="i-lucide-dollar-sign" class="w-7 h-7 text-white" />
            </div>
            <div>
              <p class="text-3xl font-bold text-white">${{ Number(stats?.platformRevenue || 0).toFixed(2) }}</p>
              <p class="text-slate-400">Revenue</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section - Full Width -->
      <div class="glass-card p-6 mb-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-lg font-semibold text-white">Platform Analytics</h2>
            <p class="text-sm text-slate-400">Revenue for this period: <span class="text-emerald-400 font-bold">${{ Number(stats?.periodRevenue || 0).toFixed(2) }}</span></p>
          </div>
          <div class="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
            <button 
              v-for="p in ['day', 'month', 'year']" 
              :key="p"
              @click="period = p"
              class="px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize"
              :class="period === p ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'"
            >
              {{ p }}
            </button>
          </div>
        </div>
        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Organization Signups Chart -->
          <div class="lg:col-span-2 bg-white/5 rounded-xl p-6">
            <h3 class="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Trends ({{ period }})</h3>
            <div class="h-64 flex items-end justify-between gap-2">
              <div v-for="(value, index) in stats?.chartData?.signups || []" :key="index" class="flex-1 flex flex-col items-center gap-2">
                <!-- Signups Bar -->
                <div class="w-full flex items-end gap-1 h-full">
                  <div 
                    class="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-500"
                    :style="{ height: `${getBarHeight(value, maxSignups)}px` }"
                    :title="`Signups: ${value}`"
                  />
                  <div 
                    class="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all duration-500"
                    :style="{ height: `${getBarHeight(stats?.chartData?.revenue?.[index] || 0, maxRevenue, 180)}px` }"
                    :title="`Revenue: $${Number(stats?.chartData?.revenue?.[index] || 0).toFixed(2)}`"
                  />
                </div>
                <span class="text-[10px] text-slate-500 truncate w-full text-center">{{ stats?.chartData?.labels?.[index] || '' }}</span>
              </div>
              <div v-if="!stats?.chartData?.signups?.length" class="absolute inset-0 flex items-center justify-center text-slate-500">
                Loading data...
              </div>
            </div>
            <div class="flex items-center gap-6 mt-4">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-blue-500" />
                <span class="text-sm text-slate-400">Signups</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-emerald-500" />
                <span class="text-sm text-slate-400">Revenue ($)</span>
              </div>
            </div>
          </div>
          <!-- Status Distribution -->
          <div class="bg-white/5 rounded-xl p-6">
            <h3 class="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Subscription Status</h3>
            <div class="space-y-4">
              <div v-for="status in stats?.statusBreakdown || []" :key="status.status" class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-white">{{ status.status }}</span>
                  <span class="text-sm font-semibold text-white">{{ status.count }}</span>
                </div>
                <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all duration-500"
                    :class="getStatusBarColor(status.status)"
                    :style="{ width: `${getPercentage(status.count)}%` }"
                  />
                </div>
              </div>
              <div v-if="!stats?.statusBreakdown?.length" class="text-center py-4 text-slate-400">
                No data available
              </div>
            </div>
            
            <!-- Donut Chart Visual -->
            <div class="mt-6 relative">
              <svg class="w-32 h-32 mx-auto" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" stroke-width="12" />
                <circle 
                  v-for="(segment, i) in donutSegments" 
                  :key="i"
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  :stroke="segment.color" 
                  stroke-width="12"
                  :stroke-dasharray="`${segment.length} ${251.2 - segment.length}`"
                  :stroke-dashoffset="segment.offset"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center">
                  <p class="text-2xl font-bold text-white">{{ stats?.totalOrganizations || 0 }}</p>
                  <p class="text-xs text-slate-400">Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Organizations & Plan Stats -->
      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Recent Organizations -->
        <div class="glass-card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-white">Recent Organizations</h2>
            <NuxtLink to="/super-admin/organizations">
              <UButton variant="ghost" size="sm" color="neutral">View All</UButton>
            </NuxtLink>
          </div>
          <div class="space-y-4">
            <div
              v-for="org in stats?.recentOrganizations"
              :key="org.id"
              class="flex items-center justify-between p-4 rounded-xl bg-white/5"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <UIcon name="i-lucide-building" class="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p class="font-medium text-white">{{ org.name }}</p>
                  <p class="text-sm text-slate-400">{{ org.email }}</p>
                </div>
              </div>
              <UBadge :color="getStatusColor(org.subscriptionStatus)" variant="subtle">
                {{ org.subscriptionStatus }}
              </UBadge>
            </div>
            <div v-if="!stats?.recentOrganizations?.length" class="text-center py-8 text-slate-400">
              No organizations yet
            </div>
          </div>
        </div>

        <!-- Plan Stats -->
        <div class="glass-card p-6">
          <h2 class="text-lg font-semibold text-white mb-6">Subscription Plans</h2>
          <div class="space-y-4">
            <div
              v-for="plan in stats?.planStats"
              :key="plan.name"
              class="flex items-center justify-between p-4 rounded-xl bg-white/5"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <UIcon name="i-lucide-package" class="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p class="font-medium text-white">{{ plan.name }}</p>
                  <p class="text-sm text-slate-400">${{ Number(plan.monthlyPrice).toFixed(2) }}/month</p>
                </div>
              </div>
              <p class="text-2xl font-bold text-white">{{ plan._count.organizations }}</p>
            </div>
          </div>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'super-admin'
})

const stats = ref<any>(null)
const period = ref('month')

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'success'
    case 'TRIAL': return 'info'
    case 'PAST_DUE': return 'warning'
    case 'CANCELLED':
    case 'EXPIRED': return 'error'
    default: return 'neutral'
  }
}

const getStatusBarColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'bg-emerald-500'
    case 'TRIAL': return 'bg-blue-500'
    case 'PAST_DUE': return 'bg-amber-500'
    case 'CANCELLED': return 'bg-red-500'
    case 'EXPIRED': return 'bg-slate-500'
    default: return 'bg-slate-500'
  }
}

const maxSignups = computed(() => {
  const signups = stats.value?.chartData?.signups || []
  return Math.max(...signups, 1)
})

const maxRevenue = computed(() => {
  const revenue = stats.value?.chartData?.revenue || []
  return Math.max(...revenue, 1)
})

const getBarHeight = (value: number, max: number, maxHeight = 180) => {
  return Math.max((value / max) * maxHeight, 4)
}

const getPercentage = (count: number) => {
  const total = stats.value?.totalOrganizations || 1
  return Math.min((count / total) * 100, 100)
}

const statusColors: Record<string, string> = {
  ACTIVE: '#10B981',
  TRIAL: '#3B82F6',
  PAST_DUE: '#F59E0B',
  CANCELLED: '#EF4444',
  EXPIRED: '#64748B'
}

const donutSegments = computed(() => {
  const breakdown = stats.value?.statusBreakdown || []
  const total = stats.value?.totalOrganizations || 1
  const circumference = 251.2 // 2 * PI * 40
  
  let offset = 0
  return breakdown.map((s: any) => {
    const percentage = s.count / total
    const length = percentage * circumference
    const segment = {
      color: statusColors[s.status] || '#64748B',
      length,
      offset: -offset
    }
    offset += length
    return segment
  })
})

const fetchStats = async () => {
  try {
    const token = localStorage.getItem('auth_token')
    stats.value = await $fetch(`/api/super-admin/stats?period=${period.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

watch(period, fetchStats)
onMounted(fetchStats)
</script>
