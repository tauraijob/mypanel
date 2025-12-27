<template>
  <div>
    <!-- Page Content with Layout -->
    <NuxtLayout name="super-admin">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-white">Subscription Plans</h1>
        <UButton color="primary" icon="i-lucide-plus" @click="openCreateModal">
          Create Plan
        </UButton>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="plan in plans" :key="plan.id" class="glass-card p-6 relative group">
          <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <UButton size="xs" color="neutral" icon="i-lucide-pencil" @click="openEditModal(plan)" />
            <UButton size="xs" color="error" icon="i-lucide-trash" @click="deletePlan(plan.id)" />
          </div>

          <h3 class="text-xl font-bold text-white mb-2">{{ plan.name }}</h3>
          <div class="text-3xl font-bold text-white mb-4">
            ${{ plan.monthlyPrice }}<span class="text-sm text-slate-400 font-normal">/mo</span>
          </div>
          
          <div class="space-y-2 text-sm text-slate-400">
            <p>Max Clients: {{ plan.maxClients === -1 ? 'Unlimited' : plan.maxClients }}</p>
            <p>Max Users: {{ plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers }}</p>
          </div>
        </div>
      </div>
    </NuxtLayout>

    <!-- Modal - Outside Layout -->
    <div v-if="modalOpen" class="fixed inset-0 z-[9999] overflow-y-auto">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/70" @click="handleClose" />
      
      <!-- Modal Container -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl">
          <!-- Header -->
          <div class="p-5 border-b border-white/10 flex items-center justify-between">
            <h2 class="text-xl font-bold text-white">{{ editingPlanId ? 'Edit Plan' : 'Create Plan' }}</h2>
            <button type="button" class="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white" @click="handleClose">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Form -->
          <form @submit.prevent="handleSubmit">
            <div class="p-5 space-y-4">
              <UFormField label="Plan Name *">
                <UInput v-model="formData.name" placeholder="e.g. Professional" required />
              </UFormField>
              
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Monthly Price ($) *">
                  <UInput v-model="formData.monthlyPrice" type="number" step="0.01" required />
                </UFormField>
                <UFormField label="Yearly Price ($) *">
                  <UInput v-model="formData.yearlyPrice" type="number" step="0.01" required />
                </UFormField>
              </div>
              
              <div class="grid grid-cols-3 gap-4">
                <UFormField label="Max Clients">
                  <UInput v-model.number="formData.maxClients" type="number" />
                  <p class="text-xs text-slate-500 mt-1">-1 = unlimited</p>
                </UFormField>
                <UFormField label="Max Users">
                  <UInput v-model.number="formData.maxUsers" type="number" />
                  <p class="text-xs text-slate-500 mt-1">-1 = unlimited</p>
                </UFormField>
                <UFormField label="Max Services">
                  <UInput v-model.number="formData.maxServices" type="number" />
                  <p class="text-xs text-slate-500 mt-1">-1 = unlimited</p>
                </UFormField>
              </div>
              
              <UFormField label="Features (comma separated)">
                <UTextarea v-model="formData.features" placeholder="Feature 1, Feature 2, Feature 3" rows="2" />
              </UFormField>
            </div>
            
            <!-- Footer -->
            <div class="p-5 border-t border-white/10 flex justify-end gap-3 bg-slate-800/50">
              <button type="button" class="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10" @click="handleClose">
                Cancel
              </button>
              <button type="submit" :disabled="isSubmitting" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 disabled:opacity-50">
                <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {{ editingPlanId ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'super-admin'
})

const toast = useToast()

// Data
const plans = ref<any[]>([])

// Modal state
const modalOpen = ref(false)
const editingPlanId = ref<number | null>(null)
const isSubmitting = ref(false)

// Form data
const formData = reactive({
  name: '',
  monthlyPrice: 0,
  yearlyPrice: 0,
  maxClients: -1,
  maxUsers: -1,
  maxServices: -1,
  features: ''
})

// Functions
const fetchData = async () => {
  try {
    const token = localStorage.getItem('auth_token')
    plans.value = await $fetch('/api/super-admin/plans', {
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (e) {
    console.error('Failed to fetch plans:', e)
  }
}

const resetForm = () => {
  formData.name = ''
  formData.monthlyPrice = 0
  formData.yearlyPrice = 0
  formData.maxClients = -1
  formData.maxUsers = -1
  formData.maxServices = -1
  formData.features = ''
}

const openCreateModal = () => {
  resetForm()
  editingPlanId.value = null
  modalOpen.value = true
}

const openEditModal = (plan: any) => {
  editingPlanId.value = plan.id
  formData.name = plan.name || ''
  formData.monthlyPrice = Number(plan.monthlyPrice) || 0
  formData.yearlyPrice = Number(plan.yearlyPrice) || 0
  formData.maxClients = plan.maxClients ?? -1
  formData.maxUsers = plan.maxUsers ?? -1
  formData.maxServices = plan.maxServices ?? -1
  formData.features = plan.features || ''
  modalOpen.value = true
}

const handleClose = () => {
  modalOpen.value = false
  editingPlanId.value = null
}

const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    const token = localStorage.getItem('auth_token')
    const payload = {
      name: formData.name,
      monthlyPrice: formData.monthlyPrice,
      yearlyPrice: formData.yearlyPrice,
      maxClients: formData.maxClients,
      maxUsers: formData.maxUsers,
      maxServices: formData.maxServices,
      features: formData.features
    }
    
    if (editingPlanId.value) {
      await $fetch(`/api/super-admin/plans/${editingPlanId.value}`, {
        method: 'PUT',
        body: payload,
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.add({ title: 'Plan updated', color: 'success' })
    } else {
      await $fetch('/api/super-admin/plans', {
        method: 'POST',
        body: payload,
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.add({ title: 'Plan created', color: 'success' })
    }
    
    handleClose()
    await fetchData()
  } catch (e: any) {
    toast.add({ title: 'Error', description: e.data?.message || 'Failed to save', color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

const deletePlan = async (id: number) => {
  if (!confirm('Delete this plan?')) return
  
  try {
    const token = localStorage.getItem('auth_token')
    await $fetch(`/api/super-admin/plans/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.add({ title: 'Plan deleted', color: 'success' })
    await fetchData()
  } catch (e: any) {
    toast.add({ title: 'Error', description: e.data?.message || 'Failed to delete', color: 'error' })
  }
}

onMounted(fetchData)
</script>
