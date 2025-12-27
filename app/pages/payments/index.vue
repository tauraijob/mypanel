<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-white">Payments</h1>
        <p class="text-slate-400 mt-1">Track all payment transactions</p>
      </div>
    </div>

    <!-- Revenue Overview -->
    <div class="glass-card p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-white flex items-center gap-2">
          <UIcon name="i-lucide-trending-up" class="w-5 h-5 text-emerald-400" />
          Revenue Overview
        </h2>
        <div class="flex gap-2 overflow-x-auto pb-1 -mb-1">
          <button
            v-for="period in periods"
            :key="period.value"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0"
            :class="selectedPeriod === period.value 
              ? 'bg-emerald-500 text-white' 
              : 'bg-white/5 text-slate-400 hover:bg-white/10'"
            @click="selectedPeriod = period.value"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/30 flex items-center justify-center">
              <UIcon name="i-lucide-dollar-sign" class="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p class="text-3xl font-bold text-emerald-400">${{ formatMoney(stats.total) }}</p>
              <p class="text-xs text-slate-400">Total Received</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-xl bg-white/5 border border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <UIcon name="i-lucide-calendar" class="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p class="text-3xl font-bold text-white">${{ formatMoney(stats.thisMonth) }}</p>
              <p class="text-xs text-slate-400">This Month</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-xl bg-white/5 border border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-slate-500/20 flex items-center justify-center">
              <UIcon name="i-lucide-history" class="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p class="text-3xl font-bold text-slate-300">${{ formatMoney(stats.lastMonth) }}</p>
              <p class="text-xs text-slate-400">Last Month</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-xl bg-white/5 border border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <UIcon name="i-lucide-hash" class="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p class="text-3xl font-bold text-purple-400">{{ stats.count }}</p>
              <p class="text-xs text-slate-400">Transactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Methods Breakdown -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="glass-card p-6">
        <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-pie-chart" class="w-5 h-5 text-blue-400" />
          By Payment Method
        </h3>
        <div class="space-y-3">
          <div
            v-for="method in methodBreakdown"
            :key="method.method"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div 
                class="w-8 h-8 rounded-lg flex items-center justify-center"
                :class="getMethodBgClass(method.method)"
              >
                <UIcon :name="getMethodIcon(method.method)" class="w-4 h-4" :class="getMethodTextClass(method.method)" />
              </div>
              <span class="text-white">{{ formatMethod(method.method) }}</span>
            </div>
            <div class="text-right">
              <p class="text-white font-semibold">${{ formatMoney(method.total) }}</p>
              <p class="text-xs text-slate-400">{{ method.count }} transactions</p>
            </div>
          </div>
          <div v-if="methodBreakdown.length === 0" class="text-center py-4 text-slate-400">
            No payment data yet
          </div>
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-users" class="w-5 h-5 text-purple-400" />
          Top Paying Clients
        </h3>
        <div class="space-y-3">
          <div
            v-for="(client, index) in topClients"
            :key="client.id"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                {{ index + 1 }}
              </div>
              <NuxtLink :to="`/clients/${client.id}`" class="text-white hover:text-blue-400 transition-colors">
                {{ client.name }}
              </NuxtLink>
            </div>
            <p class="text-emerald-400 font-semibold">${{ formatMoney(client.total) }}</p>
          </div>
          <div v-if="topClients.length === 0" class="text-center py-4 text-slate-400">
            No payment data yet
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="glass-card p-4">
      <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div class="relative flex-1 sm:flex-none sm:w-64">
          <UIcon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
          <UInput
            v-model="search"
            placeholder="Search by client or invoice..."
            class="w-full pl-10"
            :ui="{ base: 'pl-10' }"
            @input="debouncedFetch"
          />
        </div>
        <div class="flex gap-2 overflow-x-auto pb-1 -mb-1">
          <button
            v-for="method in methodFilters"
            :key="method.value"
            class="px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shrink-0"
            :class="methodFilter === method.value 
              ? 'bg-emerald-500 text-white' 
              : 'bg-white/5 text-slate-400 hover:bg-white/10'"
            @click="setMethodFilter(method.value)"
          >
            <UIcon v-if="method.icon" :name="method.icon" class="w-4 h-4" />
            {{ method.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Payments Table -->
    <div class="glass-card overflow-hidden">
      <div class="overflow-x-auto">
      <table class="w-full min-w-[900px]">
        <thead>
          <tr class="border-b border-white/10">
            <th class="text-left p-4 text-slate-400 font-medium">Date</th>
            <th class="text-left p-4 text-slate-400 font-medium">Client</th>
            <th class="text-left p-4 text-slate-400 font-medium">Invoice</th>
            <th class="text-left p-4 text-slate-400 font-medium">Method</th>
            <th class="text-left p-4 text-slate-400 font-medium">Reference</th>
            <th class="text-right p-4 text-slate-400 font-medium">Amount</th>
            <th class="text-right p-4 text-slate-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="payment in payments"
            :key="payment.id"
            class="border-b border-white/5 hover:bg-white/5 transition-colors"
          >
            <td class="p-4">
              <p class="text-white">{{ formatDate(payment.paymentDate) }}</p>
              <p class="text-xs text-slate-400">{{ formatTime(payment.paymentDate) }}</p>
            </td>
            <td class="p-4">
              <NuxtLink :to="`/clients/${payment.client.id}`" class="text-blue-400 hover:text-blue-300 flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                  {{ getInitials(payment.client.name) }}
                </div>
                {{ payment.client.name }}
              </NuxtLink>
            </td>
            <td class="p-4">
              <NuxtLink :to="`/invoices/${payment.invoice.id}`" class="text-white hover:text-blue-300 font-mono text-sm">
                {{ payment.invoice.invoiceNumber }}
              </NuxtLink>
            </td>
            <td class="p-4">
              <div class="flex items-center gap-2">
                <div 
                  class="w-8 h-8 rounded-lg flex items-center justify-center"
                  :class="getMethodBgClass(payment.paymentMethod)"
                >
                  <UIcon :name="getMethodIcon(payment.paymentMethod)" class="w-4 h-4" :class="getMethodTextClass(payment.paymentMethod)" />
                </div>
                <span class="text-slate-300">{{ formatMethod(payment.paymentMethod) }}</span>
              </div>
            </td>
            <td class="p-4">
              <p v-if="payment.reference" class="text-slate-400 font-mono text-sm">{{ payment.reference }}</p>
              <p v-else class="text-slate-500">-</p>
            </td>
            <td class="p-4 text-right">
              <span class="font-bold text-emerald-400 text-lg">${{ Number(payment.amount).toFixed(2) }}</span>
            </td>
            <td class="p-4 text-right">
              <div class="flex items-center justify-end gap-1">
                <UButton
                  icon="i-lucide-eye"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  title="View Receipt"
                  @click="navigateTo(`/payments/${payment.id}`)"
                />
                <UButton
                  icon="i-lucide-file-text"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  title="View Invoice"
                  @click="navigateTo(`/invoices/${payment.invoice.id}`)"
                />
                <UButton
                  icon="i-lucide-send"
                  variant="ghost"
                  color="success"
                  size="sm"
                  title="Send Receipt to Client"
                  :loading="sendingId === payment.id"
                  @click="sendReceipt(payment)"
                />
                <UButton
                  icon="i-lucide-download"
                  variant="ghost"
                  color="primary"
                  size="sm"
                  title="Download Receipt"
                  :loading="downloadingId === payment.id"
                  @click="downloadReceipt(payment)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="payments.length === 0">
            <td colspan="7" class="p-8 text-center text-slate-400">
              <UIcon name="i-lucide-credit-card" class="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No payments recorded yet</p>
            </td>
          </tr>
        </tbody>
      </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-between p-4 border-t border-white/10">
        <p class="text-sm text-slate-400">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }}
        </p>
        <UPagination
          v-model="pagination.page"
          :total="pagination.total"
          :items-per-page="pagination.limit"
          @update:model-value="fetchPayments"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'default'
})

const toast = useToast()

const payments = ref<any[]>([])
const search = ref('')
const methodFilter = ref('')
const selectedPeriod = ref('all')
const downloadingId = ref<number | null>(null)
const sendingId = ref<number | null>(null)

const stats = ref({
  total: 0,
  thisMonth: 0,
  lastMonth: 0,
  count: 0
})

const methodBreakdown = ref<any[]>([])
const topClients = ref<any[]>([])

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

const periods = [
  { label: 'All Time', value: 'all' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' }
]

const methodFilters = [
  { label: 'All', value: '', icon: '' },
  { label: 'Bank', value: 'BANK_TRANSFER', icon: 'i-lucide-landmark' },
  { label: 'Card', value: 'CREDIT_CARD', icon: 'i-lucide-credit-card' },
  { label: 'Cash', value: 'CASH', icon: 'i-lucide-banknote' },
  { label: 'PayPal', value: 'PAYPAL', icon: 'i-lucide-wallet' },
  { label: 'Mobile', value: 'MOBILE_MONEY', icon: 'i-lucide-smartphone' }
]

const fetchPayments = async () => {
  try {
    const response = await $fetch('/api/payments', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: search.value,
        method: methodFilter.value
      }
    })
    payments.value = response.payments
    pagination.value = { ...pagination.value, ...response.pagination }
    calculateStats(response.payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
  }
}

const calculateStats = async (currentPayments: any[]) => {
  try {
    // Fetch all payments for stats
    const all = await $fetch('/api/payments', { query: { limit: 1000 } })
    const allPayments = all.payments
    
    const now = new Date()
    const thisMonthStart = startOfMonth(now)
    const thisMonthEnd = endOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))
    
    // Calculate totals
    stats.value = {
      total: allPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0),
      thisMonth: allPayments
        .filter((p: any) => {
          const date = new Date(p.paymentDate)
          return date >= thisMonthStart && date <= thisMonthEnd
        })
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0),
      lastMonth: allPayments
        .filter((p: any) => {
          const date = new Date(p.paymentDate)
          return date >= lastMonthStart && date <= lastMonthEnd
        })
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0),
      count: allPayments.length
    }
    
    // Calculate method breakdown
    const methodMap = new Map()
    allPayments.forEach((p: any) => {
      const existing = methodMap.get(p.paymentMethod) || { total: 0, count: 0 }
      methodMap.set(p.paymentMethod, {
        total: existing.total + Number(p.amount),
        count: existing.count + 1
      })
    })
    methodBreakdown.value = Array.from(methodMap.entries())
      .map(([method, data]) => ({ method, ...data }))
      .sort((a, b) => b.total - a.total)
    
    // Calculate top clients
    const clientMap = new Map()
    allPayments.forEach((p: any) => {
      const existing = clientMap.get(p.client.id) || { name: p.client.name, total: 0 }
      clientMap.set(p.client.id, {
        id: p.client.id,
        name: p.client.name,
        total: existing.total + Number(p.amount)
      })
    })
    topClients.value = Array.from(clientMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  } catch (error) {
    console.error('Error calculating stats:', error)
  }
}

const debouncedFetch = useDebounceFn(fetchPayments, 300)

const setMethodFilter = (value: string) => {
  methodFilter.value = value
  fetchPayments()
}

const formatDate = (date: string) => format(new Date(date), 'MMM d, yyyy')
const formatTime = (date: string) => format(new Date(date), 'HH:mm')
const formatMoney = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatMethod = (method: string) => {
  const methods: Record<string, string> = {
    BANK_TRANSFER: 'Bank Transfer',
    CASH: 'Cash',
    CREDIT_CARD: 'Credit Card',
    PAYPAL: 'PayPal',
    MOBILE_MONEY: 'Mobile Money',
    CRYPTO: 'Crypto',
    OTHER: 'Other'
  }
  return methods[method] || method
}

const getMethodIcon = (method: string) => {
  const icons: Record<string, string> = {
    BANK_TRANSFER: 'i-lucide-landmark',
    CASH: 'i-lucide-banknote',
    CREDIT_CARD: 'i-lucide-credit-card',
    PAYPAL: 'i-lucide-wallet',
    MOBILE_MONEY: 'i-lucide-smartphone',
    CRYPTO: 'i-lucide-bitcoin',
    OTHER: 'i-lucide-circle-dollar-sign'
  }
  return icons[method] || 'i-lucide-circle-dollar-sign'
}

const getMethodBgClass = (method: string) => {
  const classes: Record<string, string> = {
    BANK_TRANSFER: 'bg-blue-500/20',
    CASH: 'bg-emerald-500/20',
    CREDIT_CARD: 'bg-purple-500/20',
    PAYPAL: 'bg-sky-500/20',
    MOBILE_MONEY: 'bg-amber-500/20',
    CRYPTO: 'bg-orange-500/20',
    OTHER: 'bg-slate-500/20'
  }
  return classes[method] || 'bg-slate-500/20'
}

const getMethodTextClass = (method: string) => {
  const classes: Record<string, string> = {
    BANK_TRANSFER: 'text-blue-400',
    CASH: 'text-emerald-400',
    CREDIT_CARD: 'text-purple-400',
    PAYPAL: 'text-sky-400',
    MOBILE_MONEY: 'text-amber-400',
    CRYPTO: 'text-orange-400',
    OTHER: 'text-slate-400'
  }
  return classes[method] || 'text-slate-400'
}

const downloadReceipt = async (payment: any) => {
  downloadingId.value = payment.id
  try {
    const response = await fetch(`/api/payments/${payment.id}/receipt`)
    if (!response.ok) throw new Error('Failed to generate receipt')
    
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Receipt-${payment.id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.add({ title: 'Receipt downloaded', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to download receipt', color: 'error' })
  } finally {
    downloadingId.value = null
  }
}

const sendReceipt = async (payment: any) => {
  sendingId.value = payment.id
  try {
    const response = await $fetch(`/api/payments/${payment.id}/send`, { method: 'POST' })
    toast.add({ 
      title: 'Receipt Sent!', 
      description: response.message, 
      color: 'success' 
    })
  } catch (error: any) {
    toast.add({ 
      title: 'Error', 
      description: error.data?.message || 'Failed to send receipt', 
      color: 'error' 
    })
  } finally {
    sendingId.value = null
  }
}

onMounted(fetchPayments)
</script>
