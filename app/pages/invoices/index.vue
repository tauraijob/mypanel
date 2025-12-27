<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">Invoices</h1>
        <p class="text-slate-400 mt-1">Create and manage client invoices</p>
      </div>
      <UButton color="primary" icon="i-lucide-plus" @click="navigateTo('/invoices/new')">
        Create Invoice
      </UButton>
    </div>

    <!-- Revenue Summary -->
    <div class="glass-card p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-white flex items-center gap-2">
          <UIcon name="i-lucide-bar-chart-3" class="w-5 h-5 text-blue-400" />
          Revenue Overview
        </h2>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 rounded-xl bg-white/5 border border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <UIcon name="i-lucide-file-text" class="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-white">{{ stats.total }}</p>
              <p class="text-xs text-slate-400">Total Invoices</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-emerald-400">${{ formatMoney(stats.paid) }}</p>
              <p class="text-xs text-slate-400">Paid Revenue</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <UIcon name="i-lucide-clock" class="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-amber-400">${{ formatMoney(stats.pending) }}</p>
              <p class="text-xs text-slate-400">Pending</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-rose-400">${{ formatMoney(stats.overdue) }}</p>
              <p class="text-xs text-slate-400">Overdue</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="glass-card p-4">
      <div class="flex flex-wrap gap-4 items-center">
        <div class="relative w-64">
          <UIcon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
          <UInput
            v-model="search"
            placeholder="Search invoices..."
            class="w-full pl-10"
            :ui="{ base: 'pl-10' }"
            @input="debouncedFetch"
          />
        </div>
        <div class="flex gap-2">
          <button
            v-for="status in statusFilters"
            :key="status.value"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            :class="statusFilter === status.value 
              ? 'bg-blue-500 text-white' 
              : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'"
            @click="setStatusFilter(status.value)"
          >
            {{ status.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Invoices Table -->
    <div class="glass-card overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-white/10">
            <th class="text-left p-4 text-slate-400 font-medium">Invoice</th>
            <th class="text-left p-4 text-slate-400 font-medium">Client</th>
            <th class="text-left p-4 text-slate-400 font-medium">Date</th>
            <th class="text-left p-4 text-slate-400 font-medium">Amount</th>
            <th class="text-left p-4 text-slate-400 font-medium">Status</th>
            <th class="text-right p-4 text-slate-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="invoice in invoices"
            :key="invoice.id"
            class="border-b border-white/5 hover:bg-white/5 transition-colors"
          >
            <td class="p-4">
              <p class="font-medium text-white">{{ invoice.invoiceNumber }}</p>
              <p class="text-sm text-slate-400">{{ invoice.items?.length || 0 }} items</p>
            </td>
            <td class="p-4">
              <NuxtLink :to="`/clients/${invoice.client.id}`" class="text-blue-400 hover:text-blue-300">
                {{ invoice.client.name }}
              </NuxtLink>
            </td>
            <td class="p-4">
              <p class="text-white">{{ formatDate(invoice.dueDate) }}</p>
              <p v-if="isOverdue(invoice)" class="text-sm text-rose-400">
                {{ getDaysOverdue(invoice.dueDate) }} days overdue
              </p>
              <p v-else-if="invoice.status !== 'PAID'" class="text-sm text-slate-400">
                Due {{ formatDate(invoice.dueDate) }}
              </p>
            </td>
            <td class="p-4">
              <p class="font-semibold text-white">${{ Number(invoice.total).toFixed(2) }}</p>
              <p v-if="Number(invoice.amountPaid) > 0 && invoice.status !== 'PAID'" class="text-sm text-emerald-400">
                Paid: ${{ Number(invoice.amountPaid).toFixed(2) }}
              </p>
            </td>
            <td class="p-4">
              <span
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="getStatusClass(invoice.status)"
              >
                {{ formatStatus(invoice.status) }}
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
                  title="View Invoice"
                  @click="navigateTo(`/invoices/${invoice.id}`)"
                />
                <!-- Send (for drafts) -->
                <UButton
                  v-if="invoice.status === 'DRAFT'"
                  icon="i-lucide-send"
                  variant="ghost"
                  color="primary"
                  size="sm"
                  title="Send Invoice"
                  @click="sendInvoice(invoice.id)"
                />
                <!-- Record Payment (for sent/overdue) -->
                <UButton
                  v-if="['SENT', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status)"
                  icon="i-lucide-credit-card"
                  variant="ghost"
                  color="success"
                  size="sm"
                  title="Record Payment"
                  @click="openPaymentModal(invoice)"
                />
                <!-- Send Reminder (for sent/overdue) -->
                <UButton
                  v-if="['SENT', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status)"
                  icon="i-lucide-bell"
                  variant="ghost"
                  color="warning"
                  size="sm"
                  title="Send Reminder"
                  @click="sendReminder(invoice.id)"
                />
                <!-- Download PDF -->
                <UButton
                  icon="i-lucide-download"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  title="Download PDF"
                  @click="downloadPdf(invoice.id)"
                />
                <!-- Cancel (if not paid) -->
                <UButton
                  v-if="!['PAID', 'CANCELLED'].includes(invoice.status)"
                  icon="i-lucide-x-circle"
                  variant="ghost"
                  color="error"
                  size="sm"
                  title="Cancel Invoice"
                  @click="confirmCancel(invoice)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="invoices.length === 0">
            <td colspan="6" class="p-8 text-center text-slate-400">
              <UIcon name="i-lucide-file-text" class="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No invoices found</p>
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
          @update:model-value="fetchInvoices"
        />
      </div>
    </div>

    <!-- Record Payment Modal -->
    <Teleport to="body">
      <div v-if="isPaymentModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="isPaymentModalOpen = false" />
        <div class="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          <!-- Header -->
          <div class="bg-slate-800/50 border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <UIcon name="i-lucide-credit-card" class="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">Record Payment</h2>
                <p class="text-slate-400 text-xs">{{ selectedInvoice?.invoiceNumber }}</p>
              </div>
            </div>
            <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="isPaymentModalOpen = false" />
          </div>

          <!-- Content -->
          <form @submit.prevent="recordPayment" class="p-6 space-y-4">
            <div class="p-4 rounded-xl bg-white/5 border border-white/10">
              <div class="flex justify-between items-center">
                <span class="text-slate-400">Invoice Total</span>
                <span class="text-white font-semibold">${{ Number(selectedInvoice?.total || 0).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between items-center mt-2">
                <span class="text-slate-400">Amount Paid</span>
                <span class="text-emerald-400">${{ Number(selectedInvoice?.amountPaid || 0).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
                <span class="text-white font-medium">Balance Due</span>
                <span class="text-amber-400 font-bold">${{ getBalance(selectedInvoice) }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Amount *" name="amount">
                <UInput v-model="paymentForm.amount" type="number" step="0.01" placeholder="0.00" required />
              </UFormField>
              <UFormField label="Payment Date" name="paymentDate">
                <UInput v-model="paymentForm.paymentDate" type="date" />
              </UFormField>
            </div>

            <UFormField label="Payment Method" name="paymentMethod">
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="method in paymentMethods"
                  :key="method.value"
                  type="button"
                  class="p-3 rounded-lg text-center transition-all"
                  :class="paymentForm.paymentMethod === method.value 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'"
                  @click="paymentForm.paymentMethod = method.value"
                >
                  <UIcon :name="method.icon" class="w-5 h-5 mx-auto mb-1" />
                  <p class="text-xs">{{ method.label }}</p>
                </button>
              </div>
            </UFormField>

            <UFormField label="Reference / Transaction ID" name="reference">
              <UInput v-model="paymentForm.reference" placeholder="Transaction reference" />
            </UFormField>

            <div class="flex justify-end gap-3 pt-4 border-t border-white/10">
              <UButton variant="ghost" color="neutral" @click="isPaymentModalOpen = false">
                Cancel
              </UButton>
              <UButton type="submit" color="primary" :loading="savingPayment" icon="i-lucide-check">
                Record Payment
              </UButton>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Cancel Confirmation Modal -->
    <Teleport to="body">
      <div v-if="isCancelModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="isCancelModalOpen = false" />
        <div class="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div class="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-lucide-file-x" class="w-10 h-10 text-rose-400" />
          </div>
          <h3 class="text-2xl font-bold text-white mb-3">Cancel Invoice?</h3>
          <p class="text-slate-400 mb-2">
            Cancel invoice <span class="text-white font-semibold">{{ invoiceToCancel?.invoiceNumber }}</span>
          </p>
          <p class="text-sm text-slate-500 mb-8">
            This will mark the invoice as cancelled. The client will not be able to pay this invoice.
          </p>
          <div class="flex justify-center gap-4">
            <UButton variant="ghost" color="neutral" size="lg" @click="isCancelModalOpen = false">
              Keep Invoice
            </UButton>
            <UButton color="error" size="lg" :loading="cancelling" icon="i-lucide-x-circle" @click="cancelInvoice">
              Cancel Invoice
            </UButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { format, differenceInDays } from 'date-fns'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const toast = useToast()
const { hasPermission } = useAuth()

const invoices = ref<any[]>([])
const search = ref('')
const statusFilter = ref('')
const isPaymentModalOpen = ref(false)
const selectedInvoice = ref<any>(null)
const savingPayment = ref(false)
const isCancelModalOpen = ref(false)
const invoiceToCancel = ref<any>(null)
const cancelling = ref(false)

const stats = ref({
  total: 0,
  paid: 0,
  pending: 0,
  overdue: 0
})

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const paymentForm = ref({
  amount: '',
  paymentMethod: 'BANK_TRANSFER',
  paymentDate: new Date().toISOString().split('T')[0],
  reference: ''
})

const statusFilters = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Cancelled', value: 'CANCELLED' }
]

const paymentMethods = [
  { label: 'Bank', value: 'BANK_TRANSFER', icon: 'i-lucide-landmark' },
  { label: 'Card', value: 'CREDIT_CARD', icon: 'i-lucide-credit-card' },
  { label: 'Cash', value: 'CASH', icon: 'i-lucide-banknote' },
  { label: 'PayPal', value: 'PAYPAL', icon: 'i-lucide-wallet' },
  { label: 'Mobile', value: 'MOBILE_MONEY', icon: 'i-lucide-smartphone' },
  { label: 'Crypto', value: 'CRYPTO', icon: 'i-lucide-bitcoin' },
  { label: 'Check', value: 'OTHER', icon: 'i-lucide-file-check' },
  { label: 'Other', value: 'OTHER', icon: 'i-lucide-more-horizontal' }
]

const fetchInvoices = async () => {
  try {
    const response = await $fetch('/api/invoices', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: search.value,
        status: statusFilter.value
      }
    })
    invoices.value = response.invoices
    pagination.value = { ...pagination.value, ...response.pagination }
    
    // Calculate stats from all invoices (need separate API call for accurate stats)
    calculateStats()
  } catch (error) {
    console.error('Error fetching invoices:', error)
  }
}

const calculateStats = async () => {
  try {
    const allInvoices = await $fetch('/api/invoices', { query: { limit: 1000 } })
    const invs = allInvoices.invoices
    stats.value = {
      total: allInvoices.pagination.total,
      paid: invs.filter((i: any) => i.status === 'PAID').reduce((sum: number, i: any) => sum + Number(i.total), 0),
      pending: invs.filter((i: any) => ['SENT', 'PARTIALLY_PAID'].includes(i.status)).reduce((sum: number, i: any) => sum + Number(i.total) - Number(i.amountPaid), 0),
      overdue: invs.filter((i: any) => i.status === 'OVERDUE').reduce((sum: number, i: any) => sum + Number(i.total) - Number(i.amountPaid), 0)
    }
  } catch (error) {
    console.error('Error calculating stats:', error)
  }
}

const debouncedFetch = useDebounceFn(fetchInvoices, 300)

const setStatusFilter = (value: string) => {
  statusFilter.value = value
  fetchInvoices()
}

const formatDate = (date: string) => format(new Date(date), 'MMM d, yyyy')
const formatMoney = (amount: number) => amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatStatus = (status: string) => {
  const statuses: Record<string, string> = {
    DRAFT: 'Draft',
    SENT: 'Sent',
    PAID: 'Paid',
    PARTIALLY_PAID: 'Partial',
    OVERDUE: 'Overdue',
    CANCELLED: 'Cancelled',
    REFUNDED: 'Refunded'
  }
  return statuses[status] || status
}

const isOverdue = (invoice: any) => {
  return invoice.status === 'OVERDUE' || (
    ['SENT', 'PARTIALLY_PAID'].includes(invoice.status) &&
    new Date(invoice.dueDate) < new Date()
  )
}

const getDaysOverdue = (dueDate: string) => {
  return Math.abs(differenceInDays(new Date(dueDate), new Date()))
}

const getBalance = (invoice: any) => {
  if (!invoice) return '0.00'
  return (Number(invoice.total) - Number(invoice.amountPaid)).toFixed(2)
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'PAID': return 'status-paid'
    case 'SENT': return 'status-pending'
    case 'PARTIALLY_PAID': return 'status-pending'
    case 'OVERDUE': return 'status-overdue'
    case 'DRAFT': return 'status-draft'
    case 'CANCELLED': return 'status-suspended'
    default: return 'status-draft'
  }
}

const sendInvoice = async (id: number) => {
  try {
    await $fetch(`/api/invoices/${id}/send`, { method: 'POST' })
    toast.add({ title: 'Invoice sent successfully', color: 'success' })
    fetchInvoices()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  }
}

const sendReminder = async (id: number) => {
  try {
    await $fetch(`/api/invoices/${id}/send`, { method: 'POST' })
    toast.add({ title: 'Reminder sent', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  }
}

const openPaymentModal = (invoice: any) => {
  selectedInvoice.value = invoice
  paymentForm.value = {
    amount: getBalance(invoice),
    paymentMethod: 'BANK_TRANSFER',
    paymentDate: new Date().toISOString().split('T')[0],
    reference: ''
  }
  isPaymentModalOpen.value = true
}

const recordPayment = async () => {
  if (!selectedInvoice.value) return
  
  savingPayment.value = true
  try {
    await $fetch('/api/payments', {
      method: 'POST',
      body: {
        invoiceId: selectedInvoice.value.id,
        amount: parseFloat(paymentForm.value.amount),
        paymentMethod: paymentForm.value.paymentMethod,
        paymentDate: paymentForm.value.paymentDate,
        reference: paymentForm.value.reference
      }
    })
    toast.add({ title: 'Payment recorded successfully', color: 'success' })
    isPaymentModalOpen.value = false
    fetchInvoices()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  } finally {
    savingPayment.value = false
  }
}

const confirmCancel = (invoice: any) => {
  invoiceToCancel.value = invoice
  isCancelModalOpen.value = true
}

const cancelInvoice = async () => {
  if (!invoiceToCancel.value) return
  cancelling.value = true
  try {
    await $fetch(`/api/invoices/${invoiceToCancel.value.id}`, {
      method: 'PUT',
      body: { status: 'CANCELLED' }
    })
    toast.add({ title: 'Invoice cancelled', color: 'warning' })
    isCancelModalOpen.value = false
    invoiceToCancel.value = null
    fetchInvoices()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  } finally {
    cancelling.value = false
  }
}

const downloadPdf = async (id: number) => {
  try {
    toast.add({ title: 'Generating PDF...', color: 'info' })
    
    // Fetch PDF as blob
    const response = await fetch(`/api/invoices/${id}/pdf`)
    if (!response.ok) throw new Error('Failed to generate PDF')
    
    const blob = await response.blob()
    
    // Get filename from header or use default
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = `invoice-${id}.pdf`
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/)
      if (match) filename = match[1]
    }
    
    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.add({ title: 'PDF downloaded successfully', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: 'Failed to download PDF', color: 'error' })
  }
}

onMounted(fetchInvoices)
</script>
