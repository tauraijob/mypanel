<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-white">My Services</h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="service in services" :key="service.id" class="glass-card p-6 border-l-4" 
             :class="service.status === 'ACTIVE' ? 'border-l-emerald-500' : 'border-l-red-500'">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="font-bold text-white text-lg">{{ service.name }}</h3>
                    <p class="text-slate-400 text-sm">{{ service.category?.name }}</p>
                </div>
                <UBadge :color="service.status === 'ACTIVE' ? 'green' : 'red'">
                    {{ service.status }}
                </UBadge>
            </div>
            
            <div class="space-y-2 mb-6">
                <div class="flex justify-between text-sm">
                    <span class="text-slate-500">Price</span>
                    <span class="text-white font-medium">${{ service.price }} / {{ service.billingCycle }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-slate-500">Next Due</span>
                    <span class="text-white font-medium">{{ new Date(service.nextDueDate).toLocaleDateString() }}</span>
                </div>
                <div v-if="service.domain" class="flex justify-between text-sm">
                    <span class="text-slate-500">Domain</span>
                    <span class="text-white font-medium">{{ service.domain }}</span>
                </div>
            </div>

            <div class="border-t border-white/5 pt-4 flex justify-end">
                <!-- Could add 'Manage' button later for specific service modules -->
                <UButton color="gray" variant="ghost" size="sm" disabled>
                    Manage Service
                </UButton>
            </div>
        </div>
        
        <div v-if="services?.length === 0" class="col-span-2 text-center p-12 glass-card">
            <p class="text-slate-500">No active services found.</p>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'portal',
  middleware: 'portal-auth'
})

const { data: services } = await useClientFetch('/api/portal/services')
</script>
