<template>
  <div>
    <NuxtLayout name="super-admin">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white">Organizations</h1>
          <p class="text-slate-400 mt-1">Manage all registered organizations</p>
        </div>
        <button 
          class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2"
          @click="createNew"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add Organization
        </button>
      </div>

      <!-- Organizations Table -->
      <div class="glass-card overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-white/10">
              <th class="text-left p-4 text-slate-400 font-medium">Organization</th>
              <th class="text-left p-4 text-slate-400 font-medium">Plan</th>
              <th class="text-left p-4 text-slate-400 font-medium">Status</th>
              <th class="text-left p-4 text-slate-400 font-medium">Usage</th>
              <th class="text-left p-4 text-slate-400 font-medium">Created</th>
              <th class="text-left p-4 text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="org in organizations"
              :key="org.id"
              class="border-b border-white/5 hover:bg-white/5"
            >
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <UIcon name="i-lucide-building" class="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p class="font-medium text-white">{{ org.name }}</p>
                    <p class="text-sm text-slate-400">{{ org.email }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <span class="text-white">{{ org.plan?.name || 'No Plan' }}</span>
              </td>
              <td class="p-4">
                <UBadge :color="getStatusColor(org.subscriptionStatus)" variant="subtle">
                  {{ org.subscriptionStatus }}
                </UBadge>
              </td>
              <td class="p-4 text-slate-300">
                <div class="text-sm">
                  <span>{{ org._count?.clients || 0 }} clients</span>
                  <span class="mx-1">•</span>
                  <span>{{ org._count?.users || 0 }} users</span>
                </div>
              </td>
              <td class="p-4 text-slate-300">
                {{ formatDate(org.createdAt) }}
              </td>
              <td class="p-4">
                <div class="flex items-center gap-2">
                  <button class="p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white" @click="editOrg(org.id)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </button>
                  <button class="p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white" @click="viewOrg(org.id)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </NuxtLayout>

    <!-- Modal -->
    <div v-show="showModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/70" @click="closeModal" />
      <div class="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div class="p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-white">{{ currentOrgId ? 'Edit Organization' : 'Add Organization' }}</h2>
              <p class="text-sm text-slate-400">{{ currentOrgId ? 'Update organization details' : 'Create a new organization' }}</p>
            </div>
          </div>
          <button class="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white" @click="closeModal">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <form @submit.prevent="submitForm">
          <div class="p-5 grid md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <h3 class="text-xs font-semibold text-blue-400 uppercase tracking-wider">Basic Information</h3>
              <UFormField label="Organization Name *">
                <UInput v-model="form.name" placeholder="Acme Corp" required />
              </UFormField>
              <UFormField label="Email *">
                <UInput v-model="form.email" type="email" placeholder="admin@acmecorp.com" required />
              </UFormField>
              <UFormField label="Phone">
                <UInput v-model="form.phone" placeholder="+1 234 567 890" />
              </UFormField>
            </div>
            
            <div class="space-y-4">
              <h3 class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Subscription Details</h3>
              <UFormField label="Plan">
                <USelect v-model="form.planId" :items="planOptions" class="w-full" />
              </UFormField>
              <UFormField label="Status">
                <USelect v-model="form.subscriptionStatus" :items="statusOptions" class="w-full" />
              </UFormField>
              <UFormField label="Billing Cycle">
                <USelect v-model="form.billingCycle" :items="billingOptions" class="w-full" />
              </UFormField>
              <UFormField label="Subscription Ends">
                <UInput v-model="form.subscriptionEnd" type="date" />
              </UFormField>
            </div>
          </div>
          
          <div class="p-5 border-t border-white/10 flex justify-end gap-3 bg-slate-800/50 sticky bottom-0">
            <button type="button" class="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10" @click="closeModal">
              Cancel
            </button>
            <button type="submit" :disabled="saving" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 flex items-center gap-2">
              <span v-if="saving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {{ currentOrgId ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

definePageMeta({ layout: false, middleware: 'super-admin' })

const toast = useToast()

// State
const organizations = ref<any[]>([])
const plans = ref<any[]>([])
const showModal = ref(false)
const saving = ref(false)

// CRITICAL: Store the org ID separately - this ensures proper update vs create detection
const currentOrgId = ref<number | null>(null)

// Form state
const form = ref({
  name: '',
  email: '',
  phone: '',
  planId: 'none',
  subscriptionStatus: 'TRIAL',
  billingCycle: 'MONTHLY',
  subscriptionEnd: ''
})

const statusOptions = [
  { label: 'Trial', value: 'TRIAL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Past Due', value: 'PAST_DUE' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Expired', value: 'EXPIRED' }
]

const billingOptions = [
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Yearly', value: 'YEARLY' }
]

const planOptions = computed(() => [
  { label: 'No Plan', value: 'none' },
  ...plans.value.map(p => ({ label: `${p.name} - $${p.monthlyPrice}/mo`, value: p.id.toString() }))
])

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'success'
    case 'TRIAL': return 'info'
    case 'PAST_DUE': return 'warning'
    default: return 'error'
  }
}

const formatDate = (date: string) => format(new Date(date), 'MMM d, yyyy')

const fetchData = async () => {
  const token = localStorage.getItem('auth_token')
  const headers = { Authorization: `Bearer ${token}` }
  
  try {
    const [orgsData, plansData] = await Promise.all([
      $fetch('/api/super-admin/organizations', { headers }),
      $fetch('/api/super-admin/plans', { headers })
    ])
    organizations.value = orgsData as any[]
    plans.value = plansData as any[]
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

// Create new organization
const createNew = () => {
  currentOrgId.value = null
  form.value = {
    name: '',
    email: '',
    phone: '',
    planId: 'none',
    subscriptionStatus: 'TRIAL',
    billingCycle: 'MONTHLY',
    subscriptionEnd: ''
  }
  showModal.value = true
}

// Edit existing organization
const editOrg = (orgId: number) => {
  const org = organizations.value.find(o => o.id === orgId)
  if (!org) return
  
  currentOrgId.value = orgId // CRITICAL: Set the ID for update
  form.value = {
    name: org.name || '',
    email: org.email || '',
    phone: org.phone || '',
    planId: org.planId ? org.planId.toString() : 'none',
    subscriptionStatus: org.subscriptionStatus || 'TRIAL',
    billingCycle: org.billingCycle || 'MONTHLY',
    subscriptionEnd: org.subscriptionEnd ? new Date(org.subscriptionEnd).toISOString().split('T')[0] : ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  currentOrgId.value = null
}

const submitForm = async () => {
  saving.value = true
  const token = localStorage.getItem('auth_token')
  
  const payload = {
    name: form.value.name,
    email: form.value.email,
    phone: form.value.phone || null,
    planId: form.value.planId && form.value.planId !== 'none' ? parseInt(form.value.planId) : null,
    subscriptionStatus: form.value.subscriptionStatus,
    billingCycle: form.value.billingCycle,
    subscriptionEnd: form.value.subscriptionEnd ? new Date(form.value.subscriptionEnd).toISOString() : null
  }
  
  try {
    // Check currentOrgId to determine if this is an update or create
    if (currentOrgId.value) {
      console.log('Updating org:', currentOrgId.value)
      await $fetch(`/api/super-admin/organizations/${currentOrgId.value}`, {
        method: 'PUT',
        body: payload,
        headers: { Authorization: `Bearer ${token}` }
      })
      // Close modal FIRST, then show toast
      showModal.value = false
      currentOrgId.value = null
      await fetchData()
      toast.add({ title: 'Organization updated', color: 'success' })
    } else {
      console.log('Creating new org')
      await $fetch('/api/super-admin/organizations', {
        method: 'POST',
        body: payload,
        headers: { Authorization: `Bearer ${token}` }
      })
      // Close modal FIRST, then show toast
      showModal.value = false
      currentOrgId.value = null
      await fetchData()
      toast.add({ title: 'Organization created', color: 'success' })
    }
  } catch (error: any) {
    console.error('Submit error:', error)
    toast.add({ title: 'Error', description: error.data?.message || 'Something went wrong', color: 'error' })
  } finally {
    saving.value = false
  }
}

const viewOrg = (id: number) => {
  navigateTo(`/super-admin/organizations/${id}`)
}

onMounted(fetchData)
</script>
