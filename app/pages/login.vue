<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center py-12 px-4">
    <!-- Background Effects -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative w-full max-w-md">
      <div class="glass-card p-8 animate-fade-in">
        <!-- Logo -->
        <div class="text-center mb-8">
          <NuxtLink to="/" class="inline-block">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-lucide-layout-dashboard" class="w-8 h-8 text-white" />
            </div>
          </NuxtLink>
          <h1 class="text-2xl font-bold text-white">Welcome to MyPanel</h1>
          <p class="text-slate-400 mt-2">Sign in to manage your clients & services</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Verification Alert -->
          <div v-if="isVerificationError" class="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg animate-fade-in">
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div class="space-y-2">
                <p class="text-sm text-yellow-200 font-medium">Email Verification Required</p>
                <p class="text-xs text-yellow-200/80">Please verify your email address to continue.</p>
                <button 
                  type="button"
                  @click="resendVerification"
                  :disabled="isResending"
                  class="text-xs font-semibold text-yellow-500 hover:text-yellow-400 underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isResending ? 'Sending...' : 'Resend Verification Email' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Admin Required Alert -->
          <div v-if="route.query.error === 'admin-required'" class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg animate-fade-in">
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-lock" class="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div class="space-y-1">
                <p class="text-sm text-red-200 font-medium">Super Admin Required</p>
                <p class="text-xs text-red-200/80">Please sign in with a Super Admin account to access that area.</p>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <div class="relative">
              <UIcon name="i-lucide-mail" class="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" style="left: 14px;" />
              <input
                v-model="form.email"
                type="email"
                placeholder="you@company.com"
                class="form-input"
                style="padding-left: 44px !important;"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="relative">
              <UIcon name="i-lucide-lock" class="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" style="left: 14px;" />
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="form-input"
                style="padding-left: 44px !important; padding-right: 48px !important;"
                required
              />
              <button
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                @click="showPassword = !showPassword"
              >
                <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
              <input type="checkbox" v-model="form.remember" class="form-checkbox" />
              Remember me
            </label>
            <NuxtLink to="/forgot-password" class="text-sm text-blue-400 hover:text-blue-300">
              Forgot password?
            </NuxtLink>
          </div>

          <UButton
            type="submit"
            color="primary"
            size="lg"
            class="w-full"
            :loading="loading"
          >
            <UIcon name="i-lucide-log-in" class="w-5 h-5 mr-2" />
            Sign In
          </UButton>
        </form>

        <!-- Footer -->
        <p class="text-center text-slate-400 text-sm mt-6">
          Don't have an account? 
          <NuxtLink to="/signup" class="text-blue-400 hover:underline">Start free trial</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const showPassword = ref(false)
const loading = ref(false)
const isVerificationError = ref(false)
const isResending = ref(false)
const toast = useToast()
const { fetchUser } = useAuth()

const handleLogin = async () => {
  loading.value = true
  isVerificationError.value = false
  
  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: form
    }) as any
    
    if (response.success) {
      localStorage.setItem('auth_token', response.token)
      
      toast.add({
        title: 'Welcome back!',
        description: 'Login successful',
        color: 'success'
      })
      
      // Fetch user to determine redirect
      await fetchUser()
      
      // Redirect based on role
      if (response.user.role === 'SUPER_ADMIN') {
        await navigateTo('/super-admin')
      } else {
        await navigateTo('/dashboard')
      }
    }
  } catch (error: any) {
    if (error.status === 403 && error.data?.statusMessage === 'EMAIL_NOT_VERIFIED') {
      isVerificationError.value = true
      toast.add({
        title: 'Verification Required',
        description: 'Please verify your email address to log in.',
        color: 'warning'
      })
    } else {
      toast.add({
        title: 'Login Failed',
        description: error.data?.message || 'Invalid credentials',
        color: 'error'
      })
    }
  } finally {
    loading.value = false
  }
}

const resendVerification = async () => {
  if (!form.email) return
  
  isResending.value = true
  try {
    const response = await $fetch('/api/public/resend-verification', {
      method: 'POST',
      body: { email: form.email }
    }) as any
    
    toast.add({
      title: 'Email Sent',
      description: response.message,
      color: 'success'
    })
    
    isVerificationError.value = false // Reset error after sending
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to resend verification email',
      color: 'error'
    })
  } finally {
    isResending.value = false
  }
}
</script>

<style scoped>
.glass-card {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
}

.form-group {
  margin-bottom: 1.25rem;
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
  padding-top: 0.875rem;
  padding-bottom: 0.875rem;
  padding-right: 1rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.75rem;
  color: #f1f5f9;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input::placeholder {
  color: #64748b;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  background: rgba(15, 23, 42, 0.9);
}

.form-input:hover:not(:focus) {
  border-color: rgba(255, 255, 255, 0.25);
}

.form-checkbox {
  width: 1rem;
  height: 1rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.25rem;
  cursor: pointer;
}

.form-checkbox:checked {
  background: #3b82f6;
  border-color: #3b82f6;
}
</style>
