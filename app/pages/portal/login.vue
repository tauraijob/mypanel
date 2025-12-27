<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-200px)]">
    <div class="w-full max-w-md">
      <div class="glass-card p-8 animate-fade-in relative overflow-hidden">
        <!-- Glow effect -->
        <div class="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div class="text-center mb-8 relative z-10">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-lg shadow-blue-500/20 mb-4">
            P
          </div>
          <h1 class="text-2xl font-bold text-white">Client Portal</h1>
          <p class="text-slate-400 mt-2">Sign in to view your invoices and services</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4 relative z-10">
          <!-- Error Alert -->
          <div v-if="error" class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-400">
            <UIcon name="i-lucide-alert-circle" class="w-4 h-4" />
            {{ error }}
          </div>

          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input 
              v-model="form.email"
              type="email" 
              class="form-input"
              placeholder="name@company.com"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input 
              v-model="form.password"
              type="password" 
              class="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          <UButton 
            type="submit" 
            block 
            color="primary" 
            size="lg"
            :loading="loading"
            class="font-semibold"
          >
            Sign In
          </UButton>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'portal',
  middleware: 'portal-auth'
})

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')
const router = useRouter()

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const { token, user } = await $fetch('/api/portal/login', {
      method: 'POST',
      body: form.value
    })
    
    // Store token
    const cookie = useCookie('client_token')
    cookie.value = token
    
    // Store user info
    localStorage.setItem('client_user', JSON.stringify(user))
    
    router.push('/portal')
  } catch (err: any) {
    error.value = err.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
