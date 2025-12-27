<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="glass-card p-8">
        <!-- Loading State -->
        <div v-if="verifying" class="text-center py-8">
          <UIcon name="i-lucide-loader-2" class="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p class="text-slate-400">Verifying reset link...</p>
        </div>

        <!-- Invalid Token -->
        <div v-else-if="tokenError" class="text-center">
          <div class="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-lucide-x-circle" class="w-8 h-8 text-rose-400" />
          </div>
          <h1 class="text-2xl font-bold text-white mb-3">Invalid or Expired Link</h1>
          <p class="text-slate-400 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <NuxtLink to="/forgot-password">
            <UButton color="primary" icon="i-lucide-refresh-cw">
              Request New Link
            </UButton>
          </NuxtLink>
        </div>

        <!-- Success State -->
        <div v-else-if="resetSuccess" class="text-center">
          <div class="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-lucide-check-circle" class="w-10 h-10 text-emerald-400" />
          </div>
          <h1 class="text-2xl font-bold text-white mb-3">Password Reset!</h1>
          <p class="text-slate-400 mb-6">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <NuxtLink to="/login">
            <UButton color="primary" icon="i-lucide-log-in" size="lg">
              Go to Login
            </UButton>
          </NuxtLink>
        </div>

        <!-- Reset Form -->
        <div v-else>
          <div class="text-center mb-8">
            <div class="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-lucide-lock" class="w-8 h-8 text-blue-400" />
            </div>
            <h1 class="text-2xl font-bold text-white">Reset Password</h1>
            <p class="text-slate-400 mt-2">Enter your new password below</p>
          </div>

          <form @submit.prevent="resetPassword" class="space-y-6">
            <UFormField label="New Password" name="password">
              <UInput 
                v-model="password" 
                type="password" 
                placeholder="••••••••"
                icon="i-lucide-lock"
                size="lg"
                required
                minlength="8"
              />
              <template #hint>
                <span class="text-xs text-slate-500">Minimum 8 characters</span>
              </template>
            </UFormField>

            <UFormField label="Confirm Password" name="confirmPassword">
              <UInput 
                v-model="confirmPassword" 
                type="password" 
                placeholder="••••••••"
                icon="i-lucide-lock"
                size="lg"
                required
              />
            </UFormField>

            <div v-if="password && confirmPassword && password !== confirmPassword" 
                 class="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
              <UIcon name="i-lucide-alert-circle" class="w-4 h-4 shrink-0" />
              Passwords do not match
            </div>

            <UButton 
              type="submit" 
              color="primary" 
              block 
              size="lg"
              :loading="loading"
              :disabled="!password || !confirmPassword || password !== confirmPassword || password.length < 8"
              icon="i-lucide-check"
            >
              Reset Password
            </UButton>
          </form>

          <div class="mt-8 text-center">
            <NuxtLink to="/login" class="text-sm text-blue-400 hover:text-blue-300">
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
  layout: 'public'
})

useHead({
  title: 'Reset Password - MyPanel'
})

const route = useRoute()
const toast = useToast()

const verifying = ref(false)
const tokenError = ref(false)
const resetSuccess = ref(false)
const loading = ref(false)
const password = ref('')
const confirmPassword = ref('')

const token = computed(() => route.query.token as string)

// Check if token exists
onMounted(() => {
  if (!token.value) {
    tokenError.value = true
  }
})

const resetPassword = async () => {
  if (password.value !== confirmPassword.value) {
    toast.add({
      title: 'Error',
      description: 'Passwords do not match',
      color: 'error'
    })
    return
  }

  if (password.value.length < 8) {
    toast.add({
      title: 'Error',
      description: 'Password must be at least 8 characters',
      color: 'error'
    })
    return
  }

  loading.value = true
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { 
        token: token.value,
        password: password.value 
      }
    })
    
    resetSuccess.value = true
    toast.add({
      title: 'Success',
      description: 'Your password has been reset successfully',
      color: 'success'
    })
  } catch (error: any) {
    if (error.data?.message?.includes('expired') || error.data?.message?.includes('Invalid')) {
      tokenError.value = true
    } else {
      toast.add({
        title: 'Error',
        description: error.data?.message || 'Failed to reset password',
        color: 'error'
      })
    }
  } finally {
    loading.value = false
  }
}
</script>
