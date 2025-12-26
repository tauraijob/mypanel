<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">Email Logs</h1>
        <p class="text-slate-400 mt-1">Track all sent email notifications</p>
      </div>
      <UButton color="neutral" variant="soft" icon="i-lucide-refresh-cw" @click="fetchLogs" :loading="loading">
        Refresh
      </UButton>
    </div>

    <!-- Stats Overview -->
    <div class="glass-card p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-white flex items-center gap-2">
          <UIcon name="i-lucide-mail" class="w-5 h-5 text-sky-400" />
          Email Statistics
        </h2>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
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
        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <UIcon name="i-lucide-bell" class="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-amber-400">{{ stats.reminders }}</p>
              <p class="text-xs text-slate-400">Reminders</p>
            </div>
          </div>
        </div>
        <div class="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <UIcon name="i-lucide-file-text" class="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-blue-400">{{ stats.invoices }}</p>
              <p class="text-xs text-slate-400">Invoices</p>
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
          placeholder="Search by recipient or subject..."
          icon="i-lucide-search"
          class="w-72"
          @input="debouncedFilter"
        />
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="type in typeFilters"
            :key="type.value"
            class="px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            :class="typeFilter === type.value 
              ? 'bg-sky-500 text-white' 
              : 'bg-white/5 text-slate-400 hover:bg-white/10'"
            @click="setTypeFilter(type.value)"
          >
            <UIcon v-if="type.icon" :name="type.icon" class="w-4 h-4" />
            {{ type.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Logs Table -->
    <div class="glass-card overflow-hidden">
      <table class="w-full">
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
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                  <UIcon name="i-lucide-user" class="w-4 h-4" />
                </div>
                <span class="text-white">{{ log.recipient }}</span>
              </div>
            </td>
            <td class="p-4 max-w-xs">
              <p class="text-slate-300 truncate" :title="log.subject">{{ log.subject }}</p>
            </td>
            <td class="p-4">
              <div class="flex items-center gap-2">
                <div 
                  class="w-8 h-8 rounded-lg flex items-center justify-center"
                  :class="getTypeBgClass(log.type)"
                >
                  <UIcon :name="getTypeIcon(log.type)" class="w-4 h-4" :class="getTypeTextClass(log.type)" />
                </div>
                <span class="text-slate-300">{{ formatType(log.type) }}</span>
              </div>
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
              <div class="flex items-center justify-end gap-1">
                <UButton
                  icon="i-lucide-eye"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  title="View Email"
                  @click="viewEmail(log)"
                />
                <UButton
                  v-if="log.status === 'failed'"
                  icon="i-lucide-refresh-cw"
                  variant="ghost"
                  color="warning"
                  size="sm"
                  title="Retry Send"
                  :loading="retryingId === log.id"
                  @click="retryEmail(log)"
                />
              </div>
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

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between p-4 border-t border-white/10">
        <p class="text-sm text-slate-400">
          Showing {{ filteredLogs.length }} of {{ logs.length }} emails
        </p>
      </div>
    </div>

    <!-- Email Preview Modal - Styled like an Email Client -->
    <Teleport to="body">
      <div v-if="isPreviewOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="isPreviewOpen = false" />
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <!-- Email Client Header - Dark Theme -->
          <div class="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- Email Type Badge -->
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

          <!-- Email Meta Info -->
          <div class="bg-slate-100 border-b border-slate-200 px-6 py-4">
            <div class="flex items-start gap-4">
              <!-- Sender Avatar -->
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                <UIcon name="i-lucide-building-2" class="w-6 h-6" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-slate-900">{{ companyName }}</span>
                  <span class="text-slate-400 text-sm">{{ companyEmail }}</span>
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
            <!-- Simulated Email Body -->
            <div class="max-w-2xl mx-auto p-8">
              <!-- Email Content Card -->
              <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <!-- Email Header Banner -->
                <div class="h-2 bg-gradient-to-r" :class="getEmailBannerClass(selectedEmail?.type)"></div>
                
                <!-- Email Content -->
                <div class="p-8">
                  <div v-if="selectedEmail?.body" v-html="selectedEmail?.body" class="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-sky-600"></div>
                  <div v-else class="text-slate-500 italic">No email content available</div>
                </div>

                <!-- Email Footer -->
                <div class="bg-slate-50 border-t border-slate-100 px-8 py-4">
                  <p class="text-xs text-slate-400 text-center">
                    This email was sent automatically. Please do not reply directly to this email.
                  </p>
                </div>
              </div>

              <!-- Error Message if Failed -->
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

          <!-- Action Footer -->
          <div class="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-2 text-sm text-slate-500">
              <UIcon name="i-lucide-info" class="w-4 h-4" />
              <span>Sent via automated email system</span>
            </div>
            <div class="flex items-center gap-2">
              <UButton
                v-if="selectedEmail?.status === 'failed'"
                icon="i-lucide-refresh-cw"
                color="warning"
                :loading="retryingId === selectedEmail?.id"
                @click="retryFromPreview"
              >
                Retry Send
              </UButton>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                @click="isPreviewOpen = false"
              >
                Close
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'default'
})

const toast = useToast()

const logs = ref<any[]>([])
const search = ref('')
const typeFilter = ref('')
const loading = ref(false)
const isPreviewOpen = ref(false)
const selectedEmail = ref<any>(null)

const stats = ref({
  total: 0,
  sent: 0,
  failed: 0,
  reminders: 0,
  invoices: 0
})

const companyName = ref('MyPanel')
const companyEmail = ref('noreply@company.com')

// Fetch settings for company info
const fetchSettings = async () => {
  try {
    const settings = await $fetch('/api/settings')
    if (settings) {
      companyName.value = settings.companyName || 'MyPanel'
      companyEmail.value = settings.companyEmail || 'noreply@company.com'
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
  }
}

const typeFilters = [
  { label: 'All', value: '', icon: '' },
  { label: 'Invoice', value: 'INVOICE_CREATED', icon: 'i-lucide-file-text' },
  { label: 'Reminder', value: 'INVOICE_REMINDER', icon: 'i-lucide-bell' },
  { label: 'Overdue', value: 'INVOICE_OVERDUE', icon: 'i-lucide-alert-circle' },
  { label: 'Payment', value: 'PAYMENT_RECEIVED', icon: 'i-lucide-check-circle' },
  { label: 'Service', value: 'SERVICE_ACTIVATED', icon: 'i-lucide-zap' }
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

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / 20))

const fetchLogs = async () => {
  loading.value = true
  try {
    logs.value = await $fetch('/api/email-logs')
    calculateStats()
  } catch (error) {
    console.error('Error fetching email logs:', error)
  } finally {
    loading.value = false
  }
}

const calculateStats = () => {
  stats.value = {
    total: logs.value.length,
    sent: logs.value.filter(l => l.status === 'sent').length,
    failed: logs.value.filter(l => l.status !== 'sent').length,
    reminders: logs.value.filter(l => l.type === 'INVOICE_REMINDER' || l.type === 'INVOICE_OVERDUE').length,
    invoices: logs.value.filter(l => l.type === 'INVOICE_CREATED').length
  }
}

const debouncedFilter = useDebounceFn(() => {}, 300)

const setTypeFilter = (value: string) => {
  typeFilter.value = value
}

const formatDate = (date: string) => format(new Date(date), 'MMM d, yyyy')
const formatTime = (date: string) => format(new Date(date), 'HH:mm')

const formatType = (type: string) => {
  const types: Record<string, string> = {
    INVOICE_CREATED: 'Invoice',
    INVOICE_REMINDER: 'Reminder',
    INVOICE_OVERDUE: 'Overdue',
    QUOTE_SENT: 'Quote',
    SERVICE_ACTIVATED: 'Activated',
    SERVICE_SUSPENDED: 'Suspended',
    SERVICE_UNSUSPENDED: 'Unsuspended',
    PAYMENT_RECEIVED: 'Payment',
    WELCOME: 'Welcome',
    CUSTOM: 'Custom',
    SERVICE_EXPIRING: 'Expiring'
  }
  return types[type] || type
}

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    INVOICE_CREATED: 'i-lucide-file-text',
    INVOICE_REMINDER: 'i-lucide-bell',
    INVOICE_OVERDUE: 'i-lucide-alert-circle',
    QUOTE_SENT: 'i-lucide-file-check',
    SERVICE_ACTIVATED: 'i-lucide-zap',
    SERVICE_SUSPENDED: 'i-lucide-pause-circle',
    SERVICE_UNSUSPENDED: 'i-lucide-play-circle',
    PAYMENT_RECEIVED: 'i-lucide-check-circle',
    WELCOME: 'i-lucide-hand-wave',
    CUSTOM: 'i-lucide-mail',
    SERVICE_EXPIRING: 'i-lucide-clock'
  }
  return icons[type] || 'i-lucide-mail'
}

const getTypeBgClass = (type: string) => {
  const classes: Record<string, string> = {
    INVOICE_CREATED: 'bg-blue-500/20',
    INVOICE_REMINDER: 'bg-amber-500/20',
    INVOICE_OVERDUE: 'bg-rose-500/20',
    QUOTE_SENT: 'bg-purple-500/20',
    SERVICE_ACTIVATED: 'bg-emerald-500/20',
    SERVICE_SUSPENDED: 'bg-rose-500/20',
    SERVICE_UNSUSPENDED: 'bg-emerald-500/20',
    PAYMENT_RECEIVED: 'bg-emerald-500/20',
    WELCOME: 'bg-sky-500/20',
    CUSTOM: 'bg-slate-500/20',
    SERVICE_EXPIRING: 'bg-amber-500/20'
  }
  return classes[type] || 'bg-slate-500/20'
}

const getTypeTextClass = (type: string) => {
  const classes: Record<string, string> = {
    INVOICE_CREATED: 'text-blue-400',
    INVOICE_REMINDER: 'text-amber-400',
    INVOICE_OVERDUE: 'text-rose-400',
    QUOTE_SENT: 'text-purple-400',
    SERVICE_ACTIVATED: 'text-emerald-400',
    SERVICE_SUSPENDED: 'text-rose-400',
    SERVICE_UNSUSPENDED: 'text-emerald-400',
    PAYMENT_RECEIVED: 'text-emerald-400',
    WELCOME: 'text-sky-400',
    CUSTOM: 'text-slate-400',
    SERVICE_EXPIRING: 'text-amber-400'
  }
  return classes[type] || 'text-slate-400'
}

const getPreviewTypeBgClass = (type: string) => {
  const classes: Record<string, string> = {
    INVOICE_CREATED: 'bg-gradient-to-br from-blue-500 to-blue-600',
    INVOICE_REMINDER: 'bg-gradient-to-br from-amber-500 to-orange-600',
    INVOICE_OVERDUE: 'bg-gradient-to-br from-rose-500 to-red-600',
    QUOTE_SENT: 'bg-gradient-to-br from-purple-500 to-violet-600',
    SERVICE_ACTIVATED: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    SERVICE_SUSPENDED: 'bg-gradient-to-br from-rose-500 to-red-600',
    SERVICE_UNSUSPENDED: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    PAYMENT_RECEIVED: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    WELCOME: 'bg-gradient-to-br from-sky-500 to-blue-600',
    CUSTOM: 'bg-gradient-to-br from-slate-500 to-slate-600',
    SERVICE_EXPIRING: 'bg-gradient-to-br from-amber-500 to-orange-600'
  }
  return classes[type] || 'bg-gradient-to-br from-slate-500 to-slate-600'
}

const getEmailBannerClass = (type: string) => {
  const classes: Record<string, string> = {
    INVOICE_CREATED: 'from-blue-500 to-indigo-600',
    INVOICE_REMINDER: 'from-amber-500 to-orange-600',
    INVOICE_OVERDUE: 'from-rose-500 to-red-600',
    QUOTE_SENT: 'from-purple-500 to-violet-600',
    SERVICE_ACTIVATED: 'from-emerald-500 to-teal-600',
    SERVICE_SUSPENDED: 'from-rose-500 to-red-600',
    SERVICE_UNSUSPENDED: 'from-emerald-500 to-teal-600',
    PAYMENT_RECEIVED: 'from-emerald-500 to-teal-600',
    WELCOME: 'from-sky-500 to-blue-600',
    CUSTOM: 'from-slate-500 to-slate-600',
    SERVICE_EXPIRING: 'from-amber-500 to-orange-600'
  }
  return classes[type] || 'from-slate-500 to-slate-600'
}

const viewEmail = (log: any) => {
  selectedEmail.value = log
  isPreviewOpen.value = true
}

const retryingId = ref<number | null>(null)

const retryEmail = async (log: any) => {
  retryingId.value = log.id
  try {
    const response = await $fetch(`/api/email-logs/${log.id}/retry`, { method: 'POST' })
    toast.add({ 
      title: 'Email Resent!', 
      description: response.message, 
      color: 'success' 
    })
    // Refresh the logs to show updated status
    await fetchLogs()
  } catch (error: any) {
    toast.add({ 
      title: 'Retry Failed', 
      description: error.data?.message || 'Failed to resend email', 
      color: 'error' 
    })
  } finally {
    retryingId.value = null
  }
}

const retryFromPreview = async () => {
  if (!selectedEmail.value) return
  await retryEmail(selectedEmail.value)
  // Update the selected email status in the preview
  if (selectedEmail.value && retryingId.value === null) {
    const updatedLog = logs.value.find(l => l.id === selectedEmail.value.id)
    if (updatedLog) {
      selectedEmail.value = updatedLog
    }
  }
}

onMounted(() => {
  fetchLogs()
  fetchSettings()
})
</script>
