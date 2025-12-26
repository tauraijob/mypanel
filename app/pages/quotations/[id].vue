<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" @click="navigateTo('/quotations')" />
        <div>
          <h1 class="text-3xl font-bold text-white">{{ quotation?.quoteNumber || 'Quotation' }}</h1>
          <p class="text-slate-400 mt-1">Quotation details</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span
          v-if="quotation"
          class="px-4 py-2 rounded-full text-sm font-medium"
          :class="getStatusClass(quotation.status)"
        >
          {{ formatStatus(quotation.status) }}
        </span>
        <UButton
          v-if="quotation"
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
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-purple-400" />
    </div>

    <div v-else-if="quotation" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Beautiful Quotation Template -->
        <div class="relative bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
          <!-- Decorative Elements -->
          <div class="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 rounded-full -translate-y-36 translate-x-36"></div>
          <div class="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-violet-500/10 to-indigo-500/10 rounded-full translate-y-28 -translate-x-28"></div>
          
          <!-- Main Content -->
          <div class="relative">
            <!-- Header -->
            <div class="p-10 pb-8">
              <div class="flex justify-between items-start">
                <!-- Logo on the left - bigger and proportional -->
                <div>
                  <div v-if="settings?.logoUrl" class="w-44 h-44 rounded-2xl overflow-hidden bg-white shadow-xl flex items-center justify-center p-3 border border-purple-100">
                    <img :src="settings.logoUrl" alt="Company Logo" class="w-full h-full object-contain" />
                  </div>
                  <div v-else class="w-28 h-28 rounded-2xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 flex items-center justify-center shadow-xl shadow-purple-500/30">
                    <span class="text-4xl font-black text-white">{{ getCompanyInitial() }}</span>
                  </div>
                </div>

                <!-- Right side: Status, Title, and Company Details -->
                <div class="text-right">
                  <div class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl mb-3" :class="getQuoteBadgeClass(quotation.status)">
                    <div class="w-2 h-2 rounded-full" :class="getQuoteDotClass(quotation.status)"></div>
                    <span class="font-semibold text-sm">{{ formatStatus(quotation.status) }}</span>
                  </div>
                  <h1 class="text-4xl font-black text-slate-900 tracking-tight">QUOTATION</h1>
                  <p class="text-slate-400 font-mono text-lg mt-1">#{{ quotation.quoteNumber }}</p>
                  
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

            <!-- Decorative Line -->
            <div class="h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500"></div>

            <!-- Details Grid -->
            <div class="p-10 pt-8 grid grid-cols-3 gap-8">
              <!-- Prepared For -->
              <div class="col-span-2">
                <p class="text-xs font-bold text-purple-600 uppercase tracking-widest mb-3">Prepared For</p>
                <div class="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-2xl p-5 border border-purple-100">
                  <p class="text-xl font-bold text-slate-900">{{ quotation.client.name }}</p>
                  <p v-if="quotation.client.company" class="text-slate-600 font-medium">{{ quotation.client.company }}</p>
                  <div class="mt-3 text-sm text-slate-500 space-y-0.5">
                    <p>{{ quotation.client.email }}</p>
                    <p v-if="quotation.client.phone">{{ quotation.client.phone }}</p>
                    <p v-if="quotation.client.billingAddress" class="mt-2">{{ quotation.client.billingAddress }}</p>
                    <p v-if="quotation.client.billingCity">{{ quotation.client.billingCity }}, {{ quotation.client.billingState }} {{ quotation.client.billingZip }}</p>
                  </div>
                </div>
              </div>

              <!-- Quote Info -->
              <div class="space-y-4">
                <div class="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                  <p class="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">Issue Date</p>
                  <p class="text-slate-900 font-semibold">{{ formatDate(quotation.issueDate) }}</p>
                </div>
                <div class="rounded-2xl p-4 border-2 border-dashed" :class="isExpired ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'">
                  <p class="text-xs font-bold uppercase tracking-widest mb-1" :class="isExpired ? 'text-rose-600' : 'text-amber-600'">
                    {{ isExpired ? 'Expired On' : 'Valid Until' }}
                  </p>
                  <p class="font-semibold" :class="isExpired ? 'text-rose-700' : 'text-slate-900'">{{ formatDate(quotation.validUntil) }}</p>
                </div>
                <div class="bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 rounded-2xl p-4 text-white shadow-lg shadow-purple-500/30">
                  <p class="text-xs font-bold text-purple-200 uppercase tracking-widest mb-1">Quote Total</p>
                  <p class="text-2xl font-black">${{ Number(quotation.total).toFixed(2) }}</p>
                </div>
              </div>
            </div>

            <!-- Items Section -->
            <div class="px-10 pb-8">
              <p class="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4">Quote Items</p>
              <div class="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <table class="w-full">
                  <thead>
                    <tr class="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600">
                      <th class="text-left p-4 text-white font-semibold text-sm">Description</th>
                      <th class="text-center p-4 text-white font-semibold text-sm w-20">Qty</th>
                      <th class="text-right p-4 text-white font-semibold text-sm w-28">Price</th>
                      <th class="text-right p-4 text-white font-semibold text-sm w-32">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, index) in quotation.items"
                      :key="item.id"
                      class="border-b border-slate-100 last:border-0"
                      :class="index % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'"
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
                      <span class="text-slate-900 font-medium">${{ Number(quotation.subtotal).toFixed(2) }}</span>
                    </div>
                    <div v-if="Number(quotation.taxAmount) > 0" class="flex justify-between text-sm">
                      <span class="text-slate-500">Tax</span>
                      <span class="text-slate-900 font-medium">${{ Number(quotation.taxAmount).toFixed(2) }}</span>
                    </div>
                    <div v-if="Number(quotation.discount) > 0" class="flex justify-between text-sm">
                      <span class="text-slate-500">Discount</span>
                      <span class="text-emerald-600 font-medium">-${{ Number(quotation.discount).toFixed(2) }}</span>
                    </div>
                  </div>
                  
                  <div class="mt-4 pt-4 border-t-2 border-purple-200">
                    <div class="flex justify-between items-center">
                      <span class="text-slate-900 font-bold text-lg">Total</span>
                      <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-black text-3xl">${{ Number(quotation.total).toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes & Terms -->
            <div class="px-10 pb-8 grid grid-cols-2 gap-6" v-if="quotation.notes || quotation.terms">
              <div v-if="quotation.notes" class="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </span>
                  Notes
                </p>
                <p class="text-sm text-slate-600">{{ quotation.notes }}</p>
              </div>
              
              <div v-if="quotation.terms" class="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  Terms & Conditions
                </p>
                <p class="text-sm text-slate-600">{{ quotation.terms }}</p>
              </div>
            </div>

            <!-- Footer -->
            <div class="bg-gradient-to-r from-purple-50 via-fuchsia-50 to-pink-50 px-10 py-6 border-t border-purple-100">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <span class="text-slate-600 text-sm">
                    This quote is valid until <strong class="text-purple-700">{{ formatDate(quotation.validUntil) }}</strong>
                  </span>
                </div>
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
            v-if="quotation.status === 'DRAFT'"
            color="primary"
            class="w-full"
            icon="i-lucide-send"
            @click="sendQuote"
            :loading="sending"
          >
            Send to Client
          </UButton>

          <UButton
            v-if="quotation.status === 'SENT'"
            color="success"
            class="w-full"
            icon="i-lucide-check-circle"
            @click="markAccepted"
            :loading="updating"
          >
            Mark as Accepted
          </UButton>

          <UButton
            v-if="quotation.status === 'SENT'"
            color="error"
            variant="soft"
            class="w-full"
            icon="i-lucide-x-circle"
            @click="markDeclined"
            :loading="updating"
          >
            Mark as Declined
          </UButton>

          <UButton
            v-if="['SENT', 'ACCEPTED'].includes(quotation.status)"
            color="warning"
            class="w-full"
            icon="i-lucide-file-text"
            @click="convertToInvoice"
            :loading="converting"
          >
            Convert to Invoice
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

        <!-- Status Timeline -->
        <div class="glass-card p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Timeline</h3>
          
          <div class="relative">
            <!-- Timeline Line -->
            <div class="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-purple-500 via-fuchsia-500 to-pink-500"></div>
            
            <div class="space-y-6">
              <div class="flex items-start gap-4 relative">
                <div class="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center z-10 shadow-lg shadow-purple-500/30">
                  <UIcon name="i-lucide-file-plus" class="w-4 h-4 text-white" />
                </div>
                <div>
                  <p class="text-white font-medium">Quote Created</p>
                  <p class="text-xs text-slate-400">{{ formatDate(quotation.createdAt) }}</p>
                </div>
              </div>
              
              <div v-if="quotation.status !== 'DRAFT'" class="flex items-start gap-4 relative">
                <div class="w-8 h-8 rounded-full bg-fuchsia-500 flex items-center justify-center z-10 shadow-lg shadow-fuchsia-500/30">
                  <UIcon name="i-lucide-send" class="w-4 h-4 text-white" />
                </div>
                <div>
                  <p class="text-white font-medium">Sent to Client</p>
                  <p class="text-xs text-slate-400">{{ formatDate(quotation.issueDate) }}</p>
                </div>
              </div>
              
              <div v-if="quotation.status === 'ACCEPTED'" class="flex items-start gap-4 relative">
                <div class="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center z-10 shadow-lg shadow-emerald-500/30">
                  <UIcon name="i-lucide-check-circle" class="w-4 h-4 text-white" />
                </div>
                <div>
                  <p class="text-white font-medium">Accepted</p>
                  <p class="text-xs text-slate-400">{{ formatDate(quotation.updatedAt) }}</p>
                </div>
              </div>
              
              <div v-if="quotation.status === 'DECLINED'" class="flex items-start gap-4 relative">
                <div class="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center z-10 shadow-lg shadow-rose-500/30">
                  <UIcon name="i-lucide-x-circle" class="w-4 h-4 text-white" />
                </div>
                <div>
                  <p class="text-white font-medium">Declined</p>
                  <p class="text-xs text-slate-400">{{ formatDate(quotation.updatedAt) }}</p>
                </div>
              </div>
              
              <div v-if="quotation.status === 'CONVERTED'" class="flex items-start gap-4 relative">
                <div class="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center z-10 shadow-lg shadow-pink-500/30">
                  <UIcon name="i-lucide-repeat" class="w-4 h-4 text-white" />
                </div>
                <div>
                  <p class="text-white font-medium">Converted to Invoice</p>
                  <p class="text-xs text-slate-400">{{ formatDate(quotation.updatedAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Client Info -->
        <div class="glass-card p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Client</h3>
          <NuxtLink :to="`/clients/${quotation.client.id}`" class="flex items-center gap-3 hover:bg-white/5 -mx-2 px-2 py-2 rounded-lg transition-colors">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/30">
              {{ getInitials(quotation.client.name) }}
            </div>
            <div>
              <p class="text-white font-medium">{{ quotation.client.name }}</p>
              <p class="text-sm text-slate-400">{{ quotation.client.email }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
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
const quotation = ref<any>(null)
const settings = ref<any>(null)
const downloading = ref(false)
const sending = ref(false)
const updating = ref(false)
const converting = ref(false)

const isExpired = computed(() => {
  if (!quotation.value) return false
  return new Date(quotation.value.validUntil) < new Date() && !['ACCEPTED', 'CONVERTED'].includes(quotation.value.status)
})

const fetchQuotation = async () => {
  loading.value = true
  try {
    const response = await $fetch(`/api/quotations/${route.params.id}`)
    quotation.value = response.quotation
    settings.value = response.settings
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to load quotation', color: 'error' })
    navigateTo('/quotations')
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => format(new Date(date), 'MMM d, yyyy')

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

const getStatusClass = (status: string) => {
  switch (status) {
    case 'ACCEPTED': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    case 'SENT': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    case 'DECLINED': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
    case 'DRAFT': return 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
    case 'CONVERTED': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
    default: return 'bg-slate-500/20 text-slate-400'
  }
}

const getQuoteBadgeClass = (status: string) => {
  switch (status) {
    case 'ACCEPTED': return 'bg-emerald-100 text-emerald-700'
    case 'SENT': return 'bg-amber-100 text-amber-700'
    case 'DECLINED': return 'bg-rose-100 text-rose-700'
    case 'DRAFT': return 'bg-slate-100 text-slate-700'
    case 'CONVERTED': return 'bg-purple-100 text-purple-700'
    default: return 'bg-slate-100 text-slate-700'
  }
}

const getQuoteDotClass = (status: string) => {
  switch (status) {
    case 'ACCEPTED': return 'bg-emerald-500 animate-pulse'
    case 'SENT': return 'bg-amber-500'
    case 'DECLINED': return 'bg-rose-500'
    case 'DRAFT': return 'bg-slate-500'
    case 'CONVERTED': return 'bg-purple-500 animate-pulse'
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

const downloadPdf = async () => {
  downloading.value = true
  try {
    const response = await fetch(`/api/quotations/${route.params.id}/pdf`)
    if (!response.ok) throw new Error('Failed to generate PDF')
    
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${quotation.value.quoteNumber}.pdf`
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

const sendQuote = async () => {
  sending.value = true
  try {
    await $fetch(`/api/quotations/${route.params.id}/send`, { method: 'POST' })
    toast.add({ title: 'Quote sent to client', color: 'success' })
    fetchQuotation()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  } finally {
    sending.value = false
  }
}

const markAccepted = async () => {
  updating.value = true
  try {
    await $fetch(`/api/quotations/${route.params.id}`, {
      method: 'PUT',
      body: { status: 'ACCEPTED' }
    })
    toast.add({ title: 'Quote marked as accepted', color: 'success' })
    fetchQuotation()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  } finally {
    updating.value = false
  }
}

const markDeclined = async () => {
  updating.value = true
  try {
    await $fetch(`/api/quotations/${route.params.id}`, {
      method: 'PUT',
      body: { status: 'DECLINED' }
    })
    toast.add({ title: 'Quote marked as declined', color: 'warning' })
    fetchQuotation()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  } finally {
    updating.value = false
  }
}

const convertToInvoice = async () => {
  converting.value = true
  try {
    const result = await $fetch(`/api/quotations/${route.params.id}/convert`, { method: 'POST' })
    toast.add({ title: 'Quote converted to invoice!', color: 'success' })
    navigateTo(`/invoices/${result.invoice.id}`)
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  } finally {
    converting.value = false
  }
}

onMounted(fetchQuotation)
</script>
