<template>
  <div class="space-y-6">
    <NuxtLayout name="super-admin">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-white">Platform Users</h1>
          <p class="text-slate-400 mt-1">View all organization administrators</p>
        </div>
        <UButton color="neutral" variant="soft" icon="i-lucide-refresh-cw" @click="fetchUsers" :loading="loading">
          Refresh
        </UButton>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="glass-card p-5">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <UIcon name="i-lucide-users" class="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-white">{{ users.length }}</p>
              <p class="text-sm text-slate-400">Total Users</p>
            </div>
          </div>
        </div>
        <div class="glass-card p-5">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-emerald-400">{{ activeCount }}</p>
              <p class="text-sm text-slate-400">Active</p>
            </div>
          </div>
        </div>
        <div class="glass-card p-5">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <UIcon name="i-lucide-shield" class="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-purple-400">{{ adminCount }}</p>
              <p class="text-sm text-slate-400">Admins</p>
            </div>
          </div>
        </div>
        <div class="glass-card p-5">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <UIcon name="i-lucide-building-2" class="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p class="text-2xl font-bold text-amber-400">{{ uniqueOrgs }}</p>
              <p class="text-sm text-slate-400">Organizations</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="glass-card p-4 mb-6">
        <div class="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div class="relative flex-1 sm:flex-none sm:w-72">
            <UIcon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
            <UInput
              v-model="search"
              placeholder="Search by name or email..."
              class="w-full"
              :ui="{ base: 'pl-10' }"
            />
          </div>
          <div class="flex gap-2 overflow-x-auto pb-1 -mb-1">
            <button
              v-for="filter in roleFilters"
              :key="filter.value"
              class="px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shrink-0"
              :class="roleFilter === filter.value 
                ? 'bg-sky-500 text-white' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'"
              @click="roleFilter = filter.value"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="glass-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[800px]">
            <thead>
              <tr class="border-b border-white/10">
                <th class="text-left p-4 text-slate-400 font-medium">User</th>
                <th class="text-left p-4 text-slate-400 font-medium">Organization</th>
                <th class="text-left p-4 text-slate-400 font-medium">Role</th>
                <th class="text-left p-4 text-slate-400 font-medium">Status</th>
                <th class="text-left p-4 text-slate-400 font-medium">Last Login</th>
                <th class="text-left p-4 text-slate-400 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in filteredUsers"
                :key="user.id"
                class="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {{ user.name?.charAt(0)?.toUpperCase() || 'U' }}
                    </div>
                    <div>
                      <p class="text-white font-medium">{{ user.name }}</p>
                      <p class="text-sm text-slate-400">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  <NuxtLink 
                    v-if="user.organization"
                    :to="`/super-admin/organizations/${user.organization.id}`"
                    class="text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    {{ user.organization.name }}
                  </NuxtLink>
                  <span v-else class="text-slate-500">—</span>
                </td>
                <td class="p-4">
                  <span 
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    :class="getRoleBadgeClass(user.role)"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="p-4">
                  <span
                    class="px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                    :class="user.isActive 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="user.isActive ? 'bg-emerald-400' : 'bg-rose-400'"></span>
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="p-4 text-slate-400 text-sm">
                  {{ user.lastLogin ? formatDate(user.lastLogin) : 'Never' }}
                </td>
                <td class="p-4 text-slate-400 text-sm">
                  {{ formatDate(user.createdAt) }}
                </td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="6" class="p-8 text-center text-slate-400">
                  <UIcon name="i-lucide-users" class="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No users found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

definePageMeta({
  layout: false
})

const loading = ref(false)
const users = ref<any[]>([])
const search = ref('')
const roleFilter = ref('')

const roleFilters = [
  { label: 'All', value: '' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Support', value: 'SUPPORT' },
  { label: 'Viewer', value: 'VIEWER' }
]

const activeCount = computed(() => users.value.filter(u => u.isActive).length)
const adminCount = computed(() => users.value.filter(u => u.role === 'ADMIN').length)
const uniqueOrgs = computed(() => new Set(users.value.map(u => u.organization?.id).filter(Boolean)).size)

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesSearch = !search.value || 
      user.name?.toLowerCase().includes(search.value.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.value.toLowerCase())
    const matchesRole = !roleFilter.value || user.role === roleFilter.value
    return matchesSearch && matchesRole
  })
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('auth_token')
    users.value = await $fetch('/api/super-admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => format(new Date(date), 'MMM d, yyyy')

const getRoleBadgeClass = (role: string) => {
  const classes: Record<string, string> = {
    ADMIN: 'bg-purple-500/20 text-purple-400',
    MANAGER: 'bg-blue-500/20 text-blue-400',
    SUPPORT: 'bg-teal-500/20 text-teal-400',
    VIEWER: 'bg-slate-500/20 text-slate-400'
  }
  return classes[role] || 'bg-slate-500/20 text-slate-400'
}

onMounted(fetchUsers)
</script>
