<template>
  <div class="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-blue-500/30">
    <!-- Navbar -->
    <header class="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            P
          </div>
          <span class="font-bold text-lg tracking-tight text-white">Client Portal</span>
        </div>
        
        <div class="flex items-center gap-4">
          <span class="text-sm text-slate-400">Welcome back</span>
          <UButton 
            color="neutral" 
            variant="ghost" 
            icon="i-lucide-log-out"
            @click="logout"
          >
            Logout
          </UButton>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-white/5 py-8 mt-auto">
      <div class="container mx-auto px-4 text-center text-slate-500 text-sm">
        <p>&copy; {{ new Date().getFullYear() }} Powered by MyPanel</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

// We need a specific useClientAuth composable or similar
// For now, simple clear token
const logout = () => {
  const token = useCookie('client_token')
  token.value = null
  router.push('/portal/login')
}
</script>


