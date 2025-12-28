<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center py-12 px-4">
    <!-- Background Effects -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative w-full max-w-4xl">
      <!-- Logo & Title -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-3 mb-4">
          <img src="/icon.png" alt="MyPanel" class="w-12 h-12 rounded-xl" />
          <span class="text-2xl font-bold text-white">MyPanel</span>
        </NuxtLink>
        <h1 class="text-3xl font-bold text-white">Start Your Free Trial</h1>
        <p class="text-slate-400 mt-2">Create your organization and manage clients, invoices & payments</p>
      </div>

      <!-- Steps -->
      <div class="flex items-center justify-center gap-4 mb-8">
        <div v-for="(stepLabel, i) in ['Plan', 'Details', 'Confirm']" :key="i" class="flex items-center gap-2">
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
            :class="step > i ? 'bg-blue-500 text-white' : step === i ? 'bg-blue-500/20 text-blue-400 ring-2 ring-blue-500' : 'bg-slate-800 text-slate-500'"
          >
            {{ i + 1 }}
          </div>
          <span class="text-sm" :class="step >= i ? 'text-white' : 'text-slate-500'">{{ stepLabel }}</span>
          <UIcon v-if="i < 2" name="i-lucide-chevron-right" class="w-4 h-4 text-slate-600" />
        </div>
      </div>

      <!-- Step 1: Choose Plan -->
      <div v-if="step === 0" class="space-y-6">
        <div class="grid md:grid-cols-3 gap-6">
          <div
            v-for="plan in plans"
            :key="plan.id"
            class="glass-card p-6 cursor-pointer transition-all hover:scale-105 relative"
            :class="[
              selectedPlanId === plan.id ? 'ring-2 ring-blue-500' : '',
              plan.isPopular ? 'border-blue-500/50' : ''
            ]"
            @click="selectedPlanId = plan.id"
          >
            <!-- Most Popular Badge -->
            <div v-if="plan.isPopular" class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-bold uppercase tracking-wider">
              Most Popular
            </div>

            <h3 class="text-xl font-bold text-white mb-2" :class="{ 'mt-2': plan.isPopular }">{{ plan.name }}</h3>
            <p class="text-slate-400 text-sm mb-4 h-12">{{ plan.description }}</p>
            
            <div class="mb-4">
              <p class="text-3xl font-bold text-white">
                ${{ billingCycle === 'MONTHLY' ? Number(plan.monthlyPrice).toFixed(0) : Number(plan.yearlyPrice).toFixed(0) }}
                <span class="text-sm font-normal text-slate-400">/{{ billingCycle === 'MONTHLY' ? 'mo' : 'yr' }}</span>
              </p>
            </div>

            <ul class="space-y-2 text-sm">
              <li v-for="feature in (plan.features || '').split(',')" :key="feature" class="flex items-center gap-2 text-slate-300">
                <UIcon name="i-lucide-check" class="w-4 h-4 text-emerald-400" />
                {{ feature.trim() }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Billing Toggle -->
        <div class="flex items-center justify-center gap-4">
          <span :class="billingCycle === 'MONTHLY' ? 'text-white' : 'text-slate-400'">Monthly</span>
          <button
            class="w-14 h-7 rounded-full p-1 transition-colors"
            :class="billingCycle === 'YEARLY' ? 'bg-blue-500' : 'bg-slate-600'"
            @click="billingCycle = billingCycle === 'MONTHLY' ? 'YEARLY' : 'MONTHLY'"
          >
            <div 
              class="w-5 h-5 rounded-full bg-white transition-transform"
              :class="billingCycle === 'YEARLY' ? 'translate-x-7' : ''"
            ></div>
          </button>
          <span :class="billingCycle === 'YEARLY' ? 'text-white' : 'text-slate-400'">
            Yearly <span class="text-emerald-400">(Save 17%)</span>
          </span>
        </div>

        <div class="text-center">
          <UButton color="primary" size="lg" @click="step = 1" :disabled="!selectedPlanId">
            Continue
          </UButton>
        </div>
      </div>

      <!-- Step 2: Organization & Account Details -->
      <div v-else-if="step === 1" class="glass-card p-8 max-w-lg mx-auto">
        <form @submit.prevent="step = 2" class="space-y-5">
          <h2 class="text-xl font-bold text-white mb-6">Organization Details</h2>
          
          <div class="form-group">
            <label class="form-label">Organization Name *</label>
            <input 
              v-model="form.organizationName" 
              type="text"
              placeholder="Your Company Name" 
              required 
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Your Name *</label>
            <input 
              v-model="form.name" 
              type="text"
              placeholder="John Doe" 
              required 
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Email *</label>
            <input 
              v-model="form.email" 
              type="email" 
              placeholder="you@company.com" 
              required 
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input 
              v-model="form.phone" 
              type="tel"
              placeholder="+263 77 123 4567" 
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Password *</label>
            <input 
              v-model="form.password" 
              type="password" 
              placeholder="Min 8 characters" 
              required 
              minlength="8" 
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Confirm Password *</label>
            <input 
              v-model="form.confirmPassword" 
              type="password" 
              placeholder="Confirm your password" 
              required 
              class="form-input"
            />
            <p v-if="form.password && form.confirmPassword && form.password !== form.confirmPassword" class="text-red-400 text-sm mt-1">
              Passwords don't match
            </p>
          </div>

          <div class="flex justify-between pt-4">
            <UButton variant="ghost" @click="step = 0">Back</UButton>
            <UButton type="submit" color="primary" :disabled="!isStep2Valid">Continue</UButton>
          </div>
        </form>
      </div>

      <!-- Step 3: Confirm -->
      <div v-else-if="step === 2" class="glass-card p-8 max-w-lg mx-auto">
        <h2 class="text-xl font-bold text-white mb-6">Review & Confirm</h2>
        
        <div class="space-y-4 mb-6">
          <div class="p-4 rounded-xl bg-white/5 border border-white/10">
            <p class="text-sm text-slate-400 mb-1">Organization</p>
            <p class="text-lg font-semibold text-white">{{ form.organizationName }}</p>
          </div>
          <div class="p-4 rounded-xl bg-white/5 border border-white/10">
            <p class="text-sm text-slate-400 mb-1">Admin</p>
            <p class="text-lg font-semibold text-white">{{ form.name }}</p>
            <p class="text-sm text-slate-400">{{ form.email }}</p>
          </div>
          <div class="p-4 rounded-xl bg-white/5 border border-white/10">
            <p class="text-sm text-slate-400 mb-1">Plan</p>
            <p class="text-lg font-semibold text-white">{{ selectedPlan?.name }}</p>
            <p class="text-sm text-slate-400">Billed {{ billingCycle.toLowerCase() }}</p>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
          <p class="text-sm text-emerald-300">
            <UIcon name="i-lucide-check-circle" class="w-4 h-4 inline mr-2" />
            You'll start with a <strong>14-day free trial</strong>. No credit card required!
          </p>
        </div>

        <div v-if="error" class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
          <p class="text-sm text-red-300">{{ error }}</p>
        </div>

        <div class="flex justify-between">
          <UButton variant="ghost" @click="step = 1">Back</UButton>
          <UButton color="primary" size="lg" :loading="loading" @click="signup">
            Create Account
          </UButton>
        </div>
      </div>

      <!-- Step 4: Check Email (Success) -->
      <div v-else-if="step === 3" class="glass-card p-8 max-w-lg mx-auto text-center">
        <div class="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
          <UIcon name="i-lucide-mail-check" class="w-12 h-12 text-blue-400" />
        </div>
        <h2 class="text-2xl font-bold text-white mb-4">Check Your Email! 📧</h2>
        <p class="text-slate-400 mb-6">
          We've sent a verification link to<br>
          <strong class="text-white">{{ form.email }}</strong>
        </p>
        
        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6 text-left">
          <p class="text-sm text-amber-300">
            <UIcon name="i-lucide-info" class="w-4 h-4 inline mr-2" />
            <strong>Click the link in your email to verify your account.</strong><br>
            The link expires in 24 hours.
          </p>
        </div>
        
        <p class="text-slate-500 text-sm mb-6">
          Didn't receive the email? Check your spam folder or 
          <button @click="resendVerification" class="text-blue-400 hover:underline" :disabled="resending">
            {{ resending ? 'Sending...' : 'click here to resend' }}
          </button>
        </p>
        
        <NuxtLink to="/login">
          <UButton variant="outline" color="neutral">
            Go to Login
          </UButton>
        </NuxtLink>
      </div>

      <!-- Footer -->
      <p class="text-center text-slate-400 text-sm mt-8">
        Already have an account? 
        <NuxtLink to="/login" class="text-blue-400 hover:underline">Sign in</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const toast = useToast()
const { fetchUser } = useAuth()

onMounted(() => {
  fetchPlans()
})

const step = ref(0)
const plans = ref<any[]>([])
const selectedPlanId = ref<number | null>(null)
const billingCycle = ref<'MONTHLY' | 'YEARLY'>('MONTHLY')
const loading = ref(false)
const error = ref('')

const form = ref({
  organizationName: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const selectedPlan = computed(() => plans.value.find(p => p.id === selectedPlanId.value))

const isStep2Valid = computed(() => {
  return form.value.organizationName &&
    form.value.name &&
    form.value.email &&
    form.value.password &&
    form.value.password.length >= 8 &&
    form.value.password === form.value.confirmPassword
})

const fetchPlans = async () => {
  try {
    plans.value = await $fetch('/api/public/plans') as any[]
    if (plans.value.length > 0) {
      selectedPlanId.value = plans.value[0].id
    }
  } catch (err) {
    console.error('Error fetching plans:', err)
  }
}

const signup = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await $fetch('/api/public/signup', {
      method: 'POST',
      body: {
        organizationName: form.value.organizationName,
        name: form.value.name,
        email: form.value.email,
        phone: form.value.phone,
        password: form.value.password,
        planId: selectedPlanId.value,
        billingCycle: billingCycle.value
      }
    })
    
    // Show success message and redirect to check-email page
    step.value = 3 // Show success state
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to create account. Please try again.'
  } finally {
    loading.value = false
  }
}

const resending = ref(false)

const resendVerification = async () => {
  resending.value = true
  try {
    await $fetch('/api/public/resend-verification', {
      method: 'POST',
      body: { email: form.value.email }
    })
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
  padding: 0.875rem 1rem;
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
</style>
