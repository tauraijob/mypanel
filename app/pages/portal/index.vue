<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-white">Dashboard</h1>
      <p class="text-slate-400 text-sm">Overview of your account</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="glass-card p-6">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-red-500/10 rounded-xl">
            <UIcon name="i-lucide-alert-circle" class="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p class="text-slate-400 text-sm">Unpaid Invoices</p>
            <p class="text-2xl font-bold text-white">{{ stats?.unpaidInvoices || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="glass-card p-6">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-emerald-500/10 rounded-xl">
            <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p class="text-slate-400 text-sm">Active Services</p>
            <p class="text-2xl font-bold text-white">{{ stats?.activeServices || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="glass-card p-6">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-500/10 rounded-xl">
            <UIcon name="i-lucide-calendar" class="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p class="text-slate-400 text-sm">Next Due Date</p>
            <p class="text-xl font-bold text-white">
              {{ stats?.nextDueDate ? new Date(stats.nextDueDate).toLocaleDateString() : 'N/A' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="glass-card p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-white">Quick Actions</h3>
            </div>
            <div class="space-y-3">
                <NuxtLink to="/portal/invoices" class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                    <div class="flex items-center gap-3">
                        <UIcon name="i-lucide-file-text" class="w-5 h-5 text-blue-400" />
                        <span class="text-slate-200">View Invoices</span>
                    </div>
                    <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-slate-500" />
                </NuxtLink>
                <NuxtLink to="/portal/services" class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                    <div class="flex items-center gap-3">
                        <UIcon name="i-lucide-server" class="w-5 h-5 text-purple-400" />
                        <span class="text-slate-200">My Services</span>
                    </div>
                    <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-slate-500" />
                </NuxtLink>
            </div>
        </div>
        
        <div class="glass-card p-6 flex flex-col justify-center items-center text-center">
             <div class="mb-3">
                 <UIcon name="i-lucide-headset" class="w-12 h-12 text-slate-600" />
             </div>
             <h3 class="text-lg font-semibold text-white mb-1">Need Help?</h3>
             <p class="text-slate-400 text-sm mb-4">Contact support if you have any issues with your billing or services.</p>
             <UButton color="gray" variant="solid">Contact Support</UButton>
        </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'portal',
  middleware: 'portal-auth'
})

const { data: stats } = await useClientFetch('/api/portal/stats')
</script>
