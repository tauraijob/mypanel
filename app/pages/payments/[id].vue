<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" @click="navigateTo('/payments')" />
        <div>
          <h1 class="text-3xl font-bold text-white">Payment Receipt</h1>
          <p class="text-slate-400 mt-1">Receipt #REC-{{ String(payment?.id || '').padStart(4, '0') }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          v-if="payment"
          icon="i-lucide-send"
          color="success"
          variant="soft"
          :loading="sending"
          @click="sendReceipt"
        >
          Send to Client
        </UButton>
        <UButton
          v-if="payment"
          icon="i-lucide-download"
          color="primary"
          :loading="downloading"
          @click="downloadReceipt"
        >
          Download PDF
        </UButton>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-emerald-400" />
    </div>

    <div v-else-if="payment" class="max-w-2xl mx-auto">
      <!-- Receipt Card -->
      <div class="relative bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
        <!-- Green Header -->
        <div class="bg-gradient-to-br from-emerald-600 to-teal-600 p-8 pb-16 relative overflow-hidden">
          <!-- Decorative circles -->
          <div class="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-emerald-500/30"></div>
          <div class="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-teal-500/30"></div>
          
          <div class="relative flex justify-between items-start">
            <!-- Logo -->
            <div v-if="settings?.logoUrl" class="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center p-2">
              <img :src="settings.logoUrl" alt="Company Logo" class="w-full h-full object-contain" />
            </div>
            <div v-else class="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center">
              <span class="text-2xl font-black text-emerald-600">{{ getCompanyInitial() }}</span>
            </div>
            
            <!-- Receipt Title -->
            <div class="text-right">
              <h2 class="text-3xl font-black text-white tracking-tight">RECEIPT</h2>
              <p class="text-emerald-100 font-mono mt-1">#REC-{{ String(payment.id).padStart(4, '0') }}</p>
              <div class="mt-3 text-sm text-emerald-100 space-y-0.5">
                <p v-if="settings?.companyAddress">{{ settings.companyAddress }}</p>
                <p v-if="settings?.companyCity">{{ settings.companyCity }}, {{ settings.companyState }}</p>
                <p v-if="settings?.companyEmail">{{ settings.companyEmail }}</p>
                <p v-if="settings?.companyPhone">{{ settings.companyPhone }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Success Badge -->
        <div class="flex justify-center -mt-10 relative z-10">
          <div class="w-20 h-20 rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/30 flex items-center justify-center border-4 border-white">
            <UIcon name="i-lucide-check" class="w-10 h-10 text-white" />
          </div>
        </div>

        <!-- Content -->
        <div class="p-8 pt-6 text-center">
          <h3 class="text-xl font-bold text-emerald-700">Payment Received</h3>
          <p class="text-slate-500 mt-1">Thank you for your payment</p>
          
          <!-- Amount -->
          <div class="my-8">
            <p class="text-5xl font-black text-emerald-600">${{ Number(payment.amount).toFixed(2) }}</p>
          </div>

          <!-- Details Card -->
          <div class="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-left">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Date</p>
                <p class="text-slate-800 font-medium mt-1">{{ formatDate(payment.paymentDate) }}</p>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Method</p>
                <div class="flex items-center gap-2 mt-1">
                  <div 
                    class="w-7 h-7 rounded-lg flex items-center justify-center"
                    :class="getMethodBgClass(payment.paymentMethod)"
                  >
                    <UIcon :name="getMethodIcon(payment.paymentMethod)" class="w-4 h-4" :class="getMethodTextClass(payment.paymentMethod)" />
                  </div>
                  <span class="text-slate-800 font-medium">{{ formatMethod(payment.paymentMethod) }}</span>
                </div>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice Number</p>
                <NuxtLink :to="`/invoices/${payment.invoice.id}`" class="text-emerald-600 font-medium mt-1 hover:underline">
                  {{ payment.invoice.invoiceNumber }}
                </NuxtLink>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Reference</p>
                <p class="text-slate-800 font-medium mt-1">{{ payment.reference || '-' }}</p>
              </div>
            </div>

            <div class="h-px bg-slate-200 my-5"></div>

            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Received From</p>
              <div class="flex items-center gap-3 mt-2">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                  {{ getInitials(payment.invoice.client.name) }}
                </div>
                <div>
                  <p class="text-slate-800 font-bold">{{ payment.invoice.client.name }}</p>
                  <p class="text-sm text-slate-500">{{ payment.invoice.client.email }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gradient-to-r from-emerald-50 to-teal-50 px-8 py-6 text-center border-t border-emerald-100">
          <p class="text-emerald-700 font-semibold">Thank you for your business!</p>
          <p class="text-sm text-slate-400 mt-1">This is an official receipt for payment received on {{ formatDate(payment.paymentDate) }}</p>
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
const payment = ref<any>(null)
const settings = ref<any>(null)
const downloading = ref(false)
const sending = ref(false)

const fetchPayment = async () => {
  loading.value = true
  try {
    const response = await $fetch(`/api/payments/${route.params.id}`)
    payment.value = response.payment
    settings.value = response.settings
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to load payment', color: 'error' })
    navigateTo('/payments')
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => format(new Date(date), 'MMMM d, yyyy')

const getCompanyInitial = () => {
  return (settings.value?.companyName || 'M')[0].toUpperCase()
}

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
    CRYPTO: 'Cryptocurrency',
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
    BANK_TRANSFER: 'bg-blue-100',
    CASH: 'bg-emerald-100',
    CREDIT_CARD: 'bg-purple-100',
    PAYPAL: 'bg-sky-100',
    MOBILE_MONEY: 'bg-amber-100',
    CRYPTO: 'bg-orange-100',
    OTHER: 'bg-slate-100'
  }
  return classes[method] || 'bg-slate-100'
}

const getMethodTextClass = (method: string) => {
  const classes: Record<string, string> = {
    BANK_TRANSFER: 'text-blue-600',
    CASH: 'text-emerald-600',
    CREDIT_CARD: 'text-purple-600',
    PAYPAL: 'text-sky-600',
    MOBILE_MONEY: 'text-amber-600',
    CRYPTO: 'text-orange-600',
    OTHER: 'text-slate-600'
  }
  return classes[method] || 'text-slate-600'
}

const downloadReceipt = async () => {
  downloading.value = true
  try {
    const response = await fetch(`/api/payments/${route.params.id}/receipt`)
    if (!response.ok) throw new Error('Failed to generate receipt')
    
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Receipt-${payment.value.id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.add({ title: 'Receipt downloaded', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to download receipt', color: 'error' })
  } finally {
    downloading.value = false
  }
}

const sendReceipt = async () => {
  sending.value = true
  try {
    const response = await $fetch(`/api/payments/${route.params.id}/send`, { method: 'POST' })
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
    sending.value = false
  }
}

onMounted(fetchPayment)
</script>

