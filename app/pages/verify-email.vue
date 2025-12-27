<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center py-12 px-4">
    <!-- Background Effects -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative w-full max-w-md">
      <div class="glass-card p-8 text-center">
        <!-- Loading State -->
        <div v-if="loading" class="py-12">
          <div class="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <UIcon name="i-lucide-mail-check" class="w-8 h-8 text-blue-400" />
          </div>
          <h1 class="text-2xl font-bold text-white mb-2">Verifying Your Email...</h1>
          <p class="text-slate-400">Please wait while we confirm your email address.</p>
        </div>

        <!-- Success State -->
        <div v-else-if="verified" class="py-6">
          <div class="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-lucide-check-circle" class="w-12 h-12 text-emerald-400" />
          </div>
          <h1 class="text-2xl font-bold text-white mb-2">Email Verified! 🎉</h1>
          <p class="text-slate-400 mb-8">Your email has been verified and your account is now active.</p>
          
          <NuxtLink to="/login">
            <UButton color="primary" size="lg" icon="i-lucide-log-in">
              Sign In to Your Account
            </UButton>
          </NuxtLink>
        </div>

        <!-- Error State -->
        <div v-else class="py-6">
          <div class="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-lucide-x-circle" class="w-12 h-12 text-red-400" />
          </div>
          <h1 class="text-2xl font-bold text-white mb-2">Verification Failed</h1>
          <p class="text-slate-400 mb-6">{{ error || 'The verification link is invalid or has expired.' }}</p>
          
          <!-- Resend Option -->
          <div class="space-y-4">
            <div class="form-group" v-if="showResend">
              <label class="form-label">Enter your email to resend verification</label>
              <input 
                v-model="resendEmail" 
                type="email" 
                placeholder="you@company.com" 
                class="form-input"
              />
            </div>
            
            <UButton 
              v-if="showResend"
              color="primary" 
              :loading="resending"
              @click="resendVerification"
            >
              Resend Verification Email
            </UButton>
            
            <UButton 
              v-else
              variant="outline" 
              color="neutral"
              @click="showResend = true"
            >
              Resend Verification Email
            </UButton>

            <p v-if="resendSuccess" class="text-emerald-400 text-sm">
              ✓ Verification email sent! Check your inbox.
            </p>
          </div>

          <div class="mt-8 pt-6 border-t border-white/10">
            <NuxtLink to="/login" class="text-blue-400 hover:underline text-sm">
              ← Back to Login
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()
const toast = useToast()

const loading = ref(true)
const verified = ref(false)
const error = ref('')
const showResend = ref(false)
const resendEmail = ref('')
const resending = ref(false)
const resendSuccess = ref(false)

const verifyEmail = async () => {
  const token = route.query.token as string

  if (!token) {
    loading.value = false
    error.value = 'No verification token provided.'
    return
  }

  try {
    await $fetch('/api/public/verify-email', {
      method: 'POST',
      body: { token }
    })
    
    verified.value = true
  } catch (err: any) {
    error.value = err.data?.message || 'Verification failed. Please try again.'
  } finally {
    loading.value = false
  }
}

const resendVerification = async () => {
  if (!resendEmail.value) {
    toast.add({ title: 'Please enter your email', color: 'error' })
    return
  }

  resending.value = true
  
  try {
    await $fetch('/api/public/resend-verification', {
      method: 'POST',
      body: { email: resendEmail.value }
    })
    
    resendSuccess.value = true
    toast.add({ 
      title: 'Email Sent!', 
      description: 'Check your inbox for the verification link.',
      color: 'success' 
    })
  } catch (err: any) {
    toast.add({ 
      title: 'Error', 
      description: err.data?.message || 'Failed to send email',
      color: 'error' 
    })
  } finally {
    resending.value = false
  }
}

onMounted(verifyEmail)
</script>

<style scoped>
.glass-card {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
}

.form-group {
  margin-bottom: 1rem;
  text-align: left;
}

.form-label {
  display: block;
  color: #e2e8f0;
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.75rem;
  color: #f1f5f9;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}
</style>
