<template>
  <div class="min-h-screen flex flex-col lg:flex-row">
    <!-- Mobile Header -->
    <header class="lg:hidden bg-gradient-to-r from-slate-900 to-slate-800 border-b border-white/10 p-4 flex items-center justify-between sticky top-0 z-40">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
          <UIcon name="i-lucide-shield" class="w-4 h-4 text-white" />
        </div>
        <div>
          <span class="text-lg font-bold text-white">MyPanel</span>
          <p class="text-xs text-red-400">Super Admin</p>
        </div>
      </div>
      <UButton
        :icon="isSidebarOpen ? 'i-lucide-x' : 'i-lucide-menu'"
        color="neutral"
        variant="ghost"
        size="lg"
        @click="isSidebarOpen = !isSidebarOpen"
      />
    </header>

    <!-- Mobile Sidebar Overlay -->
    <div
      v-if="isSidebarOpen"
      class="lg:hidden fixed inset-0 bg-black/70 z-[55]"
      @click="isSidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed lg:relative inset-y-0 left-0 z-[60]',
        'w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-white/10 flex flex-col',
        'transform transition-transform duration-300 ease-in-out',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Logo (hidden on mobile, shown in header) -->
      <div class="hidden lg:block p-4 border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <UIcon name="i-lucide-shield" class="w-6 h-6 text-white" />
          </div>
          <div>
            <span class="text-lg font-bold text-white">MyPanel</span>
            <p class="text-xs text-red-400">Super Admin</p>
          </div>
        </div>
      </div>

      <!-- Mobile Logo Header -->
      <div class="lg:hidden p-4 border-b border-white/10 flex items-center justify-between">
        <span class="text-lg font-bold text-white">Menu</span>
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="isSidebarOpen = false"
        />
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
          active-class="!text-white !bg-red-500/20 border border-red-500/30"
          @click="isSidebarOpen = false"
        >
          <UIcon :name="item.icon" class="w-5 h-5" />
          <span class="font-medium">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- User -->
      <div class="p-4 border-t border-white/10">
        <div class="flex items-center gap-3 px-4 py-3">
          <div class="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <UIcon name="i-lucide-user" class="w-5 h-5 text-red-400" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">Super Admin</p>
            <p class="text-xs text-slate-400">Platform Owner</p>
          </div>
        </div>
        <UButton
          variant="ghost"
          color="error"
          class="w-full mt-2"
          icon="i-lucide-log-out"
          @click="logout"
        >
          Logout
        </UButton>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 bg-slate-950 p-4 lg:p-8 overflow-auto min-w-0">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'super-admin'
})

const isSidebarOpen = ref(false)

// Close sidebar on route change
const route = useRoute()
watch(() => route.path, () => {
  isSidebarOpen.value = false
})

const navItems = [
  { label: 'Dashboard', to: '/super-admin', icon: 'i-lucide-layout-dashboard' },
  { label: 'Organizations', to: '/super-admin/organizations', icon: 'i-lucide-building-2' },
  { label: 'Users', to: '/super-admin/users', icon: 'i-lucide-users' },
  { label: 'Plans', to: '/super-admin/plans', icon: 'i-lucide-credit-card' },
  { label: 'Payments', to: '/super-admin/payments', icon: 'i-lucide-receipt' },
  { label: 'Email Logs', to: '/super-admin/email-logs', icon: 'i-lucide-mail' },
  { label: 'Settings', to: '/super-admin/settings', icon: 'i-lucide-settings' }
]

const logout = () => {
  localStorage.removeItem('auth_token')
  navigateTo('/login')
}
</script>
