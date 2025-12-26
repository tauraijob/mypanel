<template>
  <div>
    <NuxtLayout name="auth">
      <div class="glass-card p-8 animate-fade-in">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-lucide-layout-dashboard" class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-white">Welcome to MyPanel</h1>
          <p class="text-slate-400 mt-2">Sign in to manage your clients & services</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <UFormField label="Email" name="email">
            <UInput
              v-model="form.email"
              type="email"
              placeholder="admin@example.com"
              icon="i-lucide-mail"
              size="lg"
              class="w-full"
              required
            />
          </UFormField>

          <UFormField label="Password" name="password">
            <UInput
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              icon="i-lucide-lock"
              size="lg"
              class="w-full"
              required
            >
              <template #trailing>
                <UButton
                  :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 text-sm text-slate-400">
              <UCheckbox v-model="form.remember" />
              Remember me
            </label>
          </div>

          <UButton
            type="submit"
            color="primary"
            size="lg"
            class="w-full btn-glow"
            :loading="loading"
          >
            <UIcon name="i-lucide-log-in" class="w-5 h-5 mr-2" />
            Sign In
          </UButton>
        </form>

        <!-- Demo Credentials -->
        <div class="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p class="text-xs text-blue-300 text-center">
            <strong>Demo:</strong> admin@mypanel.com / admin123
          </p>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const showPassword = ref(false)
const loading = ref(false)
const toast = useToast()

const handleLogin = async () => {
  loading.value = true
  
  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: form
    })
    
    if (response.success) {
      // Store token
      localStorage.setItem('auth_token', response.token)
      toast.add({
        title: 'Welcome back!',
        description: 'Login successful',
        color: 'success'
      })
      await navigateTo('/dashboard')
    }
  } catch (error: any) {
    toast.add({
      title: 'Login Failed',
      description: error.data?.message || 'Invalid credentials',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>


