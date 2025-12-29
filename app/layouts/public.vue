<template>
  <div class="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <NuxtLink to="/" class="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src="/icon.png" alt="MyPanel" class="w-10 h-10 rounded-xl" />
            <span class="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">MyPanel</span>
          </NuxtLink>
          
          <div class="hidden md:flex items-center gap-8">
            <NuxtLink to="/features" class="text-slate-300 hover:text-white transition-colors" active-class="text-white font-medium">Features</NuxtLink>
            <NuxtLink to="/pricing" class="text-slate-300 hover:text-white transition-colors" active-class="text-white font-medium">Pricing</NuxtLink>
            <NuxtLink to="/how-it-works" class="text-slate-300 hover:text-white transition-colors" active-class="text-white font-medium">How It Works</NuxtLink>
          </div>
          
          <div class="flex items-center gap-4">
            <NuxtLink to="/login" class="text-slate-300 hover:text-white transition-colors">Sign In</NuxtLink>
            <NuxtLink to="/signup">
              <UButton color="primary" size="sm">Get Started</UButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <main class="pt-16">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center gap-3 mb-6">
              <img src="/icon.png" alt="MyPanel" class="w-8 h-8 rounded-lg" />
              <span class="font-bold text-white text-lg">MyPanel</span>
            </div>
            <p class="text-slate-400 max-w-sm mb-6">
              The professional client and service management platform for freelancers, agencies, and small businesses.
            </p>
            <div class="flex items-center gap-4">
              <a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <UIcon name="i-lucide-twitter" class="w-5 h-5 text-slate-400" />
              </a>
              <a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <UIcon name="i-lucide-github" class="w-5 h-5 text-slate-400" />
              </a>
              <a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <UIcon name="i-lucide-linkedin" class="w-5 h-5 text-slate-400" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 class="text-white font-semibold mb-6">Product</h4>
            <ul class="space-y-4 text-sm text-slate-400">
              <li><NuxtLink to="/features" class="hover:text-white">Features</NuxtLink></li>
              <li><NuxtLink to="/pricing" class="hover:text-white">Pricing</NuxtLink></li>
              <li><NuxtLink to="/how-it-works" class="hover:text-white">How It Works</NuxtLink></li>
            </ul>
          </div>
          
          <div>
            <h4 class="text-white font-semibold mb-6">Legal</h4>
            <ul class="space-y-4 text-sm text-slate-400">
              <li><NuxtLink to="/privacy" class="hover:text-white">Privacy Policy</NuxtLink></li>
              <li><NuxtLink to="/terms" class="hover:text-white">Terms of Service</NuxtLink></li>
              <li><NuxtLink to="/contact" class="hover:text-white">Contact Us</NuxtLink></li>
            </ul>
          </div>
        </div>
        
        <div class="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-sm text-slate-500">
            © {{ new Date().getFullYear() }} MyPanel. All rights reserved. 
            <span class="mx-1">•</span>
            Developed by <a href="https://wecode.co.zw" class="text-blue-400 group relative">
              WeCode Zimbabwe
              <span class="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-400 transition-all group-hover:w-full"></span>
            </a>
          </p>
          <div class="flex items-center gap-6">
             <span class="flex items-center gap-1.5 text-xs text-slate-500">
               <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               System Operational
             </span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
/* Global styles for public pages */
.glass-card {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
}

.gradient-text {
  background: linear-gradient(to right, #60a5fa, #22d3ee);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
</style>
