<template>
  <div class="relative py-24 overflow-hidden">
      <!-- Background Decorative Elements -->
      <div class="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div class="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-cyan-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div class="max-w-7xl mx-auto px-4 relative z-10">
        <div class="flex flex-col lg:flex-row gap-16 items-start">
          
          <!-- Contact Information Sidebar -->
          <div class="lg:w-2/5 animate-slide-in">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Contact Us
            </div>
            
            <h1 class="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              Let's build something <span class="gradient-text">extraordinary</span>.
            </h1>
            
            <p class="text-lg text-slate-400 mb-12 leading-relaxed max-w-md">
              Have questions about MyPanel or need a custom solution? Our experts are ready to assist you.
            </p>

            <div class="space-y-6">
              <!-- Email Card -->
              <a href="mailto:info@wecode.co.zw" class="flex items-center gap-5 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 group">
                <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                  <UIcon name="i-lucide-mail" class="w-6 h-6" />
                </div>
                <div>
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email Support</p>
                  <p class="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">info@wecode.co.zw</p>
                </div>
              </a>

              <!-- Phone Card -->
              <a href="tel:+263778466168" class="flex items-center gap-5 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300 group">
                <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                  <UIcon name="i-lucide-phone-call" class="w-6 h-6" />
                </div>
                <div>
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Call / WhatsApp</p>
                  <p class="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">+263 778 466 168</p>
                </div>
              </a>

              <!-- Location Card -->
              <div class="flex items-center gap-5 p-5 rounded-2xl bg-white/5 border border-white/5 group">
                <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <UIcon name="i-lucide-map-pin" class="w-6 h-6" />
                </div>
                <div>
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Headquarters</p>
                  <p class="text-lg font-semibold text-white">Harare, Zimbabwe</p>
                </div>
              </div>
            </div>

            <!-- Social Links -->
            <div class="mt-12 flex items-center gap-4">
              <span class="text-sm font-medium text-slate-500 mr-2">Follow us:</span>
              <a href="#" class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all">
                <UIcon name="i-simple-icons-twitter" class="w-4 h-4" />
              </a>
              <a href="#" class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white hover:text-black hover:border-white transition-all">
                <UIcon name="i-simple-icons-github" class="w-4 h-4" />
              </a>
              <a href="#" class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                <UIcon name="i-simple-icons-linkedin" class="w-4 h-4" />
              </a>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="lg:w-3/5 w-full">
            <div class="glass-card p-1 relative overflow-hidden group">
              <!-- Subtle inner glow -->
              <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
              
              <div class="bg-slate-900/40 backdrop-blur-2xl rounded-[15px] p-8 md:p-12">
                <h2 class="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                  <span class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <UIcon name="i-lucide-send" class="w-4 h-4 text-blue-400" />
                  </span>
                  Send a Message
                </h2>
                
                <form v-if="!submitted" @submit.prevent="handleSubmit" class="space-y-8">
                  <div class="grid md:grid-cols-2 gap-8">
                    <div class="space-y-2">
                      <label class="text-sm font-semibold text-slate-300 ml-1">Full Name</label>
                      <UInput 
                        v-model="form.name" 
                        placeholder="e.g. John Doe" 
                        size="xl"
                        icon="i-lucide-user"
                        required 
                      />
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-semibold text-slate-300 ml-1">Email Address</label>
                      <UInput 
                        v-model="form.email" 
                        type="email" 
                        placeholder="john@example.com" 
                        size="xl"
                        icon="i-lucide-at-sign"
                        required 
                      />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-slate-300 ml-1">Subject</label>
                    <UInput 
                      v-model="form.subject" 
                      placeholder="What's this regarding?" 
                      size="xl"
                      icon="i-lucide-help-circle"
                      required 
                    />
                  </div>

                  <div class="space-y-2">
                    <label class="text-sm font-semibold text-slate-300 ml-1">Your Message</label>
                    <UTextarea 
                      v-model="form.message" 
                      :rows="6" 
                      placeholder="Tell us more about your project or inquiry..." 
                      class="resize-none"
                      required 
                    />
                  </div>

                  <UButton
                    type="submit"
                    size="xl"
                    block
                    color="primary"
                    :loading="loading"
                    class="h-14 text-lg font-bold shadow-xl shadow-blue-500/20"
                  >
                    Send Message
                    <template #trailing>
                      <UIcon name="i-lucide-arrow-right" class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </template>
                  </UButton>
                </form>

                <div v-else class="text-center py-16 animate-fade-in">
                  <div class="w-24 h-24 rounded-3xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto mb-8 shadow-inner">
                    <UIcon name="i-lucide-check-circle-2" class="w-12 h-12" />
                  </div>
                  <h3 class="text-3xl font-extrabold text-white mb-4">Message Sent!</h3>
                  <p class="text-lg text-slate-400 max-w-sm mx-auto mb-10">
                    We've received your inquiry and our team will get back to you within 24 hours.
                  </p>
                  <UButton 
                    variant="soft" 
                    color="neutral"
                    size="lg"
                    @click="submitted = false; form = { name: '', email: '', subject: '', message: '' }"
                  >
                    Send Another Message
                  </UButton>
                </div>
              </div>
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

useHead({
  title: 'Contact Our Team - MyPanel',
  meta: [
    { name: 'description', content: 'Connect with the experts at MyPanel. We provide direct support for business management and custom platform solutions.' }
  ]
})

const loading = ref(false)
const submitted = ref(false)
const toast = useToast()

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const handleSubmit = async () => {
  loading.value = true
  try {
    await $fetch('/api/public/contact', {
      method: 'POST',
      body: form
    })
    submitted.value = true
    toast.add({
      title: 'Message Sent',
      description: 'Your message has been delivered to our team.',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
  } catch (error: any) {
    toast.add({
      title: 'Sending Failed',
      description: error.data?.message || 'We encountered an error. Please try again or email us directly.',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.glass-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
</style>
