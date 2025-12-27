<template>
  <div class="space-y-6 max-w-4xl mx-auto" v-if="invoice">
    <!-- Header Actions -->
    <div class="flex items-center justify-between">
      <UButton 
        to="/portal/invoices" 
        color="gray" 
        variant="ghost" 
        icon="i-lucide-arrow-left"
      >
        Back to Invoices
      </UButton>
      <UButton 
        color="primary" 
        icon="i-lucide-download"
        variant="solid"
      >
        Download PDF
      </UButton>
    </div>

    <!-- Invoice Card -->
    <div class="bg-white text-slate-900 rounded-xl overflow-hidden shadow-2xl">
        <!-- Top Banner -->
        <div class="p-8 border-b border-slate-200 flex justify-between items-start">
            <div>
                <h1 class="text-3xl font-bold text-slate-900">INVOICE</h1>
                <p class="text-slate-500 mt-1">#{{ invoice.invoiceNumber }}</p>
            </div>
            <div class="text-right">
                <div class="inline-block px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide"
                     :class="{
                        'bg-green-100 text-green-700': invoice.status === 'PAID',
                        'bg-yellow-100 text-yellow-700': invoice.status === 'SENT',
                        'bg-red-100 text-red-700': invoice.status === 'OVERDUE'
                     }">
                    {{ invoice.status }}
                </div>
            </div>
        </div>

        <!-- Info Grid -->
        <div class="p-8 grid grid-cols-2 gap-12">
            <div>
                <p class="text-xs font-bold text-slate-400 uppercase mb-2">From</p>
                <p class="font-bold text-lg">{{ invoice.organization.name }}</p>
                <p class="text-slate-600">{{ invoice.organization.email }}</p>
                <!-- Add address here ideally -->
            </div>
            <div class="text-right">
                <p class="text-xs font-bold text-slate-400 uppercase mb-2">Bill To</p>
                <p class="font-bold text-lg">{{ user?.name }}</p>
                <p class="text-slate-600">{{ user?.email }}</p>
            </div>
        </div>
        
        <!-- Dates -->
        <div class="bg-slate-50 px-8 py-4 flex justify-between border-y border-slate-200">
             <div>
                 <span class="text-slate-500 text-sm">Issued:</span>
                 <span class="font-medium ml-2">{{ new Date(invoice.issueDate).toLocaleDateString() }}</span>
             </div>
             <div>
                 <span class="text-slate-500 text-sm">Due Date:</span>
                 <span class="font-medium ml-2">{{ new Date(invoice.dueDate).toLocaleDateString() }}</span>
             </div>
        </div>

        <!-- Items -->
        <div class="p-8">
            <table class="w-full text-left">
                <thead class="text-slate-500 text-xs uppercase border-b border-slate-200">
                    <tr>
                        <th class="pb-3">Description</th>
                        <th class="pb-3 text-right">Qty</th>
                        <th class="pb-3 text-right">Price</th>
                        <th class="pb-3 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <tr v-for="item in invoice.items" :key="item.id">
                        <td class="py-4 font-medium">{{ item.description }}</td>
                         <td class="py-4 text-right text-slate-500">{{ item.quantity }}</td>
                          <td class="py-4 text-right text-slate-500">${{ Number(item.unitPrice).toFixed(2) }}</td>
                           <td class="py-4 text-right font-bold">${{ Number(item.amount).toFixed(2) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Totals -->
        <div class="p-8 bg-slate-50 border-t border-slate-200">
            <div class="flex justify-end gap-12">
                <div class="text-right space-y-2">
                    <p class="text-slate-500">Subtotal</p>
                    <p class="text-slate-500">Tax</p>
                    <p class="text-lg font-bold text-slate-900">Total</p>
                </div>
                 <div class="text-right space-y-2">
                    <p class="font-medium">${{ Number(invoice.subtotal).toFixed(2) }}</p>
                    <p class="font-medium">${{ Number(invoice.taxAmount).toFixed(2) }}</p>
                    <p class="text-lg font-bold text-blue-600">${{ Number(invoice.total).toFixed(2) }}</p>
                </div>
            </div>
            
            <!-- Pay Button (If not paid) -->
            <div v-if="invoice.status !== 'PAID'" class="mt-8 flex justify-end">
                 <div class="text-right">
                     <p class="text-sm text-slate-500 mb-2">Payment Options</p>
                     <div class="p-4 bg-slate-100 rounded text-sm whitespace-pre-line text-right">
                         {{ invoice.organization.settings?.bankDetails || 'Contact admin for payment details.' }}
                     </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'portal',
  middleware: 'portal-auth'
})

const route = useRoute()
const user = ref(null)

// Load user from storage for display name
onMounted(() => {
    try {
        const u = localStorage.getItem('client_user')
        if (u) user.value = JSON.parse(u)
    } catch(e) {}
})

const { data: invoice } = await useClientFetch(`/api/portal/invoices/${route.params.id}`)
</script>
