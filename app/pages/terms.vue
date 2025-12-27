<template>
  <div class="max-w-4xl mx-auto px-4 py-20">
      <div class="glass-card p-8 md:p-12">
        <h1 class="text-4xl font-bold text-white mb-8 gradient-text">Terms of Service</h1>
        
        <div class="prose prose-invert max-w-none space-y-8 text-slate-300">
          <section>
            <h2 class="text-2xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using MyPanel, you agree to be bound by these Terms of Service. If you do not agree to all these terms, you are prohibited from using the service.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-white mb-4">2. Subscription and Payments</h2>
            <p>
              Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis (monthly or yearly). A valid payment method is required to process the payment for your Subscription.
            </p>
            <p>
              We provide a 14-day free trial for new organizations. At the end of the trial period, your account will be suspended unless a subscription plan is selected.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-white mb-4">3. User Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-white mb-4">4. Client Data</h2>
            <p>
              You maintain all rights and ownership of the data you enter into MyPanel regarding your clients and services. We do not claim ownership of your content. You represent and warrant that you have the right to provide such data.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-white mb-4">5. Limitation of Liability</h2>
            <p>
              In no event shall MyPanel or WeCode Zimbabwe be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-white mb-4">6. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any significant changes.
            </p>
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
  title: 'Terms of Service - MyPanel',
  meta: [
    { name: 'description', content: 'Terms and conditions for using the MyPanel platform.' }
  ]
})
</script>
