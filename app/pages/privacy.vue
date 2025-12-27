<template>
  <div class="max-w-4xl mx-auto px-4 py-20">
      <div class="glass-card p-8 md:p-12">
        <h1 class="text-4xl font-bold text-white mb-8 gradient-text">Privacy Policy</h1>
        
        <!-- Data Isolation Highlight -->
        <div class="mb-10 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-shield-check" class="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-white mb-2">Your Data Stays Yours</h2>
              <p class="text-slate-300">
                We operate on a strict <strong class="text-emerald-400">zero-access policy</strong>. Your business data, client information, and invoices are completely isolated and encrypted. We never access, sell, share, or analyze your data — it's yours alone.
              </p>
            </div>
          </div>
        </div>
        
        <div class="prose prose-invert max-w-none space-y-8 text-slate-300">
          <section>
            <h2 class="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to MyPanel. We are committed to protecting your personal information and your right to privacy. This policy explains what data we collect, how we use it, and most importantly — what we do NOT do with your data.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-white mb-4">2. Complete Data Isolation</h2>
            <p class="mb-4">
              MyPanel is built on a <strong class="text-white">multi-tenant architecture with complete data isolation</strong>. This means:
            </p>
            <ul class="list-disc pl-6 space-y-3">
              <li><strong class="text-emerald-400">Your data is isolated:</strong> Each organization's data is stored separately and cannot be accessed by other organizations.</li>
              <li><strong class="text-emerald-400">We don't access your data:</strong> Our staff does not have access to your business data, client lists, invoices, or payment records.</li>
              <li><strong class="text-emerald-400">No data sharing:</strong> We never sell, share, rent, or trade your data to third parties for marketing or any other purpose.</li>
              <li><strong class="text-emerald-400">No data analysis:</strong> We don't analyze your business data, client behavior, or financial information for any purpose.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-white mb-4">3. Information We Collect</h2>
            <p class="mb-4">
              We only collect information necessary to provide our service:
            </p>
            <ul class="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, and organization name for account creation.</li>
              <li><strong>Subscription Information:</strong> Payment details processed securely for billing purposes.</li>
              <li><strong>Usage Data:</strong> Basic analytics (login times, feature usage) to improve our service — never your business data.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-white mb-4">4. Your Business Data</h2>
            <p class="mb-4">
              The data you store in MyPanel — clients, services, invoices, quotations, payments — is treated with the highest level of protection:
            </p>
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-white/5">
                <UIcon name="i-lucide-lock" class="w-5 h-5 text-blue-400 mb-2" />
                <h4 class="font-semibold text-white mb-1">Encrypted at Rest</h4>
                <p class="text-sm text-slate-400">All data stored using AES-256 encryption</p>
              </div>
              <div class="p-4 rounded-xl bg-white/5">
                <UIcon name="i-lucide-shield" class="w-5 h-5 text-emerald-400 mb-2" />
                <h4 class="font-semibold text-white mb-1">Encrypted in Transit</h4>
                <p class="text-sm text-slate-400">All connections secured with TLS/SSL</p>
              </div>
              <div class="p-4 rounded-xl bg-white/5">
                <UIcon name="i-lucide-database" class="w-5 h-5 text-purple-400 mb-2" />
                <h4 class="font-semibold text-white mb-1">Isolated Storage</h4>
                <p class="text-sm text-slate-400">Your data is separate from other organizations</p>
              </div>
              <div class="p-4 rounded-xl bg-white/5">
                <UIcon name="i-lucide-eye-off" class="w-5 h-5 text-amber-400 mb-2" />
                <h4 class="font-semibold text-white mb-1">Zero Access</h4>
                <p class="text-sm text-slate-400">Our team cannot view your business data</p>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-white mb-4">5. What We Will NEVER Do</h2>
            <ul class="space-y-3">
              <li class="flex items-start gap-3">
                <UIcon name="i-lucide-x-circle" class="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span><strong class="text-white">Never sell your data</strong> to advertisers, marketers, or any third party</span>
              </li>
              <li class="flex items-start gap-3">
                <UIcon name="i-lucide-x-circle" class="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span><strong class="text-white">Never share your client lists</strong> or business information with competitors</span>
              </li>
              <li class="flex items-start gap-3">
                <UIcon name="i-lucide-x-circle" class="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span><strong class="text-white">Never analyze your financial data</strong> for any purpose other than providing your service</span>
              </li>
              <li class="flex items-start gap-3">
                <UIcon name="i-lucide-x-circle" class="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span><strong class="text-white">Never access your invoices</strong> or payment records without your explicit consent</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-white mb-4">6. Data Retention & Deletion</h2>
            <p>
              You can delete your data at any time. When you delete your account, all your data — clients, invoices, services, payments — is permanently removed from our systems within 30 days. We don't keep copies or backups of deleted data.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-white mb-4">7. Contact Us</h2>
            <p class="mb-4">
              If you have questions about this policy or how your data is handled:
            </p>
            <div class="flex flex-wrap gap-4">
              <a href="mailto:info@wecode.co.zw" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
                <UIcon name="i-lucide-mail" class="w-4 h-4" />
                info@wecode.co.zw
              </a>
              <NuxtLink to="/contact" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
                <UIcon name="i-lucide-message-circle" class="w-4 h-4" />
                Contact Form
              </NuxtLink>
            </div>
          </section>

          <div class="pt-8 border-t border-white/10 text-sm text-slate-500 text-center">
            Last updated: {{ new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}
          </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'public'
})

useHead({
  title: 'Privacy Policy - MyPanel',
  meta: [
    { name: 'description', content: 'Our commitment to protecting your privacy. Complete data isolation, zero-access policy, and enterprise-grade security.' }
  ]
})
</script>
