<template>
  <div class="space-y-6">
    <NuxtLayout name="super-admin">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-blue-400 animate-spin" />
      </div>

      <template v-else-if="org">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div class="flex items-center gap-4">
            <NuxtLink to="/super-admin/organizations" class="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-slate-400" />
            </NuxtLink>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ org.name }}</h1>
              <p class="text-slate-400 mt-1">{{ org.email }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UBadge :color="getStatusColor(org.subscriptionStatus)" size="lg" variant="subtle">
              {{ org.subscriptionStatus }}
            </UBadge>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="glass-card p-5">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <UIcon name="i-lucide-users" class="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p class="text-2xl font-bold text-white">{{ org._count?.clients || 0 }}</p>
                <p class="text-sm text-slate-400">Clients</p>
              </div>
            </div>
          </div>
          <div class="glass-card p-5">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <UIcon name="i-lucide-user-check" class="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p class="text-2xl font-bold text-white">{{ org.users?.length || 0 }}</p>
                <p class="text-sm text-slate-400">Users</p>
              </div>
            </div>
          </div>
          <div class="glass-card p-5">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <UIcon name="i-lucide-file-text" class="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p class="text-2xl font-bold text-white">{{ org._count?.invoices || 0 }}</p>
                <p class="text-sm text-slate-400">Invoices</p>
              </div>
            </div>
          </div>
          <div class="glass-card p-5">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <UIcon name="i-lucide-dollar-sign" class="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p class="text-2xl font-bold text-white">${{ formatMoney(org.totalRevenue) }}</p>
                <p class="text-sm text-slate-400">Revenue</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Organization Details -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Subscription Info -->
            <div class="glass-card p-6">
              <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <UIcon name="i-lucide-credit-card" class="w-5 h-5 text-blue-400" />
                Subscription
              </h2>
              <div class="grid sm:grid-cols-2 gap-4">
                <div class="p-4 rounded-xl bg-white/5">
                  <p class="text-sm text-slate-400">Plan</p>
                  <p class="text-lg font-semibold text-white">{{ org.plan?.name || 'No Plan' }}</p>
                </div>
                <div class="p-4 rounded-xl bg-white/5">
                  <p class="text-sm text-slate-400">Status</p>
                  <p class="text-lg font-semibold" :class="getStatusTextColor(org.subscriptionStatus)">
                    {{ org.subscriptionStatus }}
                  </p>
                </div>
                <div class="p-4 rounded-xl" :class="getSubscriptionEndBg(org)">
                  <p class="text-sm text-slate-400">{{ org.subscriptionStatus === 'TRIAL' ? 'Trial Ends' : 'Subscription Ends' }}</p>
                  <p class="text-lg font-semibold text-white">
                    {{ org.subscriptionEnd ? formatDate(org.subscriptionEnd) : 'N/A' }}
                  </p>
                  <p v-if="org.subscriptionEnd && getDaysRemaining(org.subscriptionEnd) !== null" 
                     class="text-xs mt-1" 
                     :class="getDaysRemaining(org.subscriptionEnd)! <= 5 ? 'text-rose-400' : 'text-emerald-400'">
                    {{ getDaysRemainingText(org.subscriptionEnd) }}
                  </p>
                </div>
                <div class="p-4 rounded-xl bg-white/5">
                  <p class="text-sm text-slate-400">Billing Cycle</p>
                  <p class="text-lg font-semibold text-white">
                    {{ org.billingCycle || 'Monthly' }}
                  </p>
                </div>
                <div class="p-4 rounded-xl bg-white/5 sm:col-span-2">
                  <p class="text-sm text-slate-400">Subscription Started</p>
                  <p class="text-lg font-semibold text-white">
                    {{ org.subscriptionStart ? formatDate(org.subscriptionStart) : formatDate(org.createdAt) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Users Table -->
            <div class="glass-card p-6">
              <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <UIcon name="i-lucide-users" class="w-5 h-5 text-purple-400" />
                Users ({{ org.users?.length || 0 }})
              </h2>
              <div class="overflow-x-auto">
                <table class="w-full min-w-[500px]">
                  <thead>
                    <tr class="border-b border-white/10">
                      <th class="text-left p-3 text-slate-400 font-medium text-sm">Name</th>
                      <th class="text-left p-3 text-slate-400 font-medium text-sm">Role</th>
                      <th class="text-left p-3 text-slate-400 font-medium text-sm">Status</th>
                      <th class="text-left p-3 text-slate-400 font-medium text-sm">Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="user in org.users" 
                      :key="user.id"
                      class="border-b border-white/5"
                    >
                      <td class="p-3">
                        <p class="text-white font-medium">{{ user.name }}</p>
                        <p class="text-sm text-slate-400">{{ user.email }}</p>
                      </td>
                      <td class="p-3">
                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                          {{ user.role }}
                        </span>
                      </td>
                      <td class="p-3">
                        <span 
                          class="px-2 py-1 rounded-full text-xs font-medium"
                          :class="user.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'"
                        >
                          {{ user.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td class="p-3 text-slate-400 text-sm">
                        {{ user.lastLogin ? formatDate(user.lastLogin) : 'Never' }}
                      </td>
                    </tr>
                    <tr v-if="!org.users?.length">
                      <td colspan="4" class="p-6 text-center text-slate-400">
                        No users found
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Organization Info -->
            <div class="glass-card p-6">
              <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <UIcon name="i-lucide-building-2" class="w-5 h-5 text-sky-400" />
                Details
              </h2>
              <div class="space-y-4">
                <div>
                  <p class="text-sm text-slate-400">Organization Name</p>
                  <p class="text-white font-medium">{{ org.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-slate-400">Email</p>
                  <p class="text-white font-medium">{{ org.email }}</p>
                </div>
                <div>
                  <p class="text-sm text-slate-400">Created</p>
                  <p class="text-white font-medium">{{ formatDate(org.createdAt) }}</p>
                </div>
                <div>
                  <p class="text-sm text-slate-400">Last Updated</p>
                  <p class="text-white font-medium">{{ formatDate(org.updatedAt) }}</p>
                </div>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="glass-card p-6">
              <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <UIcon name="i-lucide-bar-chart-3" class="w-5 h-5 text-emerald-400" />
                Activity
              </h2>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">Services</span>
                  <span class="text-white font-semibold">{{ org._count?.services || 0 }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">Invoices</span>
                  <span class="text-white font-semibold">{{ org._count?.invoices || 0 }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">Payments</span>
                  <span class="text-white font-semibold">{{ org._count?.payments || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="glass-card p-6">
              <h2 class="text-lg font-semibold text-white mb-4">Actions</h2>
              <div class="space-y-2">
                <UButton 
                  block 
                  color="primary" 
                  variant="soft"
                  icon="i-lucide-pencil"
                  @click="navigateTo(`/super-admin/organizations?edit=${org.id}`)"
                >
                  Edit Organization
                </UButton>
                <UButton 
                  block 
                  color="neutral" 
                  variant="soft"
                  icon="i-lucide-arrow-left"
                  @click="navigateTo('/super-admin/organizations')"
                >
                  Back to List
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Not Found -->
      <div v-else class="text-center py-20">
        <UIcon name="i-lucide-building-2" class="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 class="text-xl font-bold text-white mb-2">Organization Not Found</h2>
        <p class="text-slate-400 mb-6">The organization you're looking for doesn't exist.</p>
        <UButton color="primary" @click="navigateTo('/super-admin/organizations')">
          Back to Organizations
        </UButton>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

definePageMeta({
  layout: false
})

const route = useRoute()
const loading = ref(true)
const org = ref<any>(null)

const fetchOrg = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('auth_token')
    org.value = await $fetch(`/api/super-admin/organizations/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (error) {
    console.error('Error fetching organization:', error)
    org.value = null
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => format(new Date(date), 'MMM d, yyyy')
const formatMoney = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getStatusColor = (status: string) => {
  const colors: Record<string, any> = {
    ACTIVE: 'success',
    TRIAL: 'info',
    PAST_DUE: 'warning',
    CANCELLED: 'error',
    EXPIRED: 'neutral'
  }
  return colors[status] || 'neutral'
}

const getStatusTextColor = (status: string) => {
  const colors: Record<string, string> = {
    ACTIVE: 'text-emerald-400',
    TRIAL: 'text-blue-400',
    PAST_DUE: 'text-amber-400',
    CANCELLED: 'text-rose-400',
    EXPIRED: 'text-slate-400'
  }
  return colors[status] || 'text-slate-400'
}

const getDaysRemaining = (endDate: string): number | null => {
  if (!endDate) return null
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const getDaysRemainingText = (endDate: string): string => {
  const days = getDaysRemaining(endDate)
  if (days === null) return ''
  if (days < 0) return `Expired ${Math.abs(days)} days ago`
  if (days === 0) return 'Expires today!'
  if (days === 1) return 'Expires tomorrow!'
  return `${days} days remaining`
}

const getSubscriptionEndBg = (org: any): string => {
  if (!org.subscriptionEnd) return 'bg-white/5'
  const days = getDaysRemaining(org.subscriptionEnd)
  if (days === null) return 'bg-white/5'
  if (days <= 5) return 'bg-rose-500/20 border border-rose-500/30'
  if (days <= 10) return 'bg-amber-500/20 border border-amber-500/30'
  return 'bg-white/5'
}

onMounted(fetchOrg)
</script>
