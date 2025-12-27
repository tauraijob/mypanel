<template>
  <div class="relative py-20 px-4 sm:px-6 lg:px-8">
    <!-- Background Effects -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h1 class="text-4xl sm:text-5xl font-bold text-white mb-6">Simple, Transparent Pricing</h1>
        <p class="text-lg text-slate-400 max-w-2xl mx-auto mb-4">
          Choose the plan that fits your business. All plans include a <strong class="text-white">14-day free trial</strong> with full access — no credit card required.
        </p>
        <p class="text-slate-500">After your trial, you'll be billed based on your selected plan. Cancel anytime.</p>
      </div>

      <!-- Billing Toggle -->
      <div class="flex items-center justify-center gap-4 mb-12">
        <span :class="billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'">Monthly</span>
        <button 
          @click="billingCycle = billingCycle === 'monthly' ? 'yearly' : 'monthly'"
          class="w-14 h-7 rounded-full bg-slate-800 border border-white/10 p-1 transition-colors relative"
        >
          <div 
            class="w-5 h-5 rounded-full bg-blue-500 transition-transform"
            :class="billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'"
          ></div>
        </button>
        <span :class="billingCycle === 'yearly' ? 'text-white' : 'text-slate-400'">
          Yearly 
          <UBadge color="emerald" size="sm" class="ml-1">Save 20%</UBadge>
        </span>
      </div>

      <!-- Pricing Cards -->
      <div v-if="pending" class="grid md:grid-cols-3 gap-8">
        <div v-for="i in 3" :key="i" class="glass-card p-8 animate-pulse bg-white/5 h-[600px]"></div>
      </div>
      
      <div v-else-if="plans && plans.length" class="grid md:grid-cols-3 gap-8">
        <div 
          v-for="plan in plans" 
          :key="plan.id"
          class="glass-card p-8 flex flex-col relative group transition-all duration-300 hover:-translate-y-2 hover:bg-slate-900/40"
          :class="{ 'border-blue-500/50 ring-1 ring-blue-500/50': plan.name === 'Professional' }"
        >
          <div v-if="plan.name === 'Professional'" class="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-500 text-white text-xs font-bold uppercase tracking-wider">
            Most Popular
          </div>

          <h3 class="text-xl font-bold text-white mb-2">{{ plan.name }}</h3>
          <p class="text-slate-400 text-sm mb-6 min-h-[40px]">{{ plan.description || 'Perfect for growing businesses.' }}</p>
          
          <div class="mb-6">
            <span class="text-4xl font-bold text-white">${{ billingCycle === 'monthly' ? plan.monthlyPrice : (plan.yearlyPrice / 12).toFixed(2) }}</span>
            <span class="text-slate-400 ml-2">/month</span>
            <p v-if="billingCycle === 'yearly'" class="text-xs text-blue-400 mt-2">Billed ${{ plan.yearlyPrice }} annually</p>
            <p v-else class="text-xs text-slate-500 mt-2">Billed monthly</p>
          </div>

          <NuxtLink :to="`/signup?plan=${plan.id}`" class="mb-8">
            <UButton 
              block 
              :color="plan.name === 'Professional' ? 'primary' : 'neutral'"
              variant="solid" 
              size="lg"
            >
              Start Free Trial
            </UButton>
          </NuxtLink>

          <div class="space-y-4 flex-1">
            <p class="text-sm font-semibold text-white">What's included:</p>
            <div class="space-y-3">
              <div class="flex items-center gap-3 text-sm text-slate-400">
                <UIcon name="i-lucide-check" class="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{{ plan.maxClients === -1 ? 'Unlimited' : plan.maxClients }} Clients</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-slate-400">
                <UIcon name="i-lucide-check" class="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{{ plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers }} Team Members</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-slate-400">
                <UIcon name="i-lucide-check" class="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{{ plan.maxServices === -1 ? 'Unlimited' : plan.maxServices }} Services</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-slate-400">
                <UIcon name="i-lucide-check" class="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Unlimited Invoices</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-slate-400">
                <UIcon name="i-lucide-check" class="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Payment Recording</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-slate-400">
                <UIcon name="i-lucide-check" class="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Automated Email Reminders</span>
              </div>
              <div v-for="feature in (plan.features || '').split(',')" :key="feature" class="flex items-center gap-3 text-sm text-slate-400">
                <template v-if="feature.trim()">
                  <UIcon name="i-lucide-check" class="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{{ feature.trim() }}</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-slate-400">No plans available at the moment. Please check back later.</p>
      </div>

      <!-- FAQ / Info -->
      <div class="mt-20 max-w-3xl mx-auto">
        <h3 class="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h3>
        <div class="space-y-6">
          <div class="glass-card p-6">
            <h4 class="font-semibold text-white mb-2">What happens after the 14-day trial?</h4>
            <p class="text-slate-400 text-sm">After your trial ends, you'll be prompted to choose a payment method. Your account remains active, and you can continue using MyPanel once payment is set up. If you don't subscribe, your account will be suspended but your data will be kept for 30 days.</p>
          </div>
          <div class="glass-card p-6">
            <h4 class="font-semibold text-white mb-2">Can I upgrade or downgrade my plan?</h4>
            <p class="text-slate-400 text-sm">Yes! You can change your plan at any time from your billing settings. Upgrades take effect immediately, and downgrades apply at the end of your current billing cycle.</p>
          </div>
          <div class="glass-card p-6">
            <h4 class="font-semibold text-white mb-2">Is my data secure?</h4>
            <p class="text-slate-400 text-sm">Absolutely. We use industry-standard encryption and security practices to protect your data. Your client information is kept private and never shared with third parties.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'public'
})

const billingCycle = ref<'monthly' | 'yearly'>('monthly')

const { data: plans, pending } = await useFetch('/api/public/plans')
</script>
