<template>
  <div class="min-h-screen">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <UIcon name="i-lucide-layout-dashboard" class="w-6 h-6 text-white" />
            </div>
            <span class="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">MyPanel</span>
          </div>
          <div class="flex items-center gap-4">
            <NuxtLink to="/login" class="text-slate-300 hover:text-white transition-colors">
              Sign In
            </NuxtLink>
            <NuxtLink to="/login">
              <UButton color="primary" size="sm">Get Started</UButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl" />
        <div class="absolute top-60 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl" />
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div class="relative max-w-7xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
          <UIcon name="i-lucide-sparkles" class="w-4 h-4 text-blue-400" />
          <span class="text-sm text-blue-300">Simplify Your Business Operations</span>
        </div>
        
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Manage Clients, Services<br />
          <span class="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">& Payments with Ease</span>
        </h1>
        
        <p class="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10">
          The all-in-one platform designed for service providers to streamline client management, 
          automate invoicing, track payments, and grow their business effortlessly.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <NuxtLink to="/login">
            <UButton color="primary" size="lg" icon="i-lucide-arrow-right" trailing>
              Start Managing Today
            </UButton>
          </NuxtLink>
          <UButton variant="outline" color="neutral" size="lg" icon="i-lucide-play-circle">
            Watch Demo
          </UButton>
        </div>

        <!-- Hero Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div class="glass-card p-6 text-center">
            <p class="text-3xl font-bold text-blue-400">∞</p>
            <p class="text-sm text-slate-400 mt-1">Unlimited Clients</p>
          </div>
          <div class="glass-card p-6 text-center">
            <p class="text-3xl font-bold text-emerald-400">100%</p>
            <p class="text-sm text-slate-400 mt-1">Automated Invoicing</p>
          </div>
          <div class="glass-card p-6 text-center">
            <p class="text-3xl font-bold text-amber-400">24/7</p>
            <p class="text-sm text-slate-400 mt-1">Access Anywhere</p>
          </div>
          <div class="glass-card p-6 text-center">
            <p class="text-3xl font-bold text-purple-400">0</p>
            <p class="text-sm text-slate-400 mt-1">Missed Payments</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">Everything You Need to Succeed</h2>
          <p class="text-lg text-slate-400 max-w-2xl mx-auto">
            Powerful features designed to help service providers focus on what matters most - delivering great services.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Feature 1 -->
          <div class="glass-card p-8 hover:bg-white/5 transition-all group">
            <div class="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UIcon name="i-lucide-users" class="w-7 h-7 text-blue-400" />
            </div>
            <h3 class="text-xl font-semibold text-white mb-3">Client Management</h3>
            <p class="text-slate-400">
              Keep all your client information organized in one place. Track contact details, service history, and communication effortlessly.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="glass-card p-8 hover:bg-white/5 transition-all group">
            <div class="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UIcon name="i-lucide-server" class="w-7 h-7 text-emerald-400" />
            </div>
            <h3 class="text-xl font-semibold text-white mb-3">Service Tracking</h3>
            <p class="text-slate-400">
              Monitor all active services, subscriptions, and renewals. Never miss a renewal date with automated reminders.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="glass-card p-8 hover:bg-white/5 transition-all group">
            <div class="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UIcon name="i-lucide-file-text" class="w-7 h-7 text-amber-400" />
            </div>
            <h3 class="text-xl font-semibold text-white mb-3">Smart Invoicing</h3>
            <p class="text-slate-400">
              Generate professional invoices in seconds. Customize templates, apply taxes, and send directly to clients.
            </p>
          </div>

          <!-- Feature 4 -->
          <div class="glass-card p-8 hover:bg-white/5 transition-all group">
            <div class="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UIcon name="i-lucide-credit-card" class="w-7 h-7 text-purple-400" />
            </div>
            <h3 class="text-xl font-semibold text-white mb-3">Payment Tracking</h3>
            <p class="text-slate-400">
              Track every payment with detailed records. Support for multiple payment methods including bank transfer, card, and mobile money.
            </p>
          </div>

          <!-- Feature 5 -->
          <div class="glass-card p-8 hover:bg-white/5 transition-all group">
            <div class="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UIcon name="i-lucide-mail" class="w-7 h-7 text-rose-400" />
            </div>
            <h3 class="text-xl font-semibold text-white mb-3">Email Automation</h3>
            <p class="text-slate-400">
              Automated email reminders for upcoming renewals, overdue invoices, and payment confirmations. Keep clients informed.
            </p>
          </div>

          <!-- Feature 6 -->
          <div class="glass-card p-8 hover:bg-white/5 transition-all group">
            <div class="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UIcon name="i-lucide-bar-chart-3" class="w-7 h-7 text-cyan-400" />
            </div>
            <h3 class="text-xl font-semibold text-white mb-3">Insightful Reports</h3>
            <p class="text-slate-400">
              Visualize your business performance with detailed dashboards. Track revenue, invoice status, and payment trends.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p class="text-lg text-slate-400 max-w-2xl mx-auto">
            Get started in minutes and transform how you manage your business
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
              1
            </div>
            <h3 class="text-xl font-semibold text-white mb-3">Add Your Clients</h3>
            <p class="text-slate-400">
              Import or manually add your clients with all their contact and billing information.
            </p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
              2
            </div>
            <h3 class="text-xl font-semibold text-white mb-3">Set Up Services</h3>
            <p class="text-slate-400">
              Define your services, pricing, and billing cycles. Link them to clients with just a few clicks.
            </p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
              3
            </div>
            <h3 class="text-xl font-semibold text-white mb-3">Get Paid Faster</h3>
            <p class="text-slate-400">
              Send invoices, receive payments, and let automation handle the reminders and follow-ups.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonial / Social Proof -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
      <div class="max-w-4xl mx-auto text-center">
        <UIcon name="i-lucide-quote" class="w-12 h-12 text-blue-400 mx-auto mb-6 opacity-50" />
        <blockquote class="text-2xl sm:text-3xl text-white font-medium mb-6 leading-relaxed">
          "MyPanel has completely transformed how I manage my web hosting clients. 
          I save hours every week on invoicing and never miss a renewal anymore."
        </blockquote>
        <div class="flex items-center justify-center gap-4">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
            JD
          </div>
          <div class="text-left">
            <p class="font-semibold text-white">John Doe</p>
            <p class="text-sm text-slate-400">Web Hosting Provider</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to Simplify Your Business?
        </h2>
        <p class="text-lg text-slate-400 mb-8">
          Join service providers who use MyPanel to manage their clients, services, and payments effortlessly.
        </p>
        <NuxtLink to="/login">
          <UButton color="primary" size="xl" icon="i-lucide-rocket">
            Get Started For Free
          </UButton>
        </NuxtLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <UIcon name="i-lucide-layout-dashboard" class="w-4 h-4 text-white" />
            </div>
            <span class="font-bold text-white">MyPanel</span>
          </div>
          <p class="text-sm text-slate-400">
            © {{ new Date().getFullYear() }} MyPanel. All rights reserved.
          </p>
          <div class="flex items-center gap-6">
            <a href="#" class="text-slate-400 hover:text-white transition-colors text-sm">Privacy</a>
            <a href="#" class="text-slate-400 hover:text-white transition-colors text-sm">Terms</a>
            <a href="#" class="text-slate-400 hover:text-white transition-colors text-sm">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})
</script>

<style scoped>
.glass-card {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
}
</style>
