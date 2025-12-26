<template>
  <div></div>
</template>

<script setup lang="ts">
// Redirect to dashboard or login
definePageMeta({
  layout: false
})

onMounted(() => {
  navigateTo('/dashboard')
})
</script>
