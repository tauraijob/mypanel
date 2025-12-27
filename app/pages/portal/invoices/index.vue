<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-white">My Invoices</h1>
    </div>

    <div class="glass-card overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-slate-800/50 text-slate-400 text-sm uppercase">
          <tr>
            <th class="p-4">Number</th>
            <th class="p-4">Date</th>
            <th class="p-4">Amount</th>
            <th class="p-4">Status</th>
            <th class="p-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr v-for="inv in invoices" :key="inv.id" class="hover:bg-white/5 transition-colors">
            <td class="p-4 text-white font-medium">{{ inv.invoiceNumber }}</td>
            <td class="p-4 text-slate-400">{{ new Date(inv.issueDate).toLocaleDateString() }}</td>
            <td class="p-4 text-white">{{ '$' + Number(inv.total).toFixed(2) }}</td>
            <td class="p-4">
              <span 
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-green-500/10 text-green-400': inv.status === 'PAID',
                  'bg-yellow-500/10 text-yellow-400': inv.status === 'SENT' || inv.status === 'PARTIALLY_PAID',
                  'bg-red-500/10 text-red-400': inv.status === 'OVERDUE',
                  'bg-slate-500/10 text-slate-400': inv.status === 'DRAFT'
                }"
              >
                {{ inv.status.replace('_', ' ') }}
              </span>
            </td>
            <td class="p-4 text-right">
              <UButton 
                :to="`/portal/invoices/${inv.id}`"
                size="xs"
                color="blue"
                variant="soft"
                icon="i-lucide-eye"
              >
                View
              </UButton>
            </td>
          </tr>
          <tr v-if="invoices?.length === 0">
              <td colspan="5" class="p-8 text-center text-slate-500">
                  No invoices found.
              </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'portal',
  middleware: 'portal-auth'
})

const { data: invoices } = await useClientFetch('/api/portal/invoices')
</script>
