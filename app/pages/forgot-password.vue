<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="glass-card p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-lucide-key-round" class="w-8 h-8 text-blue-400" />
          </div>
          <h1 class="text-2xl font-bold text-white">Forgot Password?</h1>
          <p class="text-slate-400 mt-2">Enter your email and we'll send you a reset link</p>
        </div>

        <form v-if="!emailSent" @submit.prevent="sendResetLink" class="space-y-6">
          <UFormField label="Email Address" name="email">
            <div class="relative">
              <UIcon name="i-lucide-mail" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <UInput 
                v-model="email" 
                type="email" 
                placeholder="you@example.com"
                size="lg"
                required
                :ui="{ base: 'pl-14' }"
              />
            </div>
          </UFormField>

          <UButton 
            type="submit" 
            color="primary" 
            block 
            size="lg"
            :loading="loading"
            icon="i-lucide-send"
          >
            Send Reset Link
          </UButton>
        </form>

        <!-- Success State -->
        <div v-else class="text-center">
          <div class="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-lucide-mail-check" class="w-10 h-10 text-emerald-400" />
          </div>
          <h2 class="text-xl font-bold text-white mb-3">Check Your Email</h2>
          <p class="text-slate-400 mb-6">
            If an account exists for <strong class="text-white">{{ email }}</strong>, you'll receive a password reset link shortly.
          </p>
          <p class="text-sm text-slate-500 mb-6">
            The link will expire in 1 hour. Check your spam folder if you don't see it.
          </p>
          <UButton 
            variant="ghost" 
            color="neutral"
            @click="emailSent = false; email = ''"
          >
            Try Another Email
          </UButton>
        </div>

        <div class="mt-8 text-center">
          <NuxtLink to="/login" class="text-sm text-blue-400 hover:text-blue-300">
            ← Back to Login
          </NuxtLink>
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
  title: 'Forgot Password - MyPanel'
})

const toast = useToast()
const email = ref('')
const loading = ref(false)
const emailSent = ref(false)

const sendResetLink = async () => {
  loading.value = true
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    })
    
    emailSent.value = true
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to send reset link',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>
