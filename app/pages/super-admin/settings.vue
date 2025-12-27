<template>
  <div class="space-y-6">
    <NuxtLayout name="super-admin">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-white">Platform Settings</h1>
        <p class="text-slate-400 mt-1">Configure payment providers and platform options</p>
      </div>

      <form @submit.prevent="saveSettings" class="space-y-6">
        <!-- Platform Info -->
        <div class="glass-card p-6">
          <h2 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <UIcon name="i-lucide-globe" class="w-5 h-5 text-blue-400" />
            Platform Information
          </h2>
          <div class="grid md:grid-cols-2 gap-4">
            <UFormField label="Platform Name">
              <UInput v-model="settings.platformName" />
            </UFormField>
            <UFormField label="Platform URL">
              <UInput v-model="settings.platformUrl" placeholder="https://mypanel.wecode.co.zw" />
            </UFormField>
            <UFormField label="Support Email">
              <UInput v-model="settings.supportEmail" type="email" />
            </UFormField>
            <UFormField label="Primary Color">
              <UInput v-model="settings.primaryColor" type="color" class="h-10" />
            </UFormField>
          </div>
        </div>

        <!-- PayPal Settings -->
        <div class="glass-card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-white flex items-center gap-2">
              <UIcon name="i-lucide-wallet" class="w-5 h-5 text-blue-400" />
              PayPal Checkout
            </h2>
            <UButton
              :color="settings.paypalEnabled ? 'success' : 'neutral'"
              :variant="settings.paypalEnabled ? 'solid' : 'soft'"
              size="sm"
              @click="settings.paypalEnabled = !settings.paypalEnabled"
            >
              {{ settings.paypalEnabled ? 'Enabled' : 'Disabled' }}
            </UButton>
          </div>
          <div class="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-4">
            <p class="text-sm text-blue-300">
              <UIcon name="i-lucide-info" class="w-4 h-4 inline mr-1" />
              PayPal payments will be sent directly to the email address below.
            </p>
          </div>
          <UFormField label="PayPal Email">
            <UInput v-model="settings.paypalEmail" type="email" placeholder="taujob1111@gmail.com" />
          </UFormField>
        </div>

        <!-- SMTP Email Settings -->
        <div class="glass-card p-6">
          <h2 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <UIcon name="i-lucide-mail" class="w-5 h-5 text-purple-400" />
            SMTP Email Settings
          </h2>
          <div class="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 mb-4">
            <p class="text-sm text-purple-300">
              <UIcon name="i-lucide-info" class="w-4 h-4 inline mr-1" />
              Configure SMTP settings to enable email notifications (verification emails, invoice reminders, etc.)
            </p>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <UFormField label="SMTP Host">
              <UInput v-model="settings.smtpHost" placeholder="smtp.gmail.com" />
            </UFormField>
            <UFormField label="SMTP Port">
              <UInput v-model="settings.smtpPort" type="number" placeholder="587" />
            </UFormField>
            <UFormField label="SMTP Username">
              <UInput v-model="settings.smtpUser" placeholder="your-email@gmail.com" />
            </UFormField>
            <UFormField label="SMTP Password">
              <UInput v-model="settings.smtpPass" type="password" placeholder="Your SMTP password or app password" />
            </UFormField>
            <UFormField label="From Address" class="md:col-span-2">
              <UInput v-model="settings.smtpFrom" placeholder="MyPanel <noreply@yourdomain.com>" />
            </UFormField>
          </div>
          <div class="mt-4 flex items-center gap-4">
            <UButton 
              variant="soft" 
              color="purple" 
              icon="i-lucide-send" 
              :loading="testingEmail"
              @click="sendTestEmail"
            >
              Send Test Email
            </UButton>
            <span v-if="testEmailResult" :class="testEmailResult.success ? 'text-green-400' : 'text-red-400'" class="text-sm">
              {{ testEmailResult.message }}
            </span>
          </div>
        </div>


        <!-- Paynow Settings -->
        <div class="glass-card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-white flex items-center gap-2">
              <UIcon name="i-lucide-smartphone" class="w-5 h-5 text-emerald-400" />
              Paynow Integration
            </h2>
            <UButton
              :color="settings.paynowEnabled ? 'success' : 'neutral'"
              :variant="settings.paynowEnabled ? 'solid' : 'soft'"
              size="sm"
              @click="settings.paynowEnabled = !settings.paynowEnabled"
            >
              {{ settings.paynowEnabled ? 'Enabled' : 'Disabled' }}
            </UButton>
          </div>
          <div class="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <p class="text-sm text-emerald-300">
              <UIcon name="i-lucide-info" class="w-4 h-4 inline mr-1" />
              Get your integration keys from <a href="https://developers.paynow.co.zw" target="_blank" class="underline">Paynow Developer Portal</a>
            </p>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <UFormField label="Integration ID">
              <UInput v-model="settings.paynowIntegrationId" placeholder="Your Paynow Integration ID" />
            </UFormField>
            <UFormField label="Integration Key">
              <UInput 
                v-model="settings.paynowIntegrationKey" 
                type="password" 
                placeholder="Your Paynow Integration Key" 
              />
            </UFormField>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end">
          <UButton type="submit" color="primary" size="lg" :loading="saving" icon="i-lucide-check">
            Save Settings
          </UButton>
        </div>
      </form>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'super-admin' })

const toast = useToast()
const saving = ref(false)
const testingEmail = ref(false)
const testEmailResult = ref<{ success: boolean; message: string } | null>(null)

const settings = ref({
  platformName: 'MyPanel',
  platformUrl: '',
  supportEmail: '',
  primaryColor: '#3b82f6',
  // SMTP
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPass: '',
  smtpFrom: '',
  // PayPal
  paypalEmail: 'taujob1111@gmail.com',
  paypalEnabled: true,
  // Paynow
  paynowIntegrationId: '',
  paynowIntegrationKey: '',
  paynowEnabled: false
})

const fetchSettings = async () => {
  const token = localStorage.getItem('auth_token')
  try {
    const data = await $fetch('/api/super-admin/settings', {
      headers: { Authorization: `Bearer ${token}` }
    }) as any
    settings.value = { ...settings.value, ...data }
  } catch (error) {
    console.error('Error fetching settings:', error)
  }
}

const saveSettings = async () => {
  saving.value = true
  const token = localStorage.getItem('auth_token')
  
  try {
    await $fetch('/api/super-admin/settings', {
      method: 'PUT',
      body: settings.value,
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.add({ title: 'Settings saved', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  } finally {
    saving.value = false
  }
}

const sendTestEmail = async () => {
  testingEmail.value = true
  testEmailResult.value = null
  const token = localStorage.getItem('auth_token')
  
  try {
    const result = await $fetch('/api/super-admin/test-email', {
      method: 'POST',
      body: settings.value,
      headers: { Authorization: `Bearer ${token}` }
    }) as any
    testEmailResult.value = { success: true, message: result.message || 'Test email sent!' }
  } catch (error: any) {
    testEmailResult.value = { success: false, message: error.data?.message || 'Failed to send test email' }
  } finally {
    testingEmail.value = false
  }
}


onMounted(fetchSettings)
</script>
