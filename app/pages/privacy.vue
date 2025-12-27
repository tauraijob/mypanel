<template>
  <div class="max-w-4xl mx-auto px-4 py-20">
      <div class="glass-card p-8 md:p-12">
        <h1 class="text-4xl font-bold text-white mb-8 gradient-text">Privacy Policy</h1>
        
        <div class="prose prose-invert max-w-none space-y-8 text-slate-300">
          <section>
            <h2 class="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to MyPanel. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at info@wecode.co.zw.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
            <p>
              We collect personal information that you voluntarily provide to us when you register on MyPanel, express an interest in obtaining information about us or our products and services, or otherwise when you contact us.
            </p>
            <ul class="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, password, organization name, and contact details.</li>
              <li><strong>Billing Information:</strong> Payment details and billing address for subscription purposes.</li>
              <li><strong>Client Data:</strong> Information about your clients and services you manage through our platform.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p>
              We use personal information collected via MyPanel for a variety of business purposes described below:
            </p>
            <ul class="list-disc pl-6 space-y-2">
              <li>To facilitate account creation and logon process.</li>
              <li>To send administrative information to you.</li>
              <li>To fulfill and manage your subscriptions.</li>
              <li>To provide support and respond to inquiries.</li>
              <li>To maintain the security and integrity of our platform.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
            <p>
              We aim to protect your personal information through a system of organizational and technical security measures. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold text-white mb-4">5. Contact Us</h2>
            <p>
              If you have questions or comments about this policy, you may email us at info@wecode.co.zw or by post to WeCode Zimbabwe.
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
  title: 'Privacy Policy - MyPanel',
  meta: [
    { name: 'description', content: 'Our commitment to protecting your privacy and personal data.' }
  ]
})
</script>
