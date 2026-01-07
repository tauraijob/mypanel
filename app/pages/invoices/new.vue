<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" @click="navigateTo('/invoices')" />
      <div>
        <h1 class="text-3xl font-bold text-white">Create Invoice</h1>
        <p class="text-slate-400 mt-1">Create a new invoice for your client</p>
      </div>
    </div>

    <form @submit.prevent="createInvoice" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Client Selection -->
        <div class="glass-card p-6 relative" style="z-index: 20; overflow: visible;">
          <h2 class="text-lg font-semibold text-white mb-4">Client Details</h2>
          
          <UFormField label="Select Client *" name="clientId" class="relative" style="z-index: 30;">
            <div class="relative w-full" data-client-dropdown ref="clientDropdownRef">
              <UIcon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
              <UInput
                v-model="clientSearch"
                placeholder="Search or select a client..."
                class="w-full pl-10"
                :ui="{ base: 'pl-10' }"
                autocomplete="off"
                @focus="onInputFocus"
                @input="onClientSearchInput"
              />
              
              <!-- Client Dropdown -->
              <Teleport to="body">
                <!-- Backdrop to close dropdown -->
                <div 
                  v-if="showClientDropdown"
                  class="fixed inset-0"
                  style="z-index: 9998;"
                  @click="showClientDropdown = false"
                />
                <div 
                  v-if="showClientDropdown && filteredClients.length > 0"
                  class="fixed bg-slate-900 border border-white/20 rounded-xl shadow-2xl max-h-64 overflow-y-auto"
                  :style="dropdownStyle"
                >
                  <button
                    v-for="client in filteredClients"
                    :key="client.id"
                    type="button"
                    class="w-full p-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                    @click="selectClient(client)"
                  >
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {{ getInitials(client.name) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-white font-medium truncate">{{ client.name }}</p>
                      <p class="text-xs text-slate-400 truncate">{{ client.email }}</p>
                      <p v-if="client.company" class="text-xs text-slate-500 truncate">{{ client.company }}</p>
                    </div>
                    <div v-if="client.id.toString() === form.clientId" class="text-emerald-400">
                      <UIcon name="i-lucide-check-circle" class="w-5 h-5" />
                    </div>
                  </button>
                </div>
              </Teleport>

              <!-- No results -->
              <Teleport to="body">
                <div 
                  v-if="showClientDropdown && clientSearch && filteredClients.length === 0"
                  class="fixed bg-slate-900 border border-white/20 rounded-xl shadow-2xl p-4 text-center text-slate-400"
                  :style="dropdownStyle"
                >
                  <UIcon name="i-lucide-search-x" class="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No clients found for "{{ clientSearch }}"</p>
                  <UButton 
                    size="sm" 
                    variant="soft" 
                    color="primary" 
                    class="mt-3"
                    @click="navigateTo('/clients?new=true')"
                  >
                    Create New Client
                  </UButton>
                </div>
              </Teleport>
            </div>
          </UFormField>

          <!-- Selected Client Card -->
          <div v-if="selectedClient" class="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {{ getInitials(selectedClient.name) }}
                </div>
                <div>
                  <p class="font-semibold text-white">{{ selectedClient.name }}</p>
                  <p class="text-sm text-slate-400">{{ selectedClient.email }}</p>
                  <p v-if="selectedClient.company" class="text-sm text-slate-500">{{ selectedClient.company }}</p>
                </div>
              </div>
              <UButton 
                icon="i-lucide-x" 
                variant="ghost" 
                color="neutral" 
                size="xs" 
                @click="clearClient"
              />
            </div>
            
            <!-- Client's active services -->
            <div v-if="clientServices.length > 0" class="mt-4 pt-4 border-t border-white/10">
              <p class="text-xs text-slate-400 mb-2">Active Services (click to add to invoice):</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="service in clientServices"
                  :key="service.id"
                  type="button"
                  class="px-3 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                  @click="addServiceToInvoice(service)"
                >
                  <UIcon name="i-lucide-plus" class="w-3 h-3" />
                  {{ service.name }} - ${{ Number(service.price).toFixed(2) }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Invoice Items -->
        <div class="glass-card p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-white">Invoice Items</h2>
            <UButton size="sm" variant="soft" color="primary" icon="i-lucide-plus" @click="addItem">
              Add Item
            </UButton>
          </div>

          <div class="space-y-4">
            <div
              v-for="(item, index) in form.items"
              :key="index"
              class="p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <div class="grid grid-cols-12 gap-4">
                <div class="col-span-6">
                  <UFormField label="Description" :name="`items.${index}.description`">
                    <UInput v-model="item.description" placeholder="Item description" />
                  </UFormField>
                </div>
                <div class="col-span-2">
                  <UFormField label="Qty" :name="`items.${index}.quantity`">
                    <UInput v-model="item.quantity" type="number" min="1" />
                  </UFormField>
                </div>
                <div class="col-span-3">
                  <UFormField label="Unit Price" :name="`items.${index}.unitPrice`">
                    <UInput v-model="item.unitPrice" type="number" step="0.01" />
                  </UFormField>
                </div>
                <div class="col-span-1 flex items-end">
                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    size="sm"
                    @click="removeItem(index)"
                  />
                </div>
              </div>
              <div class="text-right mt-2">
                <span class="text-slate-400">Amount:</span>
                <span class="text-white font-semibold ml-2">${{ (item.quantity * item.unitPrice).toFixed(2) }}</span>
              </div>
            </div>

            <div v-if="form.items.length === 0" class="text-center py-8 text-slate-400">
              <UIcon name="i-lucide-file-text" class="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No items added yet</p>
              <UButton class="mt-4" variant="soft" color="primary" @click="addItem">
                Add First Item
              </UButton>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="glass-card p-6">
          <h2 class="text-lg font-semibold text-white mb-4">Additional Information</h2>
          
          <UFormField label="Notes" name="notes">
            <UTextarea v-model="form.notes" placeholder="Notes to display on invoice..." rows="3" />
          </UFormField>

          <UFormField label="Payment Terms" name="terms" class="mt-4">
            <UTextarea v-model="form.terms" placeholder="Payment terms..." rows="2" />
          </UFormField>
        </div>
      </div>

      <!-- Summary Sidebar -->
      <div class="space-y-6">
        <!-- Invoice Details -->
        <div class="glass-card p-6">
          <h2 class="text-lg font-semibold text-white mb-4">Invoice Details</h2>

          <UFormField label="Due Date *" name="dueDate">
            <UInput v-model="form.dueDate" type="date" required />
          </UFormField>

          <UFormField label="Tax Amount" name="taxAmount" class="mt-4">
            <UInput v-model="form.taxAmount" type="number" step="0.01" placeholder="0.00" />
          </UFormField>

          <UFormField label="Discount" name="discount" class="mt-4">
            <UInput v-model="form.discount" type="number" step="0.01" placeholder="0.00" />
          </UFormField>
        </div>

        <!-- Totals -->
        <div class="glass-card p-6">
          <h2 class="text-lg font-semibold text-white mb-4">Summary</h2>

          <div class="space-y-3">
            <div class="flex justify-between text-slate-300">
              <span>Subtotal</span>
              <span>${{ subtotal.toFixed(2) }}</span>
            </div>
            <div v-if="form.taxAmount > 0" class="flex justify-between text-slate-300">
              <span>Tax</span>
              <span>${{ Number(form.taxAmount).toFixed(2) }}</span>
            </div>
            <div v-if="form.discount > 0" class="flex justify-between text-slate-300">
              <span>Discount</span>
              <span class="text-emerald-400">-${{ Number(form.discount).toFixed(2) }}</span>
            </div>
            <USeparator />
            <div class="flex justify-between text-lg font-bold text-white">
              <span>Total</span>
              <span>${{ total.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="glass-card p-6 space-y-3">
          <UButton
            type="submit"
            color="primary"
            class="w-full"
            size="lg"
            :loading="saving"
            :disabled="!isValid"
          >
            <UIcon name="i-lucide-save" class="w-5 h-5 mr-2" />
            Save as Draft
          </UButton>

          <UButton
            type="button"
            color="primary"
            variant="soft"
            class="w-full"
            size="lg"
            :loading="sending"
            :disabled="!isValid"
            @click="createAndSend"
          >
            <UIcon name="i-lucide-send" class="w-5 h-5 mr-2" />
            Save & Send
          </UButton>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { addDays } from 'date-fns'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'default'
})

const toast = useToast()
const route = useRoute()

const clients = ref<any[]>([])
const clientServices = ref<any[]>([])
const saving = ref(false)
const sending = ref(false)
const clientSearch = ref('')
const showClientDropdown = ref(false)
const clientDropdownRef = ref<HTMLElement | null>(null)
const dropdownPosition = ref({ top: 0, left: 0, width: 0 })

const dropdownStyle = computed(() => ({
  top: `${dropdownPosition.value.top}px`,
  left: `${dropdownPosition.value.left}px`,
  width: `${dropdownPosition.value.width}px`,
  zIndex: 9999
}))

const form = ref({
  clientId: '',
  dueDate: addDays(new Date(), 14).toISOString().split('T')[0],
  items: [] as Array<{ description: string; quantity: number; unitPrice: number; serviceId?: number }>,
  notes: '',
  terms: '',
  taxAmount: 0,
  discount: 0
})

// Filter clients based on search
const filteredClients = computed(() => {
  if (!clientSearch.value) return clients.value
  const search = clientSearch.value.toLowerCase()
  return clients.value.filter(c => 
    c.name.toLowerCase().includes(search) ||
    c.email.toLowerCase().includes(search) ||
    (c.company && c.company.toLowerCase().includes(search)) ||
    (c.phone && c.phone.includes(search))
  )
})

const selectedClient = computed(() =>
  clients.value.find(c => c.id.toString() === form.value.clientId)
)

const subtotal = computed(() =>
  form.value.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
)

const total = computed(() =>
  subtotal.value + Number(form.value.taxAmount || 0) - Number(form.value.discount || 0)
)

const isValid = computed(() =>
  form.value.clientId && form.value.items.length > 0 && form.value.dueDate
)

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const fetchClients = async () => {
  try {
    const response = await $fetch('/api/clients', { query: { limit: 500 } })
    clients.value = response.clients
  } catch (error) {
    console.error('Error fetching clients:', error)
  }
}

const fetchSettings = async () => {
  try {
    const settings = await $fetch('/api/settings')
    if (settings.paymentTerms) {
      form.value.terms = settings.paymentTerms
    }
    if (settings.invoiceNotes) {
      form.value.notes = settings.invoiceNotes
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
  }
}

const fetchClientServices = async (clientId: string) => {
  try {
    const response = await $fetch('/api/services', { 
      query: { clientId, status: 'ACTIVE', limit: 50 } 
    })
    clientServices.value = response.services || []
  } catch (error) {
    console.error('Error fetching client services:', error)
    clientServices.value = []
  }
}

const updateDropdownPosition = () => {
  if (clientDropdownRef.value) {
    const rect = clientDropdownRef.value.getBoundingClientRect()
    dropdownPosition.value = {
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width
    }
  }
}

const onInputFocus = () => {
  updateDropdownPosition()
  showClientDropdown.value = true
}

const onClientSearchInput = useDebounceFn(() => {
  updateDropdownPosition()
  showClientDropdown.value = true
}, 100)

const selectClient = (client: any) => {
  form.value.clientId = client.id.toString()
  clientSearch.value = client.name
  showClientDropdown.value = false
  fetchClientServices(client.id.toString())
}

const clearClient = () => {
  form.value.clientId = ''
  clientSearch.value = ''
  clientServices.value = []
}

const addServiceToInvoice = (service: any) => {
  // Check if service is already added
  const exists = form.value.items.some(item => 
    item.serviceId === service.id
  )
  if (exists) {
    toast.add({ title: 'Service already added', color: 'warning' })
    return
  }
  
  form.value.items.push({
    description: `${service.name} - ${service.billingCycle} subscription`,
    quantity: 1,
    unitPrice: Number(service.price),
    serviceId: service.id
  })
  toast.add({ title: 'Service added to invoice', color: 'success' })
}

const addItem = () => {
  form.value.items.push({
    description: '',
    quantity: 1,
    unitPrice: 0
  })
}

const removeItem = (index: number) => {
  form.value.items.splice(index, 1)
}

const createInvoice = async (sendEmail = false) => {
  if (!isValid.value) return

  const loadingRef = sendEmail ? sending : saving
  loadingRef.value = true

  try {
    await $fetch('/api/invoices', {
      method: 'POST',
      body: {
        clientId: parseInt(form.value.clientId),
        dueDate: form.value.dueDate,
        items: form.value.items,
        notes: form.value.notes,
        terms: form.value.terms,
        taxAmount: parseFloat(form.value.taxAmount.toString()) || 0,
        discount: parseFloat(form.value.discount.toString()) || 0,
        sendEmail
      }
    })

    toast.add({
      title: sendEmail ? 'Invoice created and sent!' : 'Invoice created!',
      color: 'success'
    })

    navigateTo('/invoices')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to create invoice',
      color: 'error'
    })
  } finally {
    loadingRef.value = false
  }
}

const createAndSend = () => createInvoice(true)

// Handle click outside to close dropdown
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('[data-client-dropdown]')) {
    showClientDropdown.value = false
  }
}

onMounted(async () => {
  await fetchClients()
  fetchSettings()
  
  // Pre-select client if passed via query param
  const clientId = route.query.clientId as string
  if (clientId) {
    const client = clients.value.find(c => c.id.toString() === clientId)
    if (client) {
      selectClient(client)
    }
  }
  
  // Pre-add service if passed via query param
  const serviceId = route.query.serviceId as string
  if (serviceId && clientId) {
    try {
      const service = await $fetch(`/api/services/${serviceId}`)
      if (service) {
        addServiceToInvoice(service)
      }
    } catch (error) {
      console.error('Error fetching service:', error)
    }
  }
  
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
