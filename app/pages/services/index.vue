<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-white">Services</h1>
        <p class="text-slate-400 mt-1 text-sm sm:text-base">Manage client services and subscriptions</p>
      </div>
      <UButton v-if="hasPermission('services.create')" color="primary" icon="i-lucide-plus" @click="openModal()" class="w-full sm:w-auto">
        Add Service
      </UButton>
    </div>

    <!-- Filters -->
    <div class="glass-card p-4 relative z-10">
      <div class="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
        <UInput
          v-model="search"
          placeholder="Search services..."
          icon="i-lucide-search"
          class="w-full sm:w-64"
          @input="debouncedFetch"
        />
        <div class="flex gap-3 w-full sm:w-auto">
          <USelect
            v-model="statusFilter"
            :items="statusOptions"
            placeholder="All Statuses"
            class="flex-1 sm:w-40"
            @change="fetchServices"
          />
          <USelect
            v-model="categoryFilter"
            :items="categoryOptions"
            placeholder="All Categories"
            class="flex-1 sm:w-48"
            @change="fetchServices"
          />
        </div>
      </div>
    </div>

    <!-- Services Table -->
    <div class="glass-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[700px]">
          <thead>
            <tr class="border-b border-white/10">
              <th class="text-left p-4 text-slate-400 font-medium">Service</th>
              <th class="text-left p-4 text-slate-400 font-medium">Client</th>
              <th class="text-left p-4 text-slate-400 font-medium">Price</th>
              <th class="text-left p-4 text-slate-400 font-medium hidden sm:table-cell">Next Due</th>
              <th class="text-left p-4 text-slate-400 font-medium">Status</th>
            <th class="text-right p-4 text-slate-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="service in services"
            :key="service.id"
            class="border-b border-white/5 hover:bg-white/5 transition-colors"
          >
            <td class="p-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  :style="{ backgroundColor: service.category?.color + '20' }"
                >
                  <UIcon name="i-lucide-server" class="w-5 h-5" :style="{ color: service.category?.color }" />
                </div>
                <div>
                  <p class="font-medium text-white">{{ service.name }}</p>
                  <p class="text-sm text-slate-400">{{ service.category?.name }}</p>
                </div>
              </div>
            </td>
            <td class="p-4">
              <NuxtLink :to="`/clients/${service.client.id}`" class="text-blue-400 hover:text-blue-300">
                {{ service.client.name }}
              </NuxtLink>
            </td>
            <td class="p-4">
              <p class="font-semibold text-white">${{ Number(service.price).toFixed(2) }}</p>
              <p class="text-sm text-slate-400">{{ formatBillingCycle(service.billingCycle) }}</p>
            </td>
            <td class="p-4">
              <p class="text-white">{{ formatDate(service.nextDueDate) }}</p>
              <p class="text-sm" :class="getDueDateColor(service.nextDueDate)">
                {{ getDueDateText(service.nextDueDate) }}
              </p>
            </td>
            <td class="p-4">
              <span
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="getStatusClass(service.status)"
              >
                {{ service.status }}
              </span>
            </td>
            <td class="p-4 text-right">
              <div class="flex items-center justify-end gap-1">
                <!-- Status Actions -->
                <UButton
                  v-if="service.status === 'PENDING'"
                  icon="i-lucide-check-circle"
                  variant="ghost"
                  color="success"
                  size="sm"
                  title="Activate"
                  @click="activateService(service.id)"
                />
                <UButton
                  v-if="service.status === 'ACTIVE'"
                  icon="i-lucide-pause-circle"
                  variant="ghost"
                  color="warning"
                  size="sm"
                  title="Suspend"
                  @click="suspendService(service.id)"
                />
                <UButton
                  v-if="service.status === 'SUSPENDED'"
                  icon="i-lucide-play-circle"
                  variant="ghost"
                  color="success"
                  size="sm"
                  title="Unsuspend"
                  @click="unsuspendService(service.id)"
                />
                <!-- Always visible actions -->
                <UButton
                  icon="i-lucide-pencil"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  title="Edit"
                  @click="openModal(service)"
                />
                <UButton
                  icon="i-lucide-file-plus"
                  variant="ghost"
                  color="primary"
                  size="sm"
                  title="Create Invoice"
                  @click="navigateTo(`/invoices/new?serviceId=${service.id}&clientId=${service.clientId}`)"
                />
                <UButton
                  v-if="service.status !== 'TERMINATED'"
                  icon="i-lucide-x-circle"
                  variant="ghost"
                  color="error"
                  size="sm"
                  title="Terminate"
                  @click="confirmTerminate(service)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="services.length === 0">
            <td colspan="6" class="p-8 text-center text-slate-400">
              <UIcon name="i-lucide-server" class="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No services found</p>
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
          @update:model-value="fetchServices"
        />
      </div>
    </div>

    <!-- Add/Edit Modal - Landscape -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="isModalOpen = false" />
        
        <!-- Modal Content -->
        <div class="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
          <!-- Header -->
          <div class="bg-slate-800/50 border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <UIcon :name="editingService ? 'i-lucide-server-cog' : 'i-lucide-server'" class="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">{{ editingService ? 'Edit Service' : 'Add New Service' }}</h2>
                <p class="text-slate-400 text-xs">{{ editingService ? 'Update service details' : 'Create a new service for a client' }}</p>
              </div>
            </div>
            <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="isModalOpen = false" />
          </div>

          <!-- Form Content -->
          <form @submit.prevent="saveService" class="overflow-y-auto max-h-[calc(85vh-130px)]">
            <div class="p-6">
              <div class="grid grid-cols-3 gap-5">
                <!-- Column 1 - Basic Info -->
                <div class="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 class="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <UIcon name="i-lucide-info" class="w-3.5 h-3.5" />
                    Basic Info
                  </h3>
                  <div class="space-y-3">
                    <UFormField label="Service Name *" name="name">
                      <UInput v-model="form.name" placeholder="Premium Hosting" size="sm" required />
                    </UFormField>
                    <UFormField label="Client *" name="clientId">
                      <USelect v-model="form.clientId" :items="clientOptions" placeholder="Select client" size="sm" required />
                    </UFormField>
                    <UFormField label="Category *" name="categoryId">
                      <USelect v-model="form.categoryId" :items="categorySelectOptions" placeholder="Select category" size="sm" required />
                    </UFormField>
                  </div>
                </div>

                <!-- Column 2 - Pricing -->
                <div class="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 class="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <UIcon name="i-lucide-credit-card" class="w-3.5 h-3.5" />
                    Pricing & Billing
                  </h3>
                  <div class="space-y-3">
                    <UFormField label="Price ($) *" name="price">
                      <UInput v-model="form.price" type="number" step="0.01" placeholder="0.00" size="sm" required />
                    </UFormField>
                    <UFormField label="Billing Cycle *" name="billingCycle">
                      <USelect v-model="form.billingCycle" :items="billingCycleOptions" size="sm" required />
                    </UFormField>
                    <UFormField label="Start Date" name="startDate">
                      <UInput v-model="form.startDate" type="date" size="sm" />
                    </UFormField>
                  </div>
                </div>

                <!-- Column 3 - Details -->
                <div class="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 class="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <UIcon name="i-lucide-globe" class="w-3.5 h-3.5" />
                    Additional Details
                  </h3>
                  <div class="space-y-3">
                    <UFormField label="Domain" name="domain">
                      <UInput v-model="form.domain" placeholder="example.com" size="sm" />
                    </UFormField>
                    <UFormField label="Description" name="description">
                      <UTextarea v-model="form.description" placeholder="Service description..." rows="4" size="sm" />
                    </UFormField>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="bg-slate-800/30 border-t border-white/10 px-6 py-4 flex justify-end gap-3">
              <UButton variant="ghost" color="neutral" @click="isModalOpen = false">
                Cancel
              </UButton>
              <UButton type="submit" color="primary" :loading="saving" icon="i-lucide-check">
                {{ editingService ? 'Update Service' : 'Create Service' }}
              </UButton>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Terminate Confirmation Modal -->
    <Teleport to="body">
      <div v-if="isTerminateModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="isTerminateModalOpen = false" />
        <div class="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div class="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-lucide-alert-triangle" class="w-10 h-10 text-rose-400" />
          </div>
          <h3 class="text-2xl font-bold text-white mb-3">Terminate Service?</h3>
          <p class="text-slate-400 mb-2">
            You're about to terminate <span class="text-white font-semibold">{{ serviceToTerminate?.name }}</span>
          </p>
          <p class="text-sm text-slate-500 mb-8">
            This action will permanently end this service and notify the client. This cannot be undone.
          </p>
          <div class="flex justify-center gap-4">
            <UButton variant="ghost" color="neutral" size="lg" @click="isTerminateModalOpen = false">
              Cancel
            </UButton>
            <UButton color="error" size="lg" :loading="terminating" icon="i-lucide-x-circle" @click="terminateService">
              Terminate Service
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

const services = ref<any[]>([])
const categories = ref<any[]>([])
const clients = ref<any[]>([])
const search = ref('')
const statusFilter = ref('all')
const categoryFilter = ref('all')
const isModalOpen = ref(false)
const editingService = ref<any>(null)
const saving = ref(false)
const isTerminateModalOpen = ref(false)
const serviceToTerminate = ref<any>(null)
const terminating = ref(false)

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const form = ref({
  name: '',
  clientId: '',
  categoryId: '',
  price: '',
  billingCycle: 'MONTHLY',
  startDate: '',
  domain: '',
  description: ''
})

const statusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Suspended', value: 'SUSPENDED' },
  { label: 'Terminated', value: 'TERMINATED' }
]

const billingCycleOptions = [
  { label: 'One-time', value: 'ONETIME' },
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Quarterly', value: 'QUARTERLY' },
  { label: 'Semi-Annually', value: 'SEMIANNUALLY' },
  { label: 'Annually', value: 'ANNUALLY' },
  { label: 'Biennially', value: 'BIENNIALLY' }
]

const categoryOptions = computed(() => [
  { label: 'All Categories', value: 'all' },
  ...categories.value.map(c => ({ label: c.name, value: c.id.toString() }))
])

const categorySelectOptions = computed(() =>
  categories.value.map(c => ({ label: c.name, value: c.id.toString() }))
)

const clientOptions = computed(() =>
  clients.value.map(c => ({ label: c.name, value: c.id.toString() }))
)

const fetchServices = async () => {
  try {
    const response = await $fetch('/api/services', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: search.value,
        status: statusFilter.value === 'all' ? '' : statusFilter.value,
        categoryId: categoryFilter.value === 'all' ? '' : categoryFilter.value
      }
    })
    services.value = response.services
    pagination.value = { ...pagination.value, ...response.pagination }
  } catch (error) {
    console.error('Error fetching services:', error)
  }
}

const fetchCategories = async () => {
  try {
    categories.value = await $fetch('/api/categories')
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

const fetchClients = async () => {
  try {
    const response = await $fetch('/api/clients', { query: { limit: 100 } })
    clients.value = response.clients
  } catch (error) {
    console.error('Error fetching clients:', error)
  }
}

const debouncedFetch = useDebounceFn(fetchServices, 300)

const openModal = (service?: any) => {
  if (service) {
    editingService.value = service
    form.value = {
      name: service.name,
      clientId: service.clientId.toString(),
      categoryId: service.categoryId.toString(),
      price: service.price.toString(),
      billingCycle: service.billingCycle,
      startDate: service.startDate?.split('T')[0] || '',
      domain: service.domain || '',
      description: service.description || ''
    }
  } else {
    editingService.value = null
    form.value = {
      name: '',
      clientId: '',
      categoryId: '',
      price: '',
      billingCycle: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0],
      domain: '',
      description: ''
    }
  }
  isModalOpen.value = true
}

const saveService = async () => {
  saving.value = true
  try {
    const data = {
      ...form.value,
      clientId: parseInt(form.value.clientId),
      categoryId: parseInt(form.value.categoryId),
      price: parseFloat(form.value.price)
    }

    if (editingService.value) {
      await $fetch(`/api/services/${editingService.value.id}`, {
        method: 'PUT',
        body: data
      })
      toast.add({ title: 'Service updated successfully', color: 'success' })
    } else {
      await $fetch('/api/services', {
        method: 'POST',
        body: data
      })
      toast.add({ title: 'Service created successfully', color: 'success' })
    }
    isModalOpen.value = false
    fetchServices()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to save service',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

const getServiceActions = (service: any) => {
  const actions: any[] = []
  
  // Status-based actions
  if (service.status === 'PENDING') {
    actions.push({
      label: 'Activate Service',
      icon: 'i-lucide-check-circle',
      onSelect: () => activateService(service.id)
    })
  }
  
  if (service.status === 'ACTIVE') {
    actions.push({
      label: 'Suspend Service',
      icon: 'i-lucide-pause-circle',
      onSelect: () => suspendService(service.id)
    })
  }
  
  if (service.status === 'SUSPENDED') {
    actions.push({
      label: 'Unsuspend Service',
      icon: 'i-lucide-play-circle',
      onSelect: () => unsuspendService(service.id)
    })
  }
  
  // Always available actions
  actions.push({
    label: 'Edit Service',
    icon: 'i-lucide-pencil',
    onSelect: () => openModal(service)
  })
  
  actions.push({
    label: 'Create Invoice',
    icon: 'i-lucide-file-plus',
    onSelect: () => navigateTo(`/invoices/new?serviceId=${service.id}&clientId=${service.clientId}`)
  })

  return [actions]
}

const activateService = async (id: number) => {
  try {
    await $fetch(`/api/services/${id}/activate`, { method: 'POST' })
    toast.add({ title: 'Service activated', color: 'success' })
    fetchServices()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  }
}

const suspendService = async (id: number) => {
  try {
    await $fetch(`/api/services/${id}/suspend`, { method: 'POST', body: { reason: 'Manual suspension' } })
    toast.add({ title: 'Service suspended', color: 'warning' })
    fetchServices()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  }
}

const unsuspendService = async (id: number) => {
  try {
    await $fetch(`/api/services/${id}/unsuspend`, { method: 'POST' })
    toast.add({ title: 'Service reactivated', color: 'success' })
    fetchServices()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  }
}

const confirmTerminate = (service: any) => {
  serviceToTerminate.value = service
  isTerminateModalOpen.value = true
}

const terminateService = async () => {
  if (!serviceToTerminate.value) return
  terminating.value = true
  try {
    await $fetch(`/api/services/${serviceToTerminate.value.id}/terminate`, { method: 'POST' })
    toast.add({ title: 'Service terminated', color: 'error' })
    isTerminateModalOpen.value = false
    serviceToTerminate.value = null
    fetchServices()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  } finally {
    terminating.value = false
  }
}

const formatDate = (date: string) => format(new Date(date), 'MMM d, yyyy')

const formatBillingCycle = (cycle: string) => {
  const cycles: Record<string, string> = {
    ONETIME: 'One-time',
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
    SEMIANNUALLY: 'Semi-Annual',
    ANNUALLY: 'Annual',
    BIENNIALLY: 'Biennial'
  }
  return cycles[cycle] || cycle
}

const getDueDateColor = (date: string) => {
  const days = differenceInDays(new Date(date), new Date())
  if (days < 0) return 'text-rose-400'
  if (days <= 7) return 'text-amber-400'
  return 'text-slate-400'
}

const getDueDateText = (date: string) => {
  const days = differenceInDays(new Date(date), new Date())
  if (days < 0) return `${Math.abs(days)} days overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  return `Due in ${days} days`
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'status-active'
    case 'PENDING': return 'status-pending'
    case 'SUSPENDED': return 'status-suspended'
    case 'TERMINATED': return 'status-overdue'
    default: return 'status-draft'
  }
}

onMounted(() => {
  fetchServices()
  fetchCategories()
  fetchClients()
})
</script>


