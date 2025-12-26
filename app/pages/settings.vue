<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-white">Settings</h1>
      <p class="text-slate-400 mt-1">Configure your company details and preferences</p>
    </div>

    <!-- Settings Tabs -->
    <UTabs :items="tabs" class="w-full">
      <template #company>
        <div class="glass-card p-6 mt-4">
          <h2 class="text-lg font-semibold text-white mb-6">Company Information</h2>
          
          <form @submit.prevent="saveSettings" class="space-y-6">
            <!-- Logo Upload -->
            <div class="flex items-start gap-6">
              <div class="relative group">
                <div class="w-28 h-28 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-600 group-hover:border-blue-500 transition-colors">
                  <img v-if="settings.logoUrl" :src="settings.logoUrl" alt="Logo" class="w-full h-full object-contain p-2" />
                  <div v-else class="text-center">
                    <UIcon name="i-lucide-image-plus" class="w-10 h-10 text-slate-500 mx-auto" />
                    <p class="text-xs text-slate-500 mt-1">No logo</p>
                  </div>
                </div>
                <div v-if="uploading" class="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                  <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-white animate-spin" />
                </div>
              </div>
              <div class="flex-1">
                <p class="font-semibold text-white text-lg">Company Logo</p>
                <p class="text-sm text-slate-400 mb-4">Upload your logo for invoices and quotations. Recommended size: 200x200px</p>
                
                <div class="flex items-center gap-3">
                  <label class="cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      class="hidden" 
                      @change="uploadLogo"
                      ref="fileInput"
                    />
                    <div class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                      <UIcon name="i-lucide-upload" class="w-4 h-4" />
                      Upload Logo
                    </div>
                  </label>
                  <UButton 
                    v-if="settings.logoUrl" 
                    variant="soft" 
                    color="error" 
                    size="sm"
                    icon="i-lucide-trash-2"
                    @click="removeLogo"
                  >
                    Remove
                  </UButton>
                </div>
                
                <p class="text-xs text-slate-500 mt-2">Accepts: PNG, JPG, SVG (max 2MB)</p>
                
                <!-- Or enter URL manually -->
                <div class="mt-4">
                  <p class="text-xs text-slate-400 mb-1">Or enter logo URL manually:</p>
                  <UInput v-model="settings.logoUrl" placeholder="https://example.com/logo.png" class="w-full" />
                </div>
              </div>
            </div>

            <USeparator />

            <div class="grid grid-cols-2 gap-6">
              <UFormField label="Company Name *" name="companyName">
                <UInput v-model="settings.companyName" placeholder="Your Company Name" required />
              </UFormField>
              <UFormField label="Company Email" name="companyEmail">
                <UInput v-model="settings.companyEmail" type="email" placeholder="company@example.com" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-6">
              <UFormField label="Phone" name="companyPhone">
                <UInput v-model="settings.companyPhone" placeholder="+1 234 567 890" />
              </UFormField>
              <UFormField label="Website" name="companyWebsite">
                <UInput v-model="settings.companyWebsite" placeholder="https://yourwebsite.com" />
              </UFormField>
            </div>

            <UFormField label="Address" name="companyAddress">
              <UTextarea v-model="settings.companyAddress" placeholder="Street address" rows="2" />
            </UFormField>

            <div class="grid grid-cols-4 gap-4">
              <UFormField label="City" name="companyCity">
                <UInput v-model="settings.companyCity" placeholder="City" />
              </UFormField>
              <UFormField label="State" name="companyState">
                <UInput v-model="settings.companyState" placeholder="State" />
              </UFormField>
              <UFormField label="ZIP Code" name="companyZip">
                <UInput v-model="settings.companyZip" placeholder="12345" />
              </UFormField>
              <UFormField label="Country" name="companyCountry">
                <UInput v-model="settings.companyCountry" placeholder="Country" />
              </UFormField>
            </div>

            <UFormField label="Tax ID / VAT Number" name="companyTaxId">
              <UInput v-model="settings.companyTaxId" placeholder="Tax identification number" class="w-1/2" />
            </UFormField>

            <div class="flex justify-end">
              <UButton type="submit" color="primary" :loading="saving">
                Save Changes
              </UButton>
            </div>
          </form>
        </div>
      </template>

      <template #invoicing>
        <div class="glass-card p-6 mt-4">
          <h2 class="text-lg font-semibold text-white mb-6">Invoice Settings</h2>
          
          <form @submit.prevent="saveSettings" class="space-y-6">
            <div class="grid grid-cols-3 gap-6">
              <UFormField label="Invoice Prefix" name="invoicePrefix">
                <UInput v-model="settings.invoicePrefix" placeholder="INV-" />
              </UFormField>
              <UFormField label="Quote Prefix" name="quotePrefix">
                <UInput v-model="settings.quotePrefix" placeholder="QUO-" />
              </UFormField>
              <UFormField label="Default Tax Rate (%)" name="taxRate">
                <UInput v-model="settings.taxRate" type="number" step="0.01" placeholder="0.00" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-6">
              <UFormField label="Currency" name="currency">
                <USelect v-model="settings.currency" :items="currencyOptions" />
              </UFormField>
              <UFormField label="Currency Symbol" name="currencySymbol">
                <UInput v-model="settings.currencySymbol" placeholder="$" class="w-20" />
              </UFormField>
            </div>

            <UFormField label="Bank/Payment Details" name="bankDetails">
              <UTextarea v-model="settings.bankDetails" placeholder="Bank account details for payments..." rows="4" />
            </UFormField>

            <UFormField label="Default Payment Terms" name="paymentTerms">
              <UTextarea v-model="settings.paymentTerms" placeholder="Payment is due within 14 days..." rows="3" />
            </UFormField>

            <UFormField label="Default Invoice Notes" name="invoiceNotes">
              <UTextarea v-model="settings.invoiceNotes" placeholder="Notes to appear on all invoices..." rows="2" />
            </UFormField>

            <UFormField label="Invoice Footer" name="invoiceFooter">
              <UTextarea v-model="settings.invoiceFooter" placeholder="Thank you for your business!" rows="2" />
            </UFormField>

            <div class="flex justify-end">
              <UButton type="submit" color="primary" :loading="saving">
                Save Changes
              </UButton>
            </div>
          </form>
        </div>
      </template>

      <template #reminders>
        <div class="glass-card p-6 mt-4">
          <h2 class="text-lg font-semibold text-white mb-6">Email Reminder Settings</h2>
          
          <form @submit.prevent="saveSettings" class="space-y-6">
            <div class="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-6">
              <p class="text-blue-300 text-sm">
                <UIcon name="i-lucide-info" class="w-4 h-4 inline mr-1" />
                Configure when you and your clients receive payment reminders. Reminders are sent automatically every day at 8:00 AM.
              </p>
            </div>

            <UFormField label="Reminder Days (before due date)" name="reminderDays">
              <UInput v-model="settings.reminderDays" placeholder="14,7,3,1" />
              <template #hint>
                <span class="text-slate-400 text-xs">Comma-separated list of days before due date to send reminders (e.g., 14,7,3,1)</span>
              </template>
            </UFormField>

            <UFormField label="Overdue Notice Days (after due date)" name="overdueDays">
              <UInput v-model="settings.overdueDays" placeholder="1,3,7,14" />
              <template #hint>
                <span class="text-slate-400 text-xs">Comma-separated list of days after due date to send overdue notices</span>
              </template>
            </UFormField>

            <UFormField label="Auto-suspend after (days overdue)" name="autoSuspendDays">
              <UInput v-model="settings.autoSuspendDays" type="number" placeholder="14" class="w-40" />
              <template #hint>
                <span class="text-slate-400 text-xs">Automatically suspend services after this many days overdue (0 to disable)</span>
              </template>
            </UFormField>

            <div class="flex justify-end">
              <UButton type="submit" color="primary" :loading="saving">
                Save Changes
              </UButton>
            </div>
          </form>
        </div>
      </template>

      <template #email>
        <div class="glass-card p-6 mt-4">
          <h2 class="text-lg font-semibold text-white mb-6">Email Configuration (SMTP)</h2>
          
          <form @submit.prevent="saveSettings" class="space-y-6">
            <div class="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-6">
              <p class="text-amber-300 text-sm">
                <UIcon name="i-lucide-alert-triangle" class="w-4 h-4 inline mr-1" />
                Configure SMTP settings to enable email notifications. For Gmail, use an App Password instead of your regular password.
              </p>
            </div>

            <div class="grid grid-cols-2 gap-6">
              <UFormField label="SMTP Host" name="smtpHost">
                <UInput v-model="settings.smtpHost" placeholder="smtp.gmail.com" />
              </UFormField>
              <UFormField label="SMTP Port" name="smtpPort">
                <UInput v-model="settings.smtpPort" type="number" placeholder="587" />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-6">
              <UFormField label="SMTP Username" name="smtpUser">
                <UInput v-model="settings.smtpUser" placeholder="your-email@gmail.com" />
              </UFormField>
              <UFormField label="SMTP Password" name="smtpPass">
                <UInput v-model="settings.smtpPass" type="password" placeholder="••••••••" />
              </UFormField>
            </div>

            <UFormField label="From Address" name="smtpFrom">
              <UInput v-model="settings.smtpFrom" placeholder="MyPanel <noreply@yourcompany.com>" />
            </UFormField>

            <div class="flex justify-between">
              <UButton variant="soft" color="success" @click="testEmail" :loading="testingEmail">
                <UIcon name="i-lucide-send" class="w-4 h-4 mr-2" />
                {{ testingEmail ? 'Sending...' : 'Send Test Email' }}
              </UButton>
              <UButton type="submit" color="primary" :loading="saving">
                Save Changes
              </UButton>
            </div>
          </form>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const toast = useToast()
const { hasPermission, isAdmin } = useAuth()

const saving = ref(false)
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const settings = ref({
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  companyAddress: '',
  companyCity: '',
  companyState: '',
  companyZip: '',
  companyCountry: '',
  companyWebsite: '',
  companyTaxId: '',
  logoUrl: '',
  invoicePrefix: 'INV-',
  quotePrefix: 'QUO-',
  currency: 'USD',
  currencySymbol: '$',
  taxRate: 0,
  paymentTerms: '',
  invoiceNotes: '',
  invoiceFooter: '',
  bankDetails: '',
  reminderDays: '14,7,3,1',
  overdueDays: '1,3,7,14',
  autoSuspendDays: 14,
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  smtpFrom: ''
})

const tabs = [
  { label: 'Company', slot: 'company', icon: 'i-lucide-building' },
  { label: 'Invoicing', slot: 'invoicing', icon: 'i-lucide-file-text' },
  { label: 'Reminders', slot: 'reminders', icon: 'i-lucide-bell' },
  { label: 'Email (SMTP)', slot: 'email', icon: 'i-lucide-mail' }
]

const currencyOptions = [
  { label: 'USD - US Dollar', value: 'USD' },
  { label: 'EUR - Euro', value: 'EUR' },
  { label: 'GBP - British Pound', value: 'GBP' },
  { label: 'CAD - Canadian Dollar', value: 'CAD' },
  { label: 'AUD - Australian Dollar', value: 'AUD' },
  { label: 'ZAR - South African Rand', value: 'ZAR' },
  { label: 'NGN - Nigerian Naira', value: 'NGN' },
  { label: 'KES - Kenyan Shilling', value: 'KES' },
  { label: 'INR - Indian Rupee', value: 'INR' }
]

const fetchSettings = async () => {
  try {
    const data = await $fetch('/api/settings')
    settings.value = { ...settings.value, ...data }
  } catch (error) {
    console.error('Error fetching settings:', error)
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    await $fetch('/api/settings', {
      method: 'PUT',
      body: settings.value
    })
    toast.add({ title: 'Settings saved successfully', color: 'success' })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to save settings',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

const testingEmail = ref(false)

const testEmail = async () => {
  // First save the settings
  if (!settings.value.smtpHost || !settings.value.smtpUser || !settings.value.smtpPass) {
    toast.add({ 
      title: 'Missing SMTP Settings', 
      description: 'Please fill in SMTP Host, Username, and Password first', 
      color: 'warning' 
    })
    return
  }

  // Save settings first
  await saveSettings()

  testingEmail.value = true
  try {
    const response = await $fetch('/api/settings/test-email', {
      method: 'POST',
      body: { testEmail: settings.value.companyEmail || settings.value.smtpUser }
    })
    
    toast.add({ 
      title: '✅ Test Email Sent!', 
      description: `Email sent to ${response.recipient}. Check your inbox!`, 
      color: 'success' 
    })
  } catch (error: any) {
    toast.add({ 
      title: 'Email Test Failed', 
      description: error.data?.message || 'Failed to send test email', 
      color: 'error' 
    })
  } finally {
    testingEmail.value = false
  }
}

const uploadLogo = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.add({ title: 'Error', description: 'Please select an image file', color: 'error' })
    return
  }

  // Validate file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    toast.add({ title: 'Error', description: 'File size must be less than 2MB', color: 'error' })
    return
  }

  uploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('logo', file)

    const response = await $fetch('/api/upload/logo', {
      method: 'POST',
      body: formData
    })

    settings.value.logoUrl = response.logoUrl
    toast.add({ title: 'Logo uploaded successfully', color: 'success' })
  } catch (error: any) {
    toast.add({ 
      title: 'Upload failed', 
      description: error.data?.message || 'Failed to upload logo', 
      color: 'error' 
    })
  } finally {
    uploading.value = false
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const removeLogo = async () => {
  settings.value.logoUrl = ''
  try {
    await $fetch('/api/settings', {
      method: 'PUT',
      body: { ...settings.value, logoUrl: '' }
    })
    toast.add({ title: 'Logo removed', color: 'success' })
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to remove logo', color: 'error' })
  }
}

onMounted(fetchSettings)
</script>


