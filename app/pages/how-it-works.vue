<template>
  <div class="relative py-20 px-4 sm:px-6 lg:px-8">
    <!-- Background Effects -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h1 class="text-4xl sm:text-5xl font-bold text-white mb-6">How MyPanel Works</h1>
        <p class="text-lg text-slate-400 max-w-2xl mx-auto">
          Getting started is easy. Here's how you can streamline your client and invoicing workflow.
        </p>
      </div>

      <!-- Steps -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div class="relative group">
          <div class="mb-6 flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/20">
              01
            </div>
            <div class="h-px flex-1 bg-white/10 hidden lg:block"></div>
          </div>
          <h3 class="text-xl font-bold text-white mb-3">Sign Up & Choose a Plan</h3>
          <p class="text-slate-400">
            Create your account and pick a subscription plan. You get a full 14-day free trial to explore all features — no credit card required.
          </p>
          <div class="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 group-hover:border-blue-500/30 transition-colors">
            <UIcon name="i-lucide-user-plus" class="w-8 h-8 text-blue-400 opacity-50" />
          </div>
        </div>

        <div class="relative group">
          <div class="mb-6 flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-emerald-500/20">
              02
            </div>
            <div class="h-px flex-1 bg-white/10 hidden lg:block"></div>
          </div>
          <h3 class="text-xl font-bold text-white mb-3">Configure Your Business</h3>
          <p class="text-slate-400">
            Set up your company details, add your logo, and configure your invoice settings. Make it look professional.
          </p>
          <div class="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 group-hover:border-emerald-500/30 transition-colors">
            <UIcon name="i-lucide-settings-2" class="w-8 h-8 text-emerald-400 opacity-50" />
          </div>
        </div>

        <div class="relative group">
          <div class="mb-6 flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-amber-500/20">
              03
            </div>
            <div class="h-px flex-1 bg-white/10 hidden lg:block"></div>
          </div>
          <h3 class="text-xl font-bold text-white mb-3">Add Clients & Services</h3>
          <p class="text-slate-400">
            Add your clients and assign their services. Set billing cycles and next due dates so you never forget a renewal.
          </p>
          <div class="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 group-hover:border-amber-500/30 transition-colors">
            <UIcon name="i-lucide-users-2" class="w-8 h-8 text-amber-400 opacity-50" />
          </div>
        </div>

        <div class="relative group">
          <div class="mb-6 flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/20">
              04
            </div>
          </div>
          <h3 class="text-xl font-bold text-white mb-3">Invoice & Record Payments</h3>
          <p class="text-slate-400">
            Generate invoices, send them to clients, and record payments as they come in. Track who's paid and who hasn't.
          </p>
          <div class="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 group-hover:border-purple-500/30 transition-colors">
            <UIcon name="i-lucide-receipt" class="w-8 h-8 text-purple-400 opacity-50" />
          </div>
        </div>
      </div>

      <!-- Clarification Section -->
      <div class="mt-32 glass-card p-12 relative overflow-hidden">
        <div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div class="relative z-10">
          <h2 class="text-3xl font-bold text-white mb-6 text-center">Note: This is a Management Tool</h2>
          <div class="max-w-3xl mx-auto space-y-6 text-slate-400">
            <p>
              MyPanel is designed to help you <strong class="text-white">track and manage</strong> your clients, services, and invoices. It's like a smart notebook for your business.
            </p>
            <div class="grid md:grid-cols-2 gap-6">
              <div class="p-6 rounded-xl bg-white/5">
                <h4 class="font-semibold text-white mb-3 flex items-center gap-2">
                  <UIcon name="i-lucide-check" class="w-5 h-5 text-emerald-500" /> What MyPanel Does
                </h4>
                <ul class="space-y-2 text-sm">
                  <li>• Track client contact information</li>
                  <li>• Manage recurring services & due dates</li>
                  <li>• Generate & send professional invoices</li>
                  <li>• Record payments you receive</li>
                  <li>• Send automated email reminders</li>
                </ul>
              </div>
              <div class="p-6 rounded-xl bg-white/5">
                <h4 class="font-semibold text-white mb-3 flex items-center gap-2">
                  <UIcon name="i-lucide-x" class="w-5 h-5 text-rose-500" /> What It Doesn't Do
                </h4>
                <ul class="space-y-2 text-sm">
                  <li>• Process credit card payments</li>
                  <li>• Collect money on your behalf</li>
                  <li>• Require clients to create accounts</li>
                </ul>
                <p class="text-xs text-slate-500 mt-4">Clients pay you directly (bank, mobile money, cash, etc.) and you record it in MyPanel.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="mt-24 text-center">
        <h2 class="text-2xl font-bold text-white mb-4">Ready to get organized?</h2>
        <p class="text-slate-400 mb-8">Start your free trial and see how simple client management can be.</p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink to="/signup">
            <UButton color="primary" size="lg" icon="i-lucide-rocket">Start Free Trial</UButton>
          </NuxtLink>
          <NuxtLink to="/features">
            <UButton variant="ghost" size="lg" icon="i-lucide-list">Explore Features</UButton>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'public'
})
</script>
