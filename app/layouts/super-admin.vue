<template>
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-white/10 flex flex-col">
      <!-- Logo -->
      <div class="p-6 border-b border-white/10">
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

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          active-class="!text-white !bg-red-500/20 border border-red-500/30"
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
    <main class="flex-1 bg-slate-950 p-8 overflow-auto">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'super-admin'
})

const navItems = [
  { label: 'Dashboard', to: '/super-admin', icon: 'i-lucide-layout-dashboard' },
  { label: 'Organizations', to: '/super-admin/organizations', icon: 'i-lucide-building-2' },
  { label: 'Plans', to: '/super-admin/plans', icon: 'i-lucide-credit-card' },
  { label: 'Settings', to: '/super-admin/settings', icon: 'i-lucide-settings' }
]

const logout = () => {
  localStorage.removeItem('auth_token')
  navigateTo('/login')
}
</script>
