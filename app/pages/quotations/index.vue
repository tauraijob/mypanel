<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">Quotations</h1>
        <p class="text-slate-400 mt-1">Create and manage client quotations</p>
      </div>
      <UButton color="primary" icon="i-lucide-plus" @click="navigateTo('/quotations/new')">
        Create Quote
      </UButton>
    </div>

    <!-- Stats Cards -->
    <div class="glass-card p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-white flex items-center gap-2">
          <UIcon name="i-lucide-file-check" class="w-5 h-5 text-purple-400" />
          Quote Overview
        </h2>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="p-4 rounded-xl bg-white/5 border border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <UIcon name="i-lucide-files" class="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-white">{{ stats.total }}</p>
              <p class="text-xs text-slate-400">Total Quotes</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <UIcon name="i-lucide-send" class="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-amber-400">{{ stats.sent }}</p>
              <p class="text-xs text-slate-400">Sent</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-emerald-400">{{ stats.accepted }}</p>
              <p class="text-xs text-slate-400">Accepted</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <UIcon name="i-lucide-repeat" class="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-purple-400">{{ stats.converted }}</p>
              <p class="text-xs text-slate-400">Converted</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-xl bg-white/5 border border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-slate-500/20 flex items-center justify-center">
              <UIcon name="i-lucide-dollar-sign" class="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-white">${{ formatMoney(stats.totalValue) }}</p>
              <p class="text-xs text-slate-400">Total Value</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="glass-card p-4">
      <div class="flex flex-wrap gap-4 items-center">
        <UInput
          v-model="search"
          placeholder="Search quotations..."
          icon="i-lucide-search"
          class="w-64"
          @input="debouncedFetch"
        />
        <div class="flex gap-2">
          <button
            v-for="status in statusFilters"
            :key="status.value"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            :class="statusFilter === status.value 
              ? 'bg-purple-500 text-white' 
              : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'"
            @click="setStatusFilter(status.value)"
          >
            {{ status.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Quotations Table -->
    <div class="glass-card overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-white/10">
            <th class="text-left p-4 text-slate-400 font-medium">Quote</th>
            <th class="text-left p-4 text-slate-400 font-medium">Client</th>
            <th class="text-left p-4 text-slate-400 font-medium">Valid Until</th>
            <th class="text-left p-4 text-slate-400 font-medium">Amount</th>
            <th class="text-left p-4 text-slate-400 font-medium">Status</th>
            <th class="text-right p-4 text-slate-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="quote in quotations"
            :key="quote.id"
            class="border-b border-white/5 hover:bg-white/5 transition-colors"
          >
            <td class="p-4">
              <p class="font-medium text-white">{{ quote.quoteNumber }}</p>
              <p class="text-sm text-slate-400">{{ quote.items?.length || 0 }} items</p>
            </td>
            <td class="p-4">
              <NuxtLink :to="`/clients/${quote.client.id}`" class="text-blue-400 hover:text-blue-300">
                {{ quote.client.name }}
              </NuxtLink>
            </td>
            <td class="p-4">
              <p class="text-white">{{ formatDate(quote.validUntil) }}</p>
              <p v-if="isExpired(quote)" class="text-sm text-rose-400">Expired</p>
              <p v-else-if="isExpiringSoon(quote)" class="text-sm text-amber-400">Expires soon</p>
            </td>
            <td class="p-4">
              <p class="font-semibold text-white">${{ Number(quote.total).toFixed(2) }}</p>
            </td>
            <td class="p-4">
              <span
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="getStatusClass(quote.status)"
              >
                {{ formatStatus(quote.status) }}
              </span>
            </td>
            <td class="p-4 text-right">
              <div class="flex items-center justify-end gap-1">
                <!-- View -->
                <UButton
                  icon="i-lucide-eye"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  title="View Quote"
                  @click="navigateTo(`/quotations/${quote.id}`)"
                />
                <!-- Send (for drafts) -->
                <UButton
                  v-if="quote.status === 'DRAFT'"
                  icon="i-lucide-send"
                  variant="ghost"
                  color="primary"
                  size="sm"
                  title="Send Quote"
                  @click="sendQuote(quote)"
                />
                <!-- Mark Accepted -->
                <UButton
                  v-if="quote.status === 'SENT'"
                  icon="i-lucide-check-circle"
                  variant="ghost"
                  color="success"
                  size="sm"
                  title="Mark as Accepted"
                  @click="markAccepted(quote.id)"
                />
                <!-- Mark Declined -->
                <UButton
                  v-if="quote.status === 'SENT'"
                  icon="i-lucide-x-circle"
                  variant="ghost"
                  color="error"
                  size="sm"
                  title="Mark as Declined"
                  @click="markDeclined(quote.id)"
                />
                <!-- Convert to Invoice -->
                <UButton
                  v-if="['SENT', 'ACCEPTED'].includes(quote.status)"
                  icon="i-lucide-file-text"
                  variant="ghost"
                  color="warning"
                  size="sm"
                  title="Convert to Invoice"
                  @click="convertToInvoice(quote.id)"
                />
                <!-- Download PDF -->
                <UButton
                  icon="i-lucide-download"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  title="Download PDF"
                  @click="downloadPdf(quote.id)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="quotations.length === 0">
            <td colspan="6" class="p-8 text-center text-slate-400">
              <UIcon name="i-lucide-file-check" class="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No quotations found</p>
              <UButton class="mt-4" variant="soft" color="primary" @click="navigateTo('/quotations/new')">
                Create Your First Quote
              </UButton>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-between p-4 border-t border-white/10">
        <p class="text-sm text-slate-400">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }}
        </p>
        <UPagination
          v-model="pagination.page"
          :total="pagination.total"
          :items-per-page="pagination.limit"
          @update:model-value="fetchQuotations"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, differenceInDays } from 'date-fns'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'default'
})

const toast = useToast()

const quotations = ref<any[]>([])
const search = ref('')
const statusFilter = ref('')

const stats = ref({
  total: 0,
  sent: 0,
  accepted: 0,
  converted: 0,
  totalValue: 0
})

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const statusFilters = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Declined', value: 'DECLINED' },
  { label: 'Converted', value: 'CONVERTED' }
]

const fetchQuotations = async () => {
  try {
    const response = await $fetch('/api/quotations', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: search.value,
        status: statusFilter.value
      }
    })
    quotations.value = response.quotations
    pagination.value = { ...pagination.value, ...response.pagination }
    calculateStats()
  } catch (error) {
    console.error('Error fetching quotations:', error)
  }
}

const calculateStats = async () => {
  try {
    const all = await $fetch('/api/quotations', { query: { limit: 1000 } })
    const quotes = all.quotations
    stats.value = {
      total: quotes.length,
      sent: quotes.filter((q: any) => q.status === 'SENT').length,
      accepted: quotes.filter((q: any) => q.status === 'ACCEPTED').length,
      converted: quotes.filter((q: any) => q.status === 'CONVERTED').length,
      totalValue: quotes.reduce((sum: number, q: any) => sum + Number(q.total), 0)
    }
  } catch (error) {
    console.error('Error calculating stats:', error)
  }
}

const debouncedFetch = useDebounceFn(fetchQuotations, 300)

const setStatusFilter = (value: string) => {
  statusFilter.value = value
  fetchQuotations()
}

const formatDate = (date: string) => format(new Date(date), 'MMM d, yyyy')
const formatMoney = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatStatus = (status: string) => {
  const statuses: Record<string, string> = {
    DRAFT: 'Draft',
    SENT: 'Sent',
    ACCEPTED: 'Accepted',
    DECLINED: 'Declined',
    EXPIRED: 'Expired',
    CONVERTED: 'Converted'
  }
  return statuses[status] || status
}

const isExpired = (quote: any) => {
  return new Date(quote.validUntil) < new Date() && !['ACCEPTED', 'CONVERTED'].includes(quote.status)
}

const isExpiringSoon = (quote: any) => {
  const days = differenceInDays(new Date(quote.validUntil), new Date())
  return days >= 0 && days <= 7 && !['ACCEPTED', 'CONVERTED', 'DECLINED'].includes(quote.status)
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'ACCEPTED': return 'status-paid'
    case 'SENT': return 'status-pending'
    case 'DECLINED': return 'status-overdue'
    case 'EXPIRED': return 'status-suspended'
    case 'CONVERTED': return 'status-active'
    case 'DRAFT': return 'status-draft'
    default: return 'status-draft'
  }
}

const sendQuote = async (quote: any) => {
  try {
    await $fetch(`/api/quotations/${quote.id}/send`, { method: 'POST' })
    toast.add({ title: 'Quote sent to client', color: 'success' })
    fetchQuotations()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  }
}

const markAccepted = async (id: number) => {
  try {
    await $fetch(`/api/quotations/${id}`, { 
      method: 'PUT',
      body: { status: 'ACCEPTED' }
    })
    toast.add({ title: 'Quote marked as accepted', color: 'success' })
    fetchQuotations()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  }
}

const markDeclined = async (id: number) => {
  try {
    await $fetch(`/api/quotations/${id}`, { 
      method: 'PUT',
      body: { status: 'DECLINED' }
    })
    toast.add({ title: 'Quote marked as declined', color: 'warning' })
    fetchQuotations()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  }
}

const convertToInvoice = async (id: number) => {
  try {
    const result = await $fetch(`/api/quotations/${id}/convert`, { method: 'POST' })
    toast.add({ title: 'Quote converted to invoice!', color: 'success' })
    navigateTo(`/invoices/${result.invoice.id}`)
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  }
}

const downloadPdf = async (id: number) => {
  try {
    toast.add({ title: 'Generating PDF...', color: 'info' })
    const response = await fetch(`/api/quotations/${id}/pdf`)
    if (!response.ok) throw new Error('Failed to generate PDF')
    
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `quote-${id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.add({ title: 'PDF downloaded', color: 'success' })
  } catch (error) {
    toast.add({ title: 'PDF generation coming soon', color: 'info' })
  }
}

onMounted(fetchQuotations)
</script>
