<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" @click="navigateTo('/invoices')" />
        <div>
          <h1 class="text-3xl font-bold text-white">{{ invoice?.invoiceNumber || 'Invoice' }}</h1>
          <p class="text-slate-400 mt-1">Invoice details and payments</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span
          v-if="invoice"
          class="px-4 py-2 rounded-full text-sm font-medium"
          :class="getStatusClass(invoice.status)"
        >
          {{ formatStatus(invoice.status) }}
        </span>
        <UButton
          v-if="invoice"
          icon="i-lucide-download"
          color="primary"
          :loading="downloading"
          @click="downloadPdf"
        >
          Download PDF
        </UButton>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-blue-400" />
    </div>

    <div v-else-if="invoice" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Beautiful Invoice Template -->
        <div class="relative bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
          <!-- Decorative Elements -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full translate-y-24 -translate-x-24"></div>
          
          <!-- Main Content -->
          <div class="relative">
            <!-- Header -->
            <div class="p-10 pb-8">
              <div class="flex justify-between items-start">
                <!-- Logo on the left - bigger and proportional -->
                <div>
                  <div v-if="settings?.logoUrl" class="w-44 h-44 rounded-2xl overflow-hidden bg-white shadow-xl flex items-center justify-center p-3 border border-slate-100">
                    <img :src="settings.logoUrl" alt="Company Logo" class="w-full h-full object-contain" />
                  </div>
                  <div v-else class="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-blue-500/30">
                    <span class="text-4xl font-black text-white">{{ getCompanyInitial() }}</span>
                  </div>
                </div>

                <!-- Right side: Status, Title, and Company Details -->
                <div class="text-right">
                  <div class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl mb-3" :class="getInvoiceBadgeClass(invoice.status)">
                    <div class="w-2 h-2 rounded-full" :class="getInvoiceDotClass(invoice.status)"></div>
                    <span class="font-semibold text-sm">{{ formatStatus(invoice.status) }}</span>
                  </div>
                  <h1 class="text-4xl font-black text-slate-900 tracking-tight">INVOICE</h1>
                  <p class="text-slate-400 font-mono text-lg mt-1">#{{ invoice.invoiceNumber }}</p>
                  
                  <!-- Company address and contact on the right -->
                  <div class="mt-4 text-sm text-slate-500 space-y-0.5">
                    <p v-if="!settings?.logoUrl" class="font-semibold text-slate-700">{{ settings?.companyName || 'MyPanel' }}</p>
                    <p v-if="settings?.companyAddress">{{ settings.companyAddress }}</p>
                    <p v-if="settings?.companyCity">{{ settings.companyCity }}, {{ settings.companyState }} {{ settings.companyZip }}</p>
                    <p v-if="settings?.companyEmail">{{ settings.companyEmail }}</p>
                    <p v-if="settings?.companyPhone">{{ settings.companyPhone }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Divider with Pattern -->
            <div class="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

            <!-- Details Grid -->
            <div class="p-10 pt-8 grid grid-cols-3 gap-8">
              <!-- Bill To -->
              <div class="col-span-2">
                <p class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Bill To</p>
                <div class="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <p class="text-xl font-bold text-slate-900">{{ invoice.client.name }}</p>
                  <p v-if="invoice.client.company" class="text-slate-600 font-medium">{{ invoice.client.company }}</p>
                  <div class="mt-3 text-sm text-slate-500 space-y-0.5">
                    <p>{{ invoice.client.email }}</p>
                    <p v-if="invoice.client.phone">{{ invoice.client.phone }}</p>
                    <p v-if="invoice.client.billingAddress" class="mt-2">{{ invoice.client.billingAddress }}</p>
                    <p v-if="invoice.client.billingCity">{{ invoice.client.billingCity }}, {{ invoice.client.billingState }} {{ invoice.client.billingZip }}</p>
                  </div>
                </div>
              </div>

              <!-- Invoice Info -->
              <div class="space-y-4">
                <div class="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <p class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Issue Date</p>
                  <p class="text-slate-900 font-semibold">{{ formatDate(invoice.issueDate) }}</p>
                </div>
                <div class="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                  <p class="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Due Date</p>
                  <p class="text-slate-900 font-semibold">{{ formatDate(invoice.dueDate) }}</p>
                </div>
                <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white">
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Amount Due</p>
                  <p class="text-2xl font-black">${{ Number(invoice.total - invoice.amountPaid).toFixed(2) }}</p>
                </div>
              </div>
            </div>

            <!-- Items Section -->
            <div class="px-10 pb-8">
              <p class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Invoice Items</p>
              <div class="rounded-2xl overflow-hidden border border-slate-200">
                <table class="w-full">
                  <thead>
                    <tr class="bg-gradient-to-r from-slate-800 to-slate-900">
                      <th class="text-left p-4 text-white font-semibold text-sm">Description</th>
                      <th class="text-center p-4 text-white font-semibold text-sm w-20">Qty</th>
                      <th class="text-right p-4 text-white font-semibold text-sm w-28">Price</th>
                      <th class="text-right p-4 text-white font-semibold text-sm w-32">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, index) in invoice.items"
                      :key="item.id"
                      class="border-b border-slate-100 last:border-0"
                      :class="index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'"
                    >
                      <td class="p-4 text-slate-700">{{ item.description }}</td>
                      <td class="p-4 text-center text-slate-600">{{ item.quantity }}</td>
                      <td class="p-4 text-right text-slate-600">${{ Number(item.unitPrice).toFixed(2) }}</td>
                      <td class="p-4 text-right text-slate-900 font-semibold">${{ Number(item.amount).toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Totals -->
            <div class="px-10 pb-8">
              <div class="flex justify-end">
                <div class="w-80">
                  <div class="space-y-3">
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-500">Subtotal</span>
                      <span class="text-slate-900 font-medium">${{ Number(invoice.subtotal).toFixed(2) }}</span>
                    </div>
                    <div v-if="Number(invoice.taxAmount) > 0" class="flex justify-between text-sm">
                      <span class="text-slate-500">Tax</span>
                      <span class="text-slate-900 font-medium">${{ Number(invoice.taxAmount).toFixed(2) }}</span>
                    </div>
                    <div v-if="Number(invoice.discount) > 0" class="flex justify-between text-sm">
                      <span class="text-slate-500">Discount</span>
                      <span class="text-emerald-600 font-medium">-${{ Number(invoice.discount).toFixed(2) }}</span>
                    </div>
                  </div>
                  
                  <div class="mt-4 pt-4 border-t-2 border-slate-200">
                    <div class="flex justify-between items-center">
                      <span class="text-slate-900 font-bold text-lg">Total</span>
                      <span class="text-slate-900 font-black text-2xl">${{ Number(invoice.total).toFixed(2) }}</span>
                    </div>
                  </div>

                  <div v-if="Number(invoice.amountPaid) > 0" class="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                    <div class="flex justify-between text-sm mb-2">
                      <span class="text-emerald-700">Amount Paid</span>
                      <span class="text-emerald-700 font-semibold">-${{ Number(invoice.amountPaid).toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-emerald-900 font-bold">Balance Due</span>
                      <span class="text-emerald-900 font-black text-xl">${{ Number(invoice.total - invoice.amountPaid).toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bank Details & Notes -->
            <div class="px-10 pb-8 grid grid-cols-2 gap-6" v-if="settings?.bankDetails || invoice.notes || invoice.terms">
              <div v-if="settings?.bankDetails" class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                <p class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </span>
                  Payment Details
                </p>
                <pre class="text-sm text-slate-600 whitespace-pre-wrap font-sans">{{ settings.bankDetails }}</pre>
              </div>
              
              <div v-if="invoice.notes || invoice.terms" class="space-y-4">
                <div v-if="invoice.notes" class="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Notes</p>
                  <p class="text-sm text-slate-600">{{ invoice.notes }}</p>
                </div>
                <div v-if="invoice.terms" class="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Terms</p>
                  <p class="text-sm text-slate-600">{{ invoice.terms }}</p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="bg-gradient-to-r from-slate-50 via-white to-slate-50 px-10 py-6 border-t border-slate-100">
              <div class="flex justify-between items-center">
                <p class="text-slate-400 text-sm">{{ settings?.invoiceFooter || 'Thank you for your business!' }}</p>
                <p class="text-slate-300 text-xs">Generated {{ formatDate(new Date().toISOString()) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Actions -->
        <div class="glass-card p-6 space-y-3">
          <h3 class="text-lg font-semibold text-white mb-4">Actions</h3>
          
          <UButton
            v-if="invoice.status === 'DRAFT'"
            color="primary"
            class="w-full"
            icon="i-lucide-send"
            @click="sendInvoice"
            :loading="sending"
          >
            Send to Client
          </UButton>

          <UButton
            v-if="['SENT', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status)"
            color="success"
            class="w-full"
            icon="i-lucide-credit-card"
            @click="openPaymentModal"
          >
            Record Payment
          </UButton>

          <UButton
            v-if="['SENT', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status)"
            color="warning"
            variant="soft"
            class="w-full"
            icon="i-lucide-bell"
            @click="sendReminder"
            :loading="sendingReminder"
          >
            Send Reminder
          </UButton>

          <UButton
            color="neutral"
            variant="soft"
            class="w-full"
            icon="i-lucide-download"
            @click="downloadPdf"
            :loading="downloading"
          >
            Download PDF
          </UButton>
        </div>

        <!-- Payment History -->
        <div class="glass-card p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Payment History</h3>
          
          <div v-if="invoice.payments.length === 0" class="text-center py-4 text-slate-400">
            <UIcon name="i-lucide-credit-card" class="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p class="text-sm">No payments recorded</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="payment in invoice.payments"
              :key="payment.id"
              class="p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="text-emerald-400 font-semibold">${{ Number(payment.amount).toFixed(2) }}</p>
                  <p class="text-xs text-slate-400 mt-1">{{ formatDate(payment.paymentDate) }}</p>
                </div>
                <span class="px-2 py-1 rounded text-xs bg-slate-700 text-slate-300">
                  {{ formatPaymentMethod(payment.paymentMethod) }}
                </span>
              </div>
              <p v-if="payment.reference" class="text-xs text-slate-500 mt-2">Ref: {{ payment.reference }}</p>
            </div>
          </div>
        </div>

        <!-- Client Info -->
        <div class="glass-card p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Client</h3>
          <NuxtLink :to="`/clients/${invoice.client.id}`" class="flex items-center gap-3 hover:bg-white/5 -mx-2 px-2 py-2 rounded-lg transition-colors">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {{ getInitials(invoice.client.name) }}
            </div>
            <div>
              <p class="text-white font-medium">{{ invoice.client.name }}</p>
              <p class="text-sm text-slate-400">{{ invoice.client.email }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Record Payment Modal -->
    <Teleport to="body">
      <div v-if="isPaymentModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="isPaymentModalOpen = false" />
        <div class="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div class="bg-slate-800/50 border-b border-white/10 px-6 py-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <UIcon name="i-lucide-credit-card" class="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-white">Record Payment</h2>
              <p class="text-slate-400 text-xs">{{ invoice?.invoiceNumber }}</p>
            </div>
          </div>

          <form @submit.prevent="recordPayment" class="p-6 space-y-4">
            <div class="p-4 rounded-xl bg-white/5 border border-white/10">
              <div class="flex justify-between items-center">
                <span class="text-slate-400">Balance Due</span>
                <span class="text-xl font-bold text-amber-400">${{ getBalance() }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const toast = useToast()

const loading = ref(true)
const invoice = ref<any>(null)
const settings = ref<any>(null)
const downloading = ref(false)
const sending = ref(false)
const sendingReminder = ref(false)
const isPaymentModalOpen = ref(false)
const savingPayment = ref(false)

const paymentForm = ref({
  amount: '',
  paymentMethod: 'BANK_TRANSFER',
  paymentDate: new Date().toISOString().split('T')[0],
  reference: ''
})

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

const fetchInvoice = async () => {
  loading.value = true
  try {
    const response = await $fetch(`/api/invoices/${route.params.id}`)
    invoice.value = response.invoice
    settings.value = response.settings
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to load invoice', color: 'error' })
    navigateTo('/invoices')
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => format(new Date(date), 'MMM d, yyyy')

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

const formatPaymentMethod = (method: string) => {
  const methods: Record<string, string> = {
    BANK_TRANSFER: 'Bank',
    CREDIT_CARD: 'Card',
    CASH: 'Cash',
    PAYPAL: 'PayPal',
    MOBILE_MONEY: 'Mobile',
    CRYPTO: 'Crypto',
    OTHER: 'Other'
  }
  return methods[method] || method
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'PAID': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    case 'SENT': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    case 'PARTIALLY_PAID': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    case 'OVERDUE': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
    case 'DRAFT': return 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
    case 'CANCELLED': return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    default: return 'bg-slate-500/20 text-slate-400'
  }
}

const getInvoiceBadgeClass = (status: string) => {
  switch (status) {
    case 'PAID': return 'bg-emerald-100 text-emerald-700'
    case 'SENT': return 'bg-amber-100 text-amber-700'
    case 'PARTIALLY_PAID': return 'bg-amber-100 text-amber-700'
    case 'OVERDUE': return 'bg-rose-100 text-rose-700'
    case 'DRAFT': return 'bg-slate-100 text-slate-700'
    case 'CANCELLED': return 'bg-gray-100 text-gray-700'
    default: return 'bg-slate-100 text-slate-700'
  }
}

const getInvoiceDotClass = (status: string) => {
  switch (status) {
    case 'PAID': return 'bg-emerald-500 animate-pulse'
    case 'SENT': return 'bg-amber-500'
    case 'PARTIALLY_PAID': return 'bg-amber-500'
    case 'OVERDUE': return 'bg-rose-500 animate-pulse'
    case 'DRAFT': return 'bg-slate-500'
    case 'CANCELLED': return 'bg-gray-500'
    default: return 'bg-slate-500'
  }
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getCompanyInitial = () => {
  return (settings.value?.companyName || 'M')[0].toUpperCase()
}

const getBalance = () => {
  if (!invoice.value) return '0.00'
  return (Number(invoice.value.total) - Number(invoice.value.amountPaid)).toFixed(2)
}

const downloadPdf = async () => {
  downloading.value = true
  try {
    const response = await fetch(`/api/invoices/${route.params.id}/pdf`)
    if (!response.ok) throw new Error('Failed to generate PDF')
    
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${invoice.value.invoiceNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.add({ title: 'PDF downloaded', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to download PDF', color: 'error' })
  } finally {
    downloading.value = false
  }
}

const sendInvoice = async () => {
  sending.value = true
  try {
    await $fetch(`/api/invoices/${route.params.id}/send`, { method: 'POST' })
    toast.add({ title: 'Invoice sent to client', color: 'success' })
    fetchInvoice()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  } finally {
    sending.value = false
  }
}

const sendReminder = async () => {
  sendingReminder.value = true
  try {
    await $fetch(`/api/invoices/${route.params.id}/send`, { method: 'POST' })
    toast.add({ title: 'Reminder sent', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  } finally {
    sendingReminder.value = false
  }
}

const openPaymentModal = () => {
  paymentForm.value = {
    amount: getBalance(),
    paymentMethod: 'BANK_TRANSFER',
    paymentDate: new Date().toISOString().split('T')[0],
    reference: ''
  }
  isPaymentModalOpen.value = true
}

const recordPayment = async () => {
  savingPayment.value = true
  try {
    await $fetch('/api/payments', {
      method: 'POST',
      body: {
        invoiceId: invoice.value.id,
        amount: parseFloat(paymentForm.value.amount),
        paymentMethod: paymentForm.value.paymentMethod,
        paymentDate: paymentForm.value.paymentDate,
        reference: paymentForm.value.reference
      }
    })
    toast.add({ title: 'Payment recorded', color: 'success' })
    isPaymentModalOpen.value = false
    fetchInvoice()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  } finally {
    savingPayment.value = false
  }
}

onMounted(fetchInvoice)
</script>
