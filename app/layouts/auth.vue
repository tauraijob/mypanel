<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <!-- Background Effects -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-md">
      <slot />
    </div>
  </div>
</template>


