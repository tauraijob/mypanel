<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" @click="navigateTo('/clients')" />
      <div class="flex-1">
        <h1 class="text-3xl font-bold text-white">{{ client?.name }}</h1>
        <p class="text-slate-400 mt-1">{{ client?.company || 'Individual Client' }}</p>
      </div>
      <span
        class="px-4 py-2 rounded-full text-sm font-medium"
        :class="getStatusClass(client?.status)"
      >
        {{ client?.status }}
      </span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Client Details -->
      <div class="glass-card p-6">
        <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-user" class="w-5 h-5 text-blue-400" />
          Contact Information
        </h2>
        
        <div class="space-y-4">
          <div>
            <p class="text-sm text-slate-400">Email</p>
            <p class="text-white">{{ client?.email }}</p>
          </div>
          <div>
            <p class="text-sm text-slate-400">Phone</p>
            <p class="text-white">{{ client?.phone || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-slate-400">Company</p>
            <p class="text-white">{{ client?.company || '-' }}</p>
          </div>
        </div>

        <USeparator class="my-4" />

        <h3 class="text-sm font-medium text-slate-400 mb-3">Billing Address</h3>
        <p class="text-white whitespace-pre-line">
          {{ formatAddress(client) || 'No address provided' }}
        </p>

        <div class="mt-6 flex gap-2">
          <UButton variant="soft" color="primary" icon="i-lucide-pencil" size="sm">
            Edit
          </UButton>
          <UButton variant="soft" color="error" icon="i-lucide-trash-2" size="sm">
            Delete
          </UButton>
        </div>
      </div>

      <!-- Portal Access -->
      <div class="glass-card p-6">
          <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-lock" class="w-5 h-5 text-purple-400" />
              Portal Access
          </h2>
          <div class="space-y-4">
              <div v-if="client?.lastLogin">
                  <p class="text-sm text-slate-400">Last Login</p>
                  <p class="text-white">{{ new Date(client.lastLogin).toLocaleString() }}</p>
              </div>
              <div v-else>
                  <p class="text-sm text-slate-400">Status</p>
                  <p class="text-slate-500 italic">Never logged in</p>
              </div>
              
              <div class="pt-2">
                  <UButton variant="outline" color="white" block icon="i-lucide-key" @click="isPasswordModalOpen = true">
                      {{ client?.password ? 'Reset Password' : 'Set Password' }}
                  </UButton>
                  <p class="text-xs text-slate-500 mt-2 text-center">
                      Allows client to log in at /portal
                  </p>
              </div>
          </div>
      </div>

      <!-- Services -->
      <div class="lg:col-span-1 glass-card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white flex items-center gap-2">
            <UIcon name="i-lucide-server" class="w-5 h-5 text-emerald-400" />
            Services
          </h2>
          <UButton size="sm" color="primary" icon="i-lucide-plus">
            Add Service
          </UButton>
        </div>

        <div class="space-y-3">
          <div
            v-for="service in client?.services"
            :key="service.id"
            class="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div class="flex items-center justify-between">
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
              <div class="text-right">
                <p class="font-semibold text-white">${{ Number(service.price).toFixed(2) }}</p>
                <p class="text-sm text-slate-400">{{ service.billingCycle }}</p>
              </div>
              <span
                class="px-3 py-1 rounded-full text-xs font-medium ml-4"
                :class="getServiceStatusClass(service.status)"
              >
                {{ service.status }}
              </span>
            </div>
          </div>

          <div v-if="!client?.services?.length" class="text-center py-8 text-slate-400">
            <UIcon name="i-lucide-server" class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No services yet</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Invoices -->
    <div class="glass-card p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-white flex items-center gap-2">
          <UIcon name="i-lucide-file-text" class="w-5 h-5 text-amber-400" />
          Recent Invoices
        </h2>
        <UButton size="sm" color="primary" icon="i-lucide-plus">
          Create Invoice
        </UButton>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-white/10">
            <th class="text-left p-3 text-slate-400 font-medium">Invoice</th>
            <th class="text-left p-3 text-slate-400 font-medium">Date</th>
            <th class="text-left p-3 text-slate-400 font-medium">Due Date</th>
            <th class="text-left p-3 text-slate-400 font-medium">Amount</th>
            <th class="text-left p-3 text-slate-400 font-medium">Status</th>
            <th class="text-right p-3 text-slate-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="invoice in client?.invoices"
            :key="invoice.id"
            class="border-b border-white/5 hover:bg-white/5"
          >
            <td class="p-3 text-white font-medium">{{ invoice.invoiceNumber }}</td>
            <td class="p-3 text-slate-300">{{ formatDate(invoice.issueDate) }}</td>
            <td class="p-3 text-slate-300">{{ formatDate(invoice.dueDate) }}</td>
            <td class="p-3 text-white font-semibold">${{ Number(invoice.total).toFixed(2) }}</td>
            <td class="p-3">
              <span
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="getInvoiceStatusClass(invoice.status)"
              >
                {{ invoice.status }}
              </span>
            </td>
            <td class="p-3 text-right">
              <UButton icon="i-lucide-eye" variant="ghost" color="neutral" size="sm" />
            </td>
          </tr>
          <tr v-if="!client?.invoices?.length">
            <td colspan="6" class="p-8 text-center text-slate-400">
              No invoices yet
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Password Modal -->
    <UModal v-model="isPasswordModalOpen">
        <div class="p-6 bg-slate-900">
            <h3 class="text-lg font-bold text-white mb-4">Set Client Password</h3>
            <form @submit.prevent="updatePassword" class="space-y-4">
                <div class="form-group">
                    <label class="form-label">New Password</label>
                    <input v-model="newPassword" type="password" class="form-input" required minlength="6" />
                </div>
                <div class="flex justify-end gap-2 mt-6">
                    <UButton color="gray" variant="ghost" @click="isPasswordModalOpen = false">Cancel</UButton>
                    <UButton type="submit" color="primary" :loading="updatingPassword">Save Password</UButton>
                </div>
            </form>
        </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const client = ref<any>(null)
const isPasswordModalOpen = ref(false)
const newPassword = ref('')
const updatingPassword = ref(false)
const toast = useToast()

const fetchClient = async () => {
  try {
    client.value = await $fetch(`/api/clients/${route.params.id}`)
  } catch (error) {
    console.error('Error fetching client:', error)
    navigateTo('/clients')
  }
}

const updatePassword = async () => {
    updatingPassword.value = true
    try {
        await $fetch(`/api/clients/${route.params.id}/access`, {
            method: 'PUT',
            body: { password: newPassword.value }
        })
        toast.add({ title: 'Success', description: 'Client password updated' })
        isPasswordModalOpen.value = false
        newPassword.value = ''
        fetchClient() // Refresh
    } catch (e: any) {
        toast.add({ title: 'Error', description: e.data?.message || 'Failed to update password', color: 'red' })
    } finally {
        updatingPassword.value = false
    }
}

const formatDate = (date: string) => {
  return format(new Date(date), 'MMM d, yyyy')
}

const formatAddress = (client: any) => {
  if (!client) return ''
  const parts = [
    client.billingAddress,
    [client.billingCity, client.billingState].filter(Boolean).join(', '),
    client.billingZip,
    client.billingCountry
  ].filter(Boolean)
  return parts.join('\n')
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'status-active'
    case 'INACTIVE': return 'status-draft'
    case 'SUSPENDED': return 'status-suspended'
    default: return 'status-draft'
  }
}

const getServiceStatusClass = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'status-active'
    case 'PENDING': return 'status-pending'
    case 'SUSPENDED': return 'status-suspended'
    case 'TERMINATED': return 'status-overdue'
    default: return 'status-draft'
  }
}

const getInvoiceStatusClass = (status: string) => {
  switch (status) {
    case 'PAID': return 'status-paid'
    case 'SENT': return 'status-pending'
    case 'OVERDUE': return 'status-overdue'
    case 'DRAFT': return 'status-draft'
    default: return 'status-draft'
  }
}

onMounted(fetchClient)
</script>


