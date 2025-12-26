<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 py-8 px-4">
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-slate-600">Loading invoice...</p>
      </div>
    </div>

    <div v-else-if="error" class="max-w-md mx-auto text-center py-20">
      <div class="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-slate-800 mb-2">Invoice Not Found</h1>
      <p class="text-slate-600">This invoice link may have expired or is invalid.</p>
    </div>

    <div v-else-if="invoice" class="max-w-4xl mx-auto">
      <!-- Action Bar -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Invoice {{ invoice.invoiceNumber }}</h1>
          <p class="text-slate-500">From {{ settings?.companyName || 'Company' }}</p>
        </div>
        <button 
          @click="downloadPdf" 
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/25"
          :disabled="downloading"
        >
          <svg v-if="!downloading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ downloading ? 'Downloading...' : 'Download PDF' }}
        </button>
      </div>

      <!-- Invoice Card -->
      <div class="bg-white rounded-3xl shadow-xl overflow-hidden">
        <!-- Header -->
        <div class="p-8 pb-6 border-b border-slate-100">
          <div class="flex justify-between items-start">
            <!-- Logo -->
            <div>
              <div v-if="settings?.logoUrl" class="w-24 h-24 rounded-2xl overflow-hidden bg-white shadow-lg flex items-center justify-center p-2 border border-slate-100">
                <img :src="settings.logoUrl" alt="Company Logo" class="w-full h-full object-contain" />
              </div>
              <div v-else class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                <span class="text-2xl font-black text-white">{{ getCompanyInitial() }}</span>
              </div>
            </div>

            <!-- Invoice Info -->
            <div class="text-right">
              <span
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-3"
                :class="getStatusClass(invoice.status)"
              >
                <span class="w-2 h-2 rounded-full" :class="getStatusDotClass(invoice.status)"></span>
                {{ formatStatus(invoice.status) }}
              </span>
              <h2 class="text-3xl font-black text-slate-900">INVOICE</h2>
              <p class="text-slate-400 font-mono text-lg mt-1">#{{ invoice.invoiceNumber }}</p>
              
              <!-- Company Address -->
              <div class="mt-4 text-sm text-slate-500 space-y-0.5">
                <p v-if="settings?.companyAddress">{{ settings.companyAddress }}</p>
                <p v-if="settings?.companyCity">{{ settings.companyCity }}, {{ settings.companyState }} {{ settings.companyZip }}</p>
                <p v-if="settings?.companyEmail">{{ settings.companyEmail }}</p>
                <p v-if="settings?.companyPhone">{{ settings.companyPhone }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Details -->
        <div class="p-8 grid grid-cols-3 gap-6">
          <!-- Bill To -->
          <div class="col-span-2">
            <p class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Bill To</p>
            <div class="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <p class="text-xl font-bold text-slate-900">{{ invoice.client.name }}</p>
              <p v-if="invoice.client.company" class="text-slate-600 font-medium">{{ invoice.client.company }}</p>
              <p class="mt-2 text-sm text-slate-500">{{ invoice.client.email }}</p>
            </div>
          </div>

          <!-- Date Info -->
          <div class="space-y-4">
            <div class="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <p class="text-xs font-bold text-blue-600 uppercase mb-1">Issue Date</p>
              <p class="text-slate-900 font-semibold">{{ formatDate(invoice.issueDate) }}</p>
            </div>
            <div class="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <p class="text-xs font-bold text-amber-600 uppercase mb-1">Due Date</p>
              <p class="text-slate-900 font-semibold">{{ formatDate(invoice.dueDate) }}</p>
            </div>
            <div class="bg-slate-800 rounded-2xl p-4 text-white">
              <p class="text-xs font-bold text-slate-400 uppercase mb-1">Amount Due</p>
              <p class="text-2xl font-black">{{ currencySymbol }}{{ formatMoney(Number(invoice.total) - Number(invoice.amountPaid)) }}</p>
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <div class="px-8 pb-6">
          <p class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Invoice Items</p>
          <div class="rounded-2xl overflow-hidden border border-slate-200">
            <table class="w-full">
              <thead>
                <tr class="bg-slate-800 text-white">
                  <th class="text-left p-4 font-semibold">Description</th>
                  <th class="text-center p-4 font-semibold w-20">Qty</th>
                  <th class="text-right p-4 font-semibold w-28">Price</th>
                  <th class="text-right p-4 font-semibold w-32">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in invoice.items"
                  :key="item.id"
                  :class="index % 2 === 0 ? 'bg-white' : 'bg-slate-50'"
                >
                  <td class="p-4 text-slate-700">{{ item.description }}</td>
                  <td class="p-4 text-center text-slate-600">{{ item.quantity }}</td>
                  <td class="p-4 text-right text-slate-600">{{ currencySymbol }}{{ formatMoney(item.unitPrice) }}</td>
                  <td class="p-4 text-right text-slate-900 font-semibold">{{ currencySymbol }}{{ formatMoney(item.amount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Totals -->
        <div class="px-8 pb-8">
          <div class="flex justify-end">
            <div class="w-80">
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500">Subtotal</span>
                  <span class="text-slate-900 font-medium">{{ currencySymbol }}{{ formatMoney(invoice.subtotal) }}</span>
                </div>
                <div v-if="Number(invoice.taxAmount) > 0" class="flex justify-between text-sm">
                  <span class="text-slate-500">Tax</span>
                  <span class="text-slate-900 font-medium">{{ currencySymbol }}{{ formatMoney(invoice.taxAmount) }}</span>
                </div>
                <div v-if="Number(invoice.discount) > 0" class="flex justify-between text-sm">
                  <span class="text-slate-500">Discount</span>
                  <span class="text-emerald-600 font-medium">-{{ currencySymbol }}{{ formatMoney(invoice.discount) }}</span>
                </div>
              </div>
              
              <div class="mt-4 pt-4 border-t-2 border-slate-200">
                <div class="flex justify-between items-center">
                  <span class="text-slate-900 font-bold text-lg">Total</span>
                  <span class="text-slate-900 font-black text-2xl">{{ currencySymbol }}{{ formatMoney(invoice.total) }}</span>
                </div>
              </div>

              <div v-if="Number(invoice.amountPaid) > 0" class="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-emerald-700">Amount Paid</span>
                  <span class="text-emerald-700 font-semibold">-{{ currencySymbol }}{{ formatMoney(invoice.amountPaid) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-emerald-900 font-bold">Balance Due</span>
                  <span class="text-emerald-900 font-black text-xl">{{ currencySymbol }}{{ formatMoney(Number(invoice.total) - Number(invoice.amountPaid)) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bank Details & Notes -->
        <div v-if="settings?.bankDetails || invoice.notes" class="px-8 pb-8 grid grid-cols-2 gap-6">
          <div v-if="settings?.bankDetails" class="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <p class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Payment Details</p>
            <pre class="text-sm text-slate-600 whitespace-pre-wrap font-sans">{{ settings.bankDetails }}</pre>
          </div>
          
          <div v-if="invoice.notes" class="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Notes</p>
            <p class="text-sm text-slate-600">{{ invoice.notes }}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-slate-50 px-8 py-6 text-center border-t border-slate-100">
          <p class="text-slate-500">{{ settings?.invoiceFooter || 'Thank you for your business!' }}</p>
        </div>
      </div>

      <!-- Powered By -->
      <p class="text-center text-slate-400 text-sm mt-6">
        Powered by <span class="font-semibold">MyPanel</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false, // No layout - public page
  auth: false // No auth required
})

const route = useRoute()

const loading = ref(true)
const error = ref(false)
const downloading = ref(false)
const invoice = ref<any>(null)
const settings = ref<any>(null)
const token = ref('')

const currencySymbol = computed(() => settings.value?.currencySymbol || '$')

const fetchInvoice = async () => {
  loading.value = true
  error.value = false
  try {
    const response = await $fetch(`/api/public/invoice/${route.params.token}`)
    invoice.value = response.invoice
    settings.value = response.settings
    token.value = response.token
  } catch (err) {
    error.value = true
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatMoney = (amount: number | any) => {
  return Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatStatus = (status: string) => {
  const statuses: Record<string, string> = {
    DRAFT: 'Draft',
    SENT: 'Sent',
    PAID: 'Paid',
    PARTIALLY_PAID: 'Partial',
    OVERDUE: 'Overdue',
    CANCELLED: 'Cancelled'
  }
  return statuses[status] || status
}

const getStatusClass = (status: string) => {
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

const getStatusDotClass = (status: string) => {
  switch (status) {
    case 'PAID': return 'bg-emerald-500'
    case 'SENT': return 'bg-amber-500'
    case 'PARTIALLY_PAID': return 'bg-amber-500'
    case 'OVERDUE': return 'bg-rose-500 animate-pulse'
    case 'DRAFT': return 'bg-slate-500'
    case 'CANCELLED': return 'bg-gray-500'
    default: return 'bg-slate-500'
  }
}

const getCompanyInitial = () => {
  return (settings.value?.companyName || 'M')[0].toUpperCase()
}

const downloadPdf = async () => {
  if (!invoice.value) return
  downloading.value = true
  try {
    const response = await fetch(`/api/public/invoice/${token.value}/pdf`)
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
  } catch (err) {
    console.error('Download error:', err)
  } finally {
    downloading.value = false
  }
}

onMounted(fetchInvoice)
</script>

