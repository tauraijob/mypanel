<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-white">Clients</h1>
        <p class="text-slate-400 mt-1 text-sm sm:text-base">Manage your client database</p>
      </div>
      <UButton v-if="hasPermission('clients.create')" color="primary" icon="i-lucide-user-plus" @click="openModal()" class="w-full sm:w-auto">
        Add Client
      </UButton>
    </div>

    <!-- Filters -->
    <div class="glass-card p-4">
      <div class="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
        <div class="relative w-full sm:w-64">
          <UIcon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
          <UInput
            v-model="search"
            placeholder="Search clients..."
            class="w-full pl-10"
            :ui="{ base: 'pl-10' }"
            @input="debouncedFetch"
          />
        </div>
        <USelect
          v-model="statusFilter"
          :items="statusOptions"
          placeholder="All Statuses"
          class="w-full sm:w-40"
          @change="fetchClients"
        />
      </div>
    </div>

    <!-- Clients Table -->
    <div class="glass-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[700px]">
          <thead>
            <tr class="border-b border-white/10">
              <th class="text-left p-4 text-slate-400 font-medium">Client</th>
              <th class="text-left p-4 text-slate-400 font-medium hidden sm:table-cell">Contact</th>
              <th class="text-left p-4 text-slate-400 font-medium">Services</th>
              <th class="text-left p-4 text-slate-400 font-medium hidden sm:table-cell">Invoices</th>
              <th class="text-left p-4 text-slate-400 font-medium">Status</th>
              <th class="text-right p-4 text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
        <tbody>
          <tr
            v-for="client in clients"
            :key="client.id"
            class="border-b border-white/5 hover:bg-white/5 transition-colors"
          >
            <td class="p-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                  {{ client.name.charAt(0) }}
                </div>
                <div>
                  <p class="font-medium text-white">{{ client.name }}</p>
                  <p class="text-sm text-slate-400">{{ client.company || 'Individual' }}</p>
                </div>
              </div>
            </td>
            <td class="p-4">
              <p class="text-white">{{ client.email }}</p>
              <p class="text-sm text-slate-400">{{ client.phone || '-' }}</p>
            </td>
            <td class="p-4">
              <UBadge color="info" variant="subtle">
                {{ client._count?.services || 0 }} services
              </UBadge>
            </td>
            <td class="p-4">
              <UBadge color="neutral" variant="subtle">
                {{ client._count?.invoices || 0 }} invoices
              </UBadge>
            </td>
            <td class="p-4">
              <span
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="getStatusClass(client.status)"
              >
                {{ client.status }}
              </span>
            </td>
            <td class="p-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <UButton
                  icon="i-lucide-eye"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  @click="viewClient(client.id)"
                />
                <UButton
                  icon="i-lucide-pencil"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  @click="openModal(client)"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  variant="ghost"
                  color="error"
                  size="sm"
                  @click="confirmDelete(client)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="!clients || clients.length === 0">
            <td colspan="6" class="p-8 text-center text-slate-400">
              <UIcon name="i-lucide-users" class="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No clients found</p>
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
          @update:model-value="fetchClients"
        />
      </div>
    </div>

    <!-- Add/Edit Modal - Landscape -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="isModalOpen = false" />
        
        <!-- Modal Content -->
        <div class="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden">
          <!-- Header -->
          <div class="bg-slate-800/50 border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <UIcon :name="editingClient ? 'i-lucide-user-pen' : 'i-lucide-user-plus'" class="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">{{ editingClient ? 'Edit Client' : 'Add New Client' }}</h2>
                <p class="text-slate-400 text-xs">{{ editingClient ? 'Update client information' : 'Fill in the details below' }}</p>
              </div>
            </div>
            <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="isModalOpen = false" />
          </div>

          <!-- Form Content - Scrollable -->
          <form @submit.prevent="saveClient" class="overflow-y-auto max-h-[calc(85vh-130px)]">
            <div class="p-6">
              <!-- Three Column Layout -->
              <div class="grid grid-cols-3 gap-5">
                <!-- Column 1 - Basic Info -->
                <div class="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 class="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <UIcon name="i-lucide-user" class="w-3.5 h-3.5" />
                    Basic Info
                  </h3>
                  <div class="space-y-3">
                    <UFormField label="Full Name *" name="name">
                      <UInput v-model="form.name" placeholder="John Smith" size="sm" required />
                    </UFormField>
                    <UFormField label="Email *" name="email">
                      <UInput v-model="form.email" type="email" placeholder="john@example.com" size="sm" required />
                    </UFormField>
                    <UFormField label="Phone" name="phone">
                      <UInput v-model="form.phone" placeholder="+1 234 567 890" size="sm" />
                    </UFormField>
                    <UFormField label="Company" name="company">
                      <UInput v-model="form.company" placeholder="Acme Inc." size="sm" />
                    </UFormField>
                  </div>
                </div>

                <!-- Column 2 - Address -->
                <div class="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 class="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5" />
                    Billing Address
                  </h3>
                  <div class="space-y-3">
                    <UFormField label="Street Address" name="billingAddress">
                      <UInput v-model="form.billingAddress" placeholder="123 Main Street" size="sm" />
                    </UFormField>
                    <div class="grid grid-cols-2 gap-2">
                      <UFormField label="City" name="billingCity">
                        <UInput v-model="form.billingCity" placeholder="New York" size="sm" />
                      </UFormField>
                      <UFormField label="State" name="billingState">
                        <UInput v-model="form.billingState" placeholder="NY" size="sm" />
                      </UFormField>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                      <UFormField label="ZIP Code" name="billingZip">
                        <UInput v-model="form.billingZip" placeholder="10001" size="sm" />
                      </UFormField>
                      <UFormField label="Country" name="billingCountry">
                        <UInput v-model="form.billingCountry" placeholder="USA" size="sm" />
                      </UFormField>
                    </div>
                  </div>
                </div>

                <!-- Column 3 - Notes -->
                <div class="p-4 rounded-xl bg-white/5 border border-white/10">
                  <h3 class="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <UIcon name="i-lucide-sticky-note" class="w-3.5 h-3.5" />
                    Additional Notes
                  </h3>
                  <UFormField name="notes">
                    <UTextarea v-model="form.notes" placeholder="Any additional information about this client..." rows="8" size="sm" class="h-full" />
                  </UFormField>
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="bg-slate-800/30 border-t border-white/10 px-6 py-4 flex justify-end gap-3">
              <UButton variant="ghost" color="neutral" @click="isModalOpen = false">
                Cancel
              </UButton>
              <UButton type="submit" color="primary" :loading="saving" icon="i-lucide-check">
                {{ editingClient ? 'Update Client' : 'Create Client' }}
              </UButton>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation -->
    <UModal v-model:open="isDeleteModalOpen">
      <template #content>
        <div class="p-8 text-center w-[450px] max-w-[90vw]">
          <div class="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-lucide-alert-triangle" class="w-10 h-10 text-rose-400" />
          </div>
          <h3 class="text-2xl font-bold text-white mb-3">Delete Client?</h3>
          <p class="text-slate-400 mb-2">
            You're about to delete <span class="text-white font-semibold">{{ clientToDelete?.name }}</span>
          </p>
          <p class="text-sm text-slate-500 mb-8">
            This will permanently remove all their services, invoices, and payment records. This action cannot be undone.
          </p>
          <div class="flex justify-center gap-4">
            <UButton variant="ghost" color="neutral" size="lg" @click="isDeleteModalOpen = false">
              Cancel
            </UButton>
            <UButton color="error" size="lg" :loading="deleting" icon="i-lucide-trash-2" @click="deleteClient">
              Delete Client
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const toast = useToast()
const { hasPermission } = useAuth()

const clients = ref<any[]>([])
const search = ref('')
const statusFilter = ref('all')
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const editingClient = ref<any>(null)
const clientToDelete = ref<any>(null)
const saving = ref(false)
const deleting = ref(false)

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const statusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Suspended', value: 'SUSPENDED' }
]

const form = ref({
  name: '',
  email: '',
  phone: '',
  company: '',
  billingAddress: '',
  billingCity: '',
  billingState: '',
  billingZip: '',
  billingCountry: '',
  notes: ''
})

const fetchClients = async () => {
  try {
    const response = await $fetch('/api/clients', {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: search.value,
        status: statusFilter.value === 'all' ? '' : statusFilter.value
      }
    })
    clients.value = response.clients
    pagination.value = { ...pagination.value, ...response.pagination }
  } catch (error) {
    console.error('Error fetching clients:', error)
  }
}

const debouncedFetch = useDebounceFn(fetchClients, 300)

const openModal = (client?: any) => {
  if (client) {
    editingClient.value = client
    form.value = { ...client }
  } else {
    editingClient.value = null
    form.value = {
      name: '',
      email: '',
      phone: '',
      company: '',
      billingAddress: '',
      billingCity: '',
      billingState: '',
      billingZip: '',
      billingCountry: '',
      notes: ''
    }
  }
  isModalOpen.value = true
}

const saveClient = async () => {
  saving.value = true
  try {
    if (editingClient.value) {
      await $fetch(`/api/clients/${editingClient.value.id}`, {
        method: 'PUT',
        body: form.value
      })
      toast.add({ title: 'Client updated successfully', color: 'success' })
    } else {
      await $fetch('/api/clients', {
        method: 'POST',
        body: form.value
      })
      toast.add({ title: 'Client created successfully', color: 'success' })
    }
    isModalOpen.value = false
    fetchClients()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to save client',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (client: any) => {
  clientToDelete.value = client
  isDeleteModalOpen.value = true
}

const deleteClient = async () => {
  if (!clientToDelete.value) return
  
  deleting.value = true
  try {
    await $fetch(`/api/clients/${clientToDelete.value.id}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Client deleted successfully', color: 'success' })
    isDeleteModalOpen.value = false
    fetchClients()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to delete client',
      color: 'error'
    })
  } finally {
    deleting.value = false
  }
}

const viewClient = (id: number) => {
  navigateTo(`/clients/${id}`)
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'status-active'
    case 'INACTIVE': return 'status-draft'
    case 'SUSPENDED': return 'status-suspended'
    default: return 'status-draft'
  }
}

onMounted(fetchClients)
</script>


