<template>
  <div class="relative py-20 px-4 sm:px-6 lg:px-8">
    <!-- Background Effects -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-10 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-10 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h1 class="text-4xl sm:text-5xl font-bold text-white mb-6">Everything You Need to Manage Your Business</h1>
        <p class="text-lg text-slate-400 max-w-2xl mx-auto">
          MyPanel gives you the tools to track clients, manage services, send invoices, and record payments — all in one simple dashboard.
        </p>
      </div>

      <!-- Feature Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="feature in detailedFeatures" :key="feature.title" class="glass-card p-8 group hover:bg-slate-900/50 transition-colors">
          <div class="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transition-transform group-hover:scale-110" :class="feature.bgClass">
            <UIcon :name="feature.icon" class="w-7 h-7" :class="feature.iconClass" />
          </div>
          <h3 class="text-xl font-bold text-white mb-4">{{ feature.title }}</h3>
          <p class="text-slate-400 mb-6">{{ feature.description }}</p>
          <ul class="space-y-3">
            <li v-for="item in feature.subFeatures" :key="item" class="flex items-center gap-3 text-sm text-slate-500">
              <UIcon name="i-lucide-check-circle-2" class="w-4 h-4 text-emerald-500/70 shrink-0" />
              {{ item }}
            </li>
          </ul>
        </div>
      </div>

      <!-- CTA -->
      <div class="mt-24 text-center">
        <NuxtLink to="/signup">
          <UButton color="primary" size="xl" icon="i-lucide-rocket">Start Your Free Trial</UButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'public'
})

const detailedFeatures = [
  {
    title: 'Client Management',
    description: 'Keep all your client information organized. Store contact details, notes, and service history in one place.',
    icon: 'i-lucide-users',
    bgClass: 'bg-blue-500/10',
    iconClass: 'text-blue-400',
    subFeatures: ['Contact details & notes', 'Service history tracking', 'Billing addresses', 'Quick search & filters']
  },
  {
    title: 'Service Tracking',
    description: 'Track recurring services with flexible billing cycles. Know exactly when each service is due for renewal.',
    icon: 'i-lucide-server',
    bgClass: 'bg-emerald-500/10',
    iconClass: 'text-emerald-400',
    subFeatures: ['Monthly, quarterly, yearly cycles', 'Automatic due date tracking', 'Service status management', 'Categorize by service type']
  },
  {
    title: 'Professional Invoicing',
    description: 'Generate beautiful, branded PDF invoices. Send them to clients via email and track payment status.',
    icon: 'i-lucide-file-text',
    bgClass: 'bg-amber-500/10',
    iconClass: 'text-amber-400',
    subFeatures: ['Custom company branding', 'Multiple currencies', 'Tax calculations', 'Partial payments']
  },
  {
    title: 'Quotations',
    description: 'Create professional quotes for new projects. Convert accepted quotes to invoices with one click.',
    icon: 'i-lucide-file-check',
    bgClass: 'bg-purple-500/10',
    iconClass: 'text-purple-400',
    subFeatures: ['One-click quote to invoice', 'Validity period tracking', 'Itemized pricing', 'Quote status monitoring']
  },
  {
    title: 'Payment Recording',
    description: 'Record payments as they come in — bank transfers, cash, mobile money, or any method your clients use.',
    icon: 'i-lucide-credit-card',
    bgClass: 'bg-rose-500/10',
    iconClass: 'text-rose-400',
    subFeatures: ['Multiple payment methods', 'Partial payment support', 'Payment history', 'Outstanding balance tracking']
  },
  {
    title: 'Email Reminders',
    description: 'Set up automatic email reminders for renewals and overdue invoices. Spend less time chasing payments.',
    icon: 'i-lucide-mail',
    bgClass: 'bg-cyan-500/10',
    iconClass: 'text-cyan-400',
    subFeatures: ['Renewal reminders', 'Overdue payment notices', 'Customizable timing', 'Email delivery logs']
  }
]
</script>
