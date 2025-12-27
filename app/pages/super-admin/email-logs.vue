<template>
  <div class="space-y-6">
    <NuxtLayout name="super-admin">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-white">Email Logs</h1>
          <p class="text-slate-400 mt-1">View all platform email notifications</p>
        </div>
        <UButton color="neutral" variant="soft" icon="i-lucide-refresh-cw" @click="fetchLogs" :loading="loading">
          Refresh
        </UButton>
      </div>

      <!-- Stats Overview -->
      <div class="glass-card p-6 mb-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl bg-white/5 border border-white/10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
                <UIcon name="i-lucide-send" class="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <p class="text-2xl font-bold text-white">{{ stats.total }}</p>
                <p class="text-xs text-slate-400">Total Sent</p>
              </div>
            </div>
          </div>
          <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p class="text-2xl font-bold text-emerald-400">{{ stats.sent }}</p>
                <p class="text-xs text-slate-400">Delivered</p>
              </div>
            </div>
          </div>
          <div class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                <UIcon name="i-lucide-x-circle" class="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <p class="text-2xl font-bold text-rose-400">{{ stats.failed }}</p>
                <p class="text-xs text-slate-400">Failed</p>
              </div>
            </div>
          </div>
          <div class="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <UIcon name="i-lucide-user-plus" class="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p class="text-2xl font-bold text-purple-400">{{ stats.welcome }}</p>
                <p class="text-xs text-slate-400">Welcome Emails</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="glass-card p-4 mb-6">
        <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div class="relative flex-1 sm:flex-none sm:w-72">
            <UIcon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
            <UInput
              v-model="search"
              placeholder="Search by recipient or subject..."
              class="w-full pl-10"
              :ui="{ base: 'pl-10' }"
            />
          </div>
          <div class="flex gap-2 overflow-x-auto pb-1 -mb-1">
            <button
              v-for="type in typeFilters"
              :key="type.value"
              class="px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shrink-0"
              :class="typeFilter === type.value 
                ? 'bg-sky-500 text-white' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'"
              @click="typeFilter = type.value"
            >
              <UIcon v-if="type.icon" :name="type.icon" class="w-4 h-4" />
              {{ type.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Logs Table -->
      <div class="glass-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[800px]">
            <thead>
              <tr class="border-b border-white/10">
                <th class="text-left p-4 text-slate-400 font-medium">Date</th>
                <th class="text-left p-4 text-slate-400 font-medium">Recipient</th>
                <th class="text-left p-4 text-slate-400 font-medium">Subject</th>
                <th class="text-left p-4 text-slate-400 font-medium">Type</th>
                <th class="text-left p-4 text-slate-400 font-medium">Status</th>
                <th class="text-right p-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="log in filteredLogs"
                :key="log.id"
                class="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td class="p-4">
                  <p class="text-white">{{ formatDate(log.sentAt) }}</p>
                  <p class="text-xs text-slate-400">{{ formatTime(log.sentAt) }}</p>
                </td>
                <td class="p-4">
                  <span class="text-white">{{ log.recipient }}</span>
                </td>
                <td class="p-4 max-w-xs">
                  <p class="text-slate-300 truncate" :title="log.subject">{{ log.subject }}</p>
                </td>
                <td class="p-4">
                  <span 
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    :class="getTypeBadgeClass(log.type)"
                  >
                    {{ formatType(log.type) }}
                  </span>
                </td>
                <td class="p-4">
                  <span
                    class="px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                    :class="log.status === 'sent' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'"
                  >
                    <UIcon 
                      :name="log.status === 'sent' ? 'i-lucide-check' : 'i-lucide-x'" 
                      class="w-3 h-3" 
                    />
                    {{ log.status === 'sent' ? 'Delivered' : 'Failed' }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <UButton
                    icon="i-lucide-eye"
                    variant="ghost"
                    color="neutral"
                    size="sm"
                    title="View Email"
                    @click="viewEmail(log)"
                  />
                </td>
              </tr>
              <tr v-if="filteredLogs.length === 0">
                <td colspan="6" class="p-8 text-center text-slate-400">
                  <UIcon name="i-lucide-mail" class="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No email logs found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </NuxtLayout>

    <!-- Email Preview Modal -->
    <Teleport to="body">
      <div v-if="isPreviewOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="isPreviewOpen = false" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <!-- Email Header -->
          <div class="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div 
                class="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                :class="getPreviewTypeBgClass(selectedEmail?.type)"
              >
                <UIcon :name="getTypeIcon(selectedEmail?.type)" class="w-6 h-6 text-white" />
              </div>
              <div>
                <div class="flex items-center gap-3">
                  <h2 class="text-xl font-bold text-white">{{ formatType(selectedEmail?.type) }} Email</h2>
                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-bold"
                    :class="selectedEmail?.status === 'sent' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-rose-500 text-white'"
                  >
                    {{ selectedEmail?.status === 'sent' ? '✓ Delivered' : '✕ Failed' }}
                  </span>
                </div>
                <p class="text-slate-400 text-sm mt-0.5">{{ formatDate(selectedEmail?.sentAt) }} at {{ formatTime(selectedEmail?.sentAt) }}</p>
              </div>
            </div>
            <button @click="isPreviewOpen = false" class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <UIcon name="i-lucide-x" class="w-5 h-5 text-white" />
            </button>
          </div>

          <!-- Email Meta -->
          <div class="bg-slate-100 border-b border-slate-200 px-6 py-4">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                <UIcon name="i-lucide-building-2" class="w-6 h-6" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-slate-900">MyPanel</span>
                  <span class="text-slate-400 text-sm">noreply@mypanel.com</span>
                </div>
                <div class="flex items-center gap-2 mt-1 text-sm">
                  <span class="text-slate-500">To:</span>
                  <span class="text-slate-700 font-medium">{{ selectedEmail?.recipient }}</span>
                </div>
                <div class="mt-2">
                  <p class="text-slate-900 font-semibold text-lg">{{ selectedEmail?.subject }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Email Body -->
          <div class="flex-1 overflow-y-auto bg-white">
            <div class="max-w-2xl mx-auto p-8">
              <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div class="h-2 bg-gradient-to-r" :class="getEmailBannerClass(selectedEmail?.type)"></div>
                <div class="p-8">
                  <div v-if="selectedEmail?.body" v-html="selectedEmail?.body" class="prose prose-slate max-w-none"></div>
                  <div v-else class="text-slate-500 italic">No email content available</div>
                </div>
              </div>

              <!-- Error if Failed -->
              <div v-if="selectedEmail?.error" class="mt-6 bg-rose-50 border border-rose-200 rounded-xl p-5">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p class="font-semibold text-rose-800">Delivery Failed</p>
                    <p class="text-rose-600 text-sm mt-1">{{ selectedEmail.error }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end">
            <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="isPreviewOpen = false">
              Close
            </UButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

definePageMeta({
  layout: false
})

const loading = ref(false)
const logs = ref<any[]>([])
const search = ref('')
const typeFilter = ref('')
const isPreviewOpen = ref(false)
const selectedEmail = ref<any>(null)

const stats = computed(() => ({
  total: logs.value.length,
  sent: logs.value.filter(l => l.status === 'sent').length,
  failed: logs.value.filter(l => l.status !== 'sent').length,
  welcome: logs.value.filter(l => ['WELCOME', 'VERIFICATION'].includes(l.type)).length
}))

const typeFilters = [
  { label: 'All', value: '', icon: '' },
  { label: 'Welcome', value: 'WELCOME', icon: 'i-lucide-user-plus' },
  { label: 'Verification', value: 'VERIFICATION', icon: 'i-lucide-mail-check' },
  { label: 'Invoice', value: 'INVOICE_CREATED', icon: 'i-lucide-file-text' },
  { label: 'Contact', value: 'CONTACT_FORM', icon: 'i-lucide-message-square' }
]

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    const matchesSearch = !search.value || 
      log.recipient.toLowerCase().includes(search.value.toLowerCase()) ||
      log.subject.toLowerCase().includes(search.value.toLowerCase())
    const matchesType = !typeFilter.value || log.type === typeFilter.value
    return matchesSearch && matchesType
  })
})

const fetchLogs = async () => {
  loading.value = true
  try {
    logs.value = await $fetch('/api/email-logs')
  } catch (error) {
    console.error('Error fetching logs:', error)
  } finally {
    loading.value = false
  }
}

const viewEmail = (log: any) => {
  selectedEmail.value = log
  isPreviewOpen.value = true
}

const formatDate = (date: string) => format(new Date(date), 'MMM d, yyyy')
const formatTime = (date: string) => format(new Date(date), 'HH:mm')

const formatType = (type: string) => {
  const types: Record<string, string> = {
    WELCOME: 'Welcome',
    VERIFICATION: 'Verification',
    INVOICE_CREATED: 'Invoice',
    INVOICE_REMINDER: 'Reminder',
    INVOICE_OVERDUE: 'Overdue',
    PAYMENT_RECEIVED: 'Payment',
    CONTACT_FORM: 'Contact',
    SERVICE_ACTIVATED: 'Activated',
    CUSTOM: 'Custom'
  }
  return types[type] || type
}

const getTypeBadgeClass = (type: string) => {
  const classes: Record<string, string> = {
    WELCOME: 'bg-purple-500/20 text-purple-400',
    VERIFICATION: 'bg-blue-500/20 text-blue-400',
    INVOICE_CREATED: 'bg-sky-500/20 text-sky-400',
    INVOICE_REMINDER: 'bg-amber-500/20 text-amber-400',
    INVOICE_OVERDUE: 'bg-rose-500/20 text-rose-400',
    PAYMENT_RECEIVED: 'bg-emerald-500/20 text-emerald-400',
    CONTACT_FORM: 'bg-teal-500/20 text-teal-400',
    SERVICE_ACTIVATED: 'bg-green-500/20 text-green-400'
  }
  return classes[type] || 'bg-slate-500/20 text-slate-400'
}

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    WELCOME: 'i-lucide-user-plus',
    VERIFICATION: 'i-lucide-mail-check',
    INVOICE_CREATED: 'i-lucide-file-text',
    INVOICE_REMINDER: 'i-lucide-bell',
    INVOICE_OVERDUE: 'i-lucide-alert-circle',
    PAYMENT_RECEIVED: 'i-lucide-check-circle',
    CONTACT_FORM: 'i-lucide-message-square',
    SERVICE_ACTIVATED: 'i-lucide-zap'
  }
  return icons[type] || 'i-lucide-mail'
}

const getPreviewTypeBgClass = (type: string) => {
  const classes: Record<string, string> = {
    WELCOME: 'bg-gradient-to-br from-purple-500 to-violet-600',
    VERIFICATION: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    INVOICE_CREATED: 'bg-gradient-to-br from-sky-500 to-blue-600',
    INVOICE_REMINDER: 'bg-gradient-to-br from-amber-500 to-orange-600',
    INVOICE_OVERDUE: 'bg-gradient-to-br from-rose-500 to-red-600',
    PAYMENT_RECEIVED: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    CONTACT_FORM: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    SERVICE_ACTIVATED: 'bg-gradient-to-br from-green-500 to-emerald-600'
  }
  return classes[type] || 'bg-gradient-to-br from-slate-500 to-slate-600'
}

const getEmailBannerClass = (type: string) => {
  const classes: Record<string, string> = {
    WELCOME: 'from-purple-500 to-violet-600',
    VERIFICATION: 'from-blue-500 to-indigo-600',
    INVOICE_CREATED: 'from-sky-500 to-blue-600',
    INVOICE_REMINDER: 'from-amber-500 to-orange-600',
    INVOICE_OVERDUE: 'from-rose-500 to-red-600',
    PAYMENT_RECEIVED: 'from-emerald-500 to-teal-600',
    CONTACT_FORM: 'from-teal-500 to-cyan-600',
    SERVICE_ACTIVATED: 'from-green-500 to-emerald-600'
  }
  return classes[type] || 'from-slate-500 to-slate-600'
}

onMounted(fetchLogs)
</script>
