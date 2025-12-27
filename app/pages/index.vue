<template>
  <div class="relative overflow-hidden">
    <!-- Hero Section -->
    <section class="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div class="absolute top-60 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div class="relative max-w-7xl mx-auto text-center pt-12">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 animate-fade-in shadow-lg shadow-blue-500/5">
          <UIcon name="i-lucide-sparkles" class="w-4 h-4 text-blue-400" />
          <span class="text-sm font-medium text-blue-300">Smart Business Management</span>
        </div>
        
        <h1 class="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-8 leading-tight tracking-tight">
          Track Clients, Services &<br />
          <span class="gradient-text">Invoicing — All in One Place</span>
        </h1>
        
        <p class="text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
          MyPanel is a simple, powerful tool for <strong class="text-white">web hosts, freelancers, and service providers</strong> to manage clients, 
          track recurring services, send professional invoices, and record payments — so you stay organized and get paid on time.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
          <NuxtLink to="/signup">
            <UButton color="primary" size="xl" icon="i-lucide-rocket" class="px-8 shadow-xl shadow-blue-500/20">
              Start Your 14-Day Free Trial
            </UButton>
          </NuxtLink>
          <NuxtLink to="/pricing">
            <UButton variant="ghost" size="xl" icon="i-lucide-credit-card" class="text-slate-300">
              View Pricing Plans
            </UButton>
          </NuxtLink>
        </div>

        <!-- Benefits Summary -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div class="glass-card p-6 text-center">
            <p class="text-3xl font-bold text-blue-400">Unlimited</p>
            <p class="text-sm text-slate-400 mt-1">Clients & Invoices</p>
          </div>
          <div class="glass-card p-6 text-center">
            <p class="text-3xl font-bold text-emerald-400">Automated</p>
            <p class="text-sm text-slate-400 mt-1">Email Reminders</p>
          </div>
          <div class="glass-card p-6 text-center">
            <p class="text-3xl font-bold text-amber-400">Branded</p>
            <p class="text-sm text-slate-400 mt-1">PDF Invoices</p>
          </div>
          <div class="glass-card p-6 text-center">
            <p class="text-3xl font-bold text-purple-400">Track</p>
            <p class="text-sm text-slate-400 mt-1">Due Dates & Payments</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Summary -->
    <section class="py-20 border-y border-white/5 bg-slate-900/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-white mb-4">Get Started in 3 Simple Steps</h2>
          <p class="text-slate-400 max-w-2xl mx-auto">No technical knowledge required. Sign up, set up your business, and start managing clients in minutes.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-12">
          <div class="text-center">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">1</div>
            <h3 class="text-xl font-semibold text-white mb-3">Choose Your Plan</h3>
            <p class="text-slate-400">Pick a subscription that fits your needs. Start with a 14-day free trial — no credit card required.</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">2</div>
            <h3 class="text-xl font-semibold text-white mb-3">Set Up Your Business</h3>
            <p class="text-slate-400">Add your company details, branding, and configure your invoicing preferences.</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">3</div>
            <h3 class="text-xl font-semibold text-white mb-3">Start Tracking Everything</h3>
            <p class="text-slate-400">Add clients, track services, generate invoices, and record payments as they come in.</p>
          </div>
        </div>
        <div class="text-center mt-12">
          <NuxtLink to="/how-it-works">
            <UButton variant="outline" size="lg">Learn More About How It Works</UButton>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Who It's For -->
    <section class="py-32 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-20">
          <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">Built for Service Providers Like You</h2>
          <p class="text-slate-400 max-w-2xl mx-auto">Whether you run a hosting company, freelance, or consult, MyPanel helps you stay organized without the complexity.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="glass-card p-10 hover:bg-white/5 transition-colors border-white/5">
            <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-8">
              <UIcon name="i-lucide-server" class="w-6 h-6 text-blue-400" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Web Hosting Providers</h3>
            <p class="text-slate-400 leading-relaxed">
              Track hosting plans, domain renewals, and send invoices when services are due. Record payments and keep your books organized.
            </p>
          </div>

          <div class="glass-card p-10 hover:bg-white/5 transition-colors border-white/5">
            <div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-8">
              <UIcon name="i-lucide-code" class="w-6 h-6 text-purple-400" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Freelance Developers</h3>
            <p class="text-slate-400 leading-relaxed">
              Manage website projects and maintenance retainers. Send professional quotes, convert them to invoices, and track what's been paid.
            </p>
          </div>

          <div class="glass-card p-10 hover:bg-white/5 transition-colors border-white/5">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-8">
              <UIcon name="i-lucide-briefcase" class="w-6 h-6 text-emerald-400" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Consultants</h3>
            <p class="text-slate-400 leading-relaxed">
              Track consulting sessions, bill clients for your time, and send reminders when payments are overdue. Keep all client info in one place.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-24 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto glass-card p-12 text-center relative overflow-hidden">
        <div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div class="relative z-10">
          <h2 class="text-3xl font-bold text-white mb-4">Ready to Get Organized?</h2>
          <p class="text-slate-400 mb-8 max-w-xl mx-auto">Stop chasing spreadsheets. Start your free trial and see how easy client management can be.</p>
          <NuxtLink to="/signup">
            <UButton color="primary" size="xl" icon="i-lucide-arrow-right" trailing>Get Started Free</UButton>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'public'
})
</script>
