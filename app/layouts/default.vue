<template>
  <div class="min-h-screen flex flex-col lg:flex-row">
    <!-- Mobile Header -->
    <header class="lg:hidden glass-card m-2 mb-0 p-4 flex items-center justify-between sticky top-0 z-40">
      <NuxtLink to="/dashboard" class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <UIcon name="i-lucide-layout-dashboard" class="w-4 h-4 text-white" />
        </div>
        <span class="text-lg font-bold gradient-text">MyPanel</span>
      </NuxtLink>
      <UButton
        :icon="isSidebarOpen ? 'i-lucide-x' : 'i-lucide-menu'"
        color="neutral"
        variant="ghost"
        size="lg"
        @click="isSidebarOpen = !isSidebarOpen"
      />
    </header>

    <!-- Mobile Sidebar Overlay -->
    <Teleport to="body">
      <div
        v-if="isSidebarOpen"
        class="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        @click="isSidebarOpen = false"
      />
    </Teleport>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed lg:relative inset-y-0 left-0 z-50',
        'w-64 flex flex-col',
        'transform transition-transform duration-300 ease-in-out',
        'bg-slate-900 lg:bg-transparent lg:glass-card lg:m-3 lg:mr-0',
        'border-r border-white/10 lg:border',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Logo (hidden on mobile, shown in header) -->
      <div class="hidden lg:block p-4 border-b border-white/10">
        <NuxtLink to="/dashboard" class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <UIcon name="i-lucide-layout-dashboard" class="w-6 h-6 text-white" />
          </div>
          <span class="text-xl font-bold gradient-text">MyPanel</span>
        </NuxtLink>
      </div>

      <!-- Mobile Logo Header -->
      <div class="lg:hidden p-4 border-b border-white/10 flex items-center justify-between">
        <span class="text-lg font-bold gradient-text">Menu</span>
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
        <!-- Loading skeleton -->
        <template v-if="loading">
          <div v-for="i in 6" :key="i" class="flex items-center gap-3 px-3 py-2">
            <div class="w-5 h-5 rounded bg-white/10 animate-pulse"></div>
            <div class="h-4 w-24 rounded bg-white/10 animate-pulse"></div>
          </div>
        </template>
        
        <!-- Navigation items -->
        <template v-else>
          <template v-for="item in navigation" :key="item.to">
            <NuxtLink
              v-if="canAccessRoute(item.permission)"
              :to="item.to"
              class="sidebar-item flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white transition-colors text-sm"
              active-class="active text-white"
              @click="isSidebarOpen = false"
            >
              <UIcon :name="item.icon" class="w-5 h-5" />
              <span class="font-medium">{{ item.label }}</span>
              <UBadge v-if="item.badge" :color="item.badgeColor" size="sm" class="ml-auto">
                {{ item.badge }}
              </UBadge>
            </NuxtLink>
          </template>
        </template>
      </nav>

      <!-- User Section -->
      <div class="p-4 border-t border-white/10">
        <div class="flex items-center gap-3 px-4 py-3">
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            :class="getRoleGradient(user?.role)"
          >
            <UIcon name="i-lucide-user" class="w-5 h-5 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ user?.name || 'User' }}</p>
            <p class="text-xs text-slate-400 truncate">{{ getRoleLabel(user?.role) }}</p>
          </div>
          <UButton
            icon="i-lucide-log-out"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="handleLogout"
          />
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-3 lg:p-6 overflow-auto min-w-0">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, loading, logout, hasPermission, fetchUser } = useAuth()

const isSidebarOpen = ref(false)

// Close sidebar on route change
const route = useRoute()
watch(() => route.path, () => {
  isSidebarOpen.value = false
})

// Fetch user on layout mount and redirect if not authenticated
onMounted(async () => {
  await fetchUser()
  // If still no user after fetch, redirect to login
  if (!user.value) {
    navigateTo('/login')
  }
})

interface NavItem {
  to: string
  label: string
  icon: string
  permission?: string
  badge?: string
  badgeColor?: 'error' | 'success' | 'warning' | 'primary' | 'neutral'
}

const navigation: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: 'i-lucide-layout-dashboard', permission: 'dashboard.view' },
  { to: '/clients', label: 'Clients', icon: 'i-lucide-users', permission: 'clients.view' },
  { to: '/services', label: 'Services', icon: 'i-lucide-server', permission: 'services.view' },
  { to: '/categories', label: 'Categories', icon: 'i-lucide-folder', permission: 'settings.view' },
  { to: '/invoices', label: 'Invoices', icon: 'i-lucide-file-text', permission: 'invoices.view' },
  { to: '/quotations', label: 'Quotations', icon: 'i-lucide-file-check', permission: 'quotations.view' },
  { to: '/payments', label: 'Payments', icon: 'i-lucide-credit-card', permission: 'payments.view' },
  { to: '/email-logs', label: 'Email Logs', icon: 'i-lucide-mail', permission: 'email-logs.view' },
  { to: '/users', label: 'Users', icon: 'i-lucide-users-2', permission: 'users.view' },
  { to: '/settings', label: 'Settings', icon: 'i-lucide-settings', permission: 'settings.view' },
  { to: '/billing', label: 'Billing', icon: 'i-lucide-wallet' }
]

const canAccessRoute = (permission?: string): boolean => {
  if (!permission) return true
  return hasPermission(permission)
}

const getRoleGradient = (role?: string) => {
  switch (role) {
    case 'ADMIN': return 'bg-gradient-to-br from-red-500 to-rose-600'
    case 'SALES': return 'bg-gradient-to-br from-blue-500 to-cyan-500'
    case 'SUPPORT': return 'bg-gradient-to-br from-amber-500 to-orange-500'
    case 'VIEWER': return 'bg-gradient-to-br from-slate-500 to-slate-600'
    default: return 'bg-gradient-to-br from-blue-500 to-cyan-500'
  }
}

const getRoleLabel = (role?: string) => {
  switch (role) {
    case 'ADMIN': return 'Administrator'
    case 'SALES': return 'Sales Team'
    case 'SUPPORT': return 'Support Team'
    case 'VIEWER': return 'Viewer'
    default: return 'User'
  }
}

const handleLogout = () => {
  logout()
}
</script>
