<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">User Management</h1>
        <p class="text-slate-400 mt-1">Manage system users and their access levels</p>
      </div>
      <UButton color="primary" icon="i-lucide-user-plus" @click="openModal()">
        Add User
      </UButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-xl bg-blue-500/10">
            <UIcon name="i-lucide-users" class="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-white">{{ stats.total }}</p>
            <p class="text-slate-400 text-sm">Total Users</p>
          </div>
        </div>
      </div>
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-xl bg-red-500/10">
            <UIcon name="i-lucide-shield" class="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-white">{{ stats.admins }}</p>
            <p class="text-slate-400 text-sm">Administrators</p>
          </div>
        </div>
      </div>
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-xl bg-emerald-500/10">
            <UIcon name="i-lucide-briefcase" class="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-white">{{ stats.sales }}</p>
            <p class="text-slate-400 text-sm">Sales Team</p>
          </div>
        </div>
      </div>
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-xl bg-amber-500/10">
            <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p class="text-2xl font-bold text-white">{{ stats.active }}</p>
            <p class="text-slate-400 text-sm">Active Users</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="glass-card p-4">
      <div class="flex flex-wrap gap-4 items-center">
        <div class="relative w-64">
          <UIcon name="i-lucide-search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
          <UInput
            v-model="search"
            placeholder="Search users..."
            class="w-full pl-10"
            :ui="{ base: 'pl-10' }"
          />
        </div>
        <div class="flex gap-2">
          <UButton
            v-for="role in roleOptions"
            :key="role.value"
            :color="roleFilter === role.value ? 'primary' : 'neutral'"
            :variant="roleFilter === role.value ? 'solid' : 'ghost'"
            size="sm"
            @click="roleFilter = role.value"
          >
            {{ role.label }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="glass-card overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-white/10">
            <th class="text-left p-4 text-slate-400 font-medium">User</th>
            <th class="text-left p-4 text-slate-400 font-medium">Email</th>
            <th class="text-left p-4 text-slate-400 font-medium">Role</th>
            <th class="text-left p-4 text-slate-400 font-medium">Status</th>
            <th class="text-left p-4 text-slate-400 font-medium">Last Login</th>
            <th class="text-left p-4 text-slate-400 font-medium">Actions</th>
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
                <UAvatar
                  :src="user.avatar"
                  :alt="user.name"
                  size="md"
                  class="ring-2 ring-white/10"
                />
                <div>
                  <p class="font-medium text-white">{{ user.name }}</p>
                  <p class="text-sm text-slate-400">{{ user.phone || 'No phone' }}</p>
                </div>
              </div>
            </td>
            <td class="p-4 text-slate-300">{{ user.email }}</td>
            <td class="p-4">
              <UBadge :color="getRoleBadgeColor(user.role)" variant="subtle">
                {{ getRoleLabel(user.role) }}
              </UBadge>
            </td>
            <td class="p-4">
              <UBadge :color="user.isActive ? 'success' : 'error'" variant="subtle">
                {{ user.isActive ? 'Active' : 'Inactive' }}
              </UBadge>
            </td>
            <td class="p-4 text-slate-300">
              {{ user.lastLogin ? formatDate(user.lastLogin) : 'Never' }}
            </td>
            <td class="p-4">
              <div class="flex items-center gap-2">
                <UButton
                  icon="i-lucide-edit"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  @click="openModal(user)"
                />
                <UButton
                  v-if="user.id !== currentUserId"
                  icon="i-lucide-power"
                  :color="user.isActive ? 'amber' : 'success'"
                  variant="ghost"
                  size="xs"
                  :title="user.isActive ? 'Deactivate' : 'Activate'"
                  @click="toggleUserStatus(user)"
                />
                <UButton
                  v-if="user.id !== currentUserId"
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  @click="confirmDelete(user)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="6" class="p-8 text-center text-slate-400">
              <UIcon name="i-lucide-users" class="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <UModal v-model:open="isModalOpen">
      <template #content>
        <div class="bg-slate-900 rounded-2xl w-[700px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-white/10">
                  <UIcon :name="editingUser ? 'i-lucide-user-cog' : 'i-lucide-user-plus'" class="w-5 h-5 text-white" />
                </div>
                <h2 class="text-xl font-bold text-white">
                  {{ editingUser ? 'Edit User' : 'Add New User' }}
                </h2>
              </div>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="isModalOpen = false"
              />
            </div>
          </div>

          <!-- Modal Body -->
          <form @submit.prevent="saveUser" class="p-6 space-y-6">
            <!-- Basic Info -->
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2 md:col-span-1">
                <label class="block text-sm font-medium text-slate-400 mb-2">Full Name *</label>
                <UInput
                  v-model="formData.name"
                  placeholder="John Doe"
                  icon="i-lucide-user"
                  required
                />
              </div>
              <div class="col-span-2 md:col-span-1">
                <label class="block text-sm font-medium text-slate-400 mb-2">Email Address *</label>
                <UInput
                  v-model="formData.email"
                  type="email"
                  placeholder="john@company.com"
                  icon="i-lucide-mail"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2 md:col-span-1">
                <label class="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
                <UInput
                  v-model="formData.phone"
                  placeholder="+1 234 567 890"
                  icon="i-lucide-phone"
                />
              </div>
              <div class="col-span-2 md:col-span-1">
                <label class="block text-sm font-medium text-slate-400 mb-2">
                  {{ editingUser ? 'New Password' : 'Password *' }}
                </label>
                <UInput
                  v-model="formData.password"
                  type="password"
                  placeholder="••••••••"
                  icon="i-lucide-lock"
                  :required="!editingUser"
                />
                <p v-if="editingUser" class="text-xs text-slate-500 mt-1">Leave blank to keep current password</p>
              </div>
            </div>

            <USeparator />

            <!-- Role Selection -->
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-3">User Role *</label>
              <div class="grid grid-cols-2 gap-3">
                <div
                  v-for="(info, role) in roleInfo"
                  :key="role"
                  class="relative rounded-xl border-2 p-4 cursor-pointer transition-all"
                  :class="formData.role === role 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'"
                  @click="formData.role = role"
                >
                  <div class="flex items-start gap-3">
                    <div 
                      class="w-10 h-10 rounded-lg flex items-center justify-center"
                      :class="getRoleIconBg(role)"
                    >
                      <UIcon :name="getRoleIcon(role)" class="w-5 h-5 text-white" />
                    </div>
                    <div class="flex-1">
                      <p class="font-semibold text-white">{{ info.label }}</p>
                      <p class="text-xs text-slate-400 mt-1">{{ info.description }}</p>
                    </div>
                    <div 
                      class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      :class="formData.role === role 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-slate-600'"
                    >
                      <UIcon v-if="formData.role === role" name="i-lucide-check" class="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Role Permissions Preview -->
            <div v-if="formData.role" class="bg-slate-800/50 rounded-xl p-4">
              <h4 class="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <UIcon name="i-lucide-key" class="w-4 h-4" />
                Permissions for {{ roleInfo[formData.role as keyof typeof roleInfo]?.label }}
              </h4>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div v-for="perm in getRolePermissionsList(formData.role)" :key="perm" class="flex items-center gap-2">
                  <UIcon name="i-lucide-check-circle" class="w-4 h-4 text-emerald-400" />
                  <span class="text-slate-400">{{ formatPermission(perm) }}</span>
                </div>
              </div>
            </div>

            <!-- Status Toggle (Edit mode only) -->
            <div v-if="editingUser" class="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div>
                <p class="font-medium text-white">Account Status</p>
                <p class="text-sm text-slate-400">Deactivated users cannot log in</p>
              </div>
              <UButton
                :color="formData.isActive ? 'success' : 'error'"
                variant="soft"
                @click="formData.isActive = !formData.isActive"
              >
                {{ formData.isActive ? 'Active' : 'Inactive' }}
              </UButton>
            </div>

            <USeparator />

            <!-- Form Actions -->
            <div class="flex justify-end gap-3">
              <UButton
                color="neutral"
                variant="ghost"
                @click="isModalOpen = false"
              >
                Cancel
              </UButton>
              <UButton
                type="submit"
                color="primary"
                :loading="saving"
                icon="i-lucide-check"
              >
                {{ editingUser ? 'Update User' : 'Create User' }}
              </UButton>
            </div>
          </form>
        </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="showDeleteModal">
      <template #content>
        <div class="bg-slate-900 rounded-2xl p-6 w-[400px]">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <UIcon name="i-lucide-user-x" class="w-8 h-8 text-red-400" />
            </div>
            <h3 class="text-xl font-bold text-white mb-2">Delete User?</h3>
            <p class="text-slate-400 mb-6">
              Are you sure you want to delete <strong class="text-white">{{ userToDelete?.name }}</strong>? 
              This action cannot be undone.
            </p>
            <div class="flex gap-3 justify-center">
              <UButton
                color="neutral"
                variant="ghost"
                @click="showDeleteModal = false"
              >
                Cancel
              </UButton>
              <UButton
                color="error"
                :loading="deleting"
                @click="deleteUser"
              >
                Delete User
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const toast = useToast()

interface User {
  id: number
  email: string
  name: string
  phone: string | null
  avatar: string | null
  role: string
  isActive: boolean
  lastLogin: string | null
  createdAt: string
}

const users = ref<User[]>([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const isModalOpen = ref(false)
const showDeleteModal = ref(false)
const editingUser = ref<User | null>(null)
const userToDelete = ref<User | null>(null)
const search = ref('')
const roleFilter = ref('')
const currentUserId = ref<number | null>(null)

const formData = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'SALES',
  isActive: true
})

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SALES', label: 'Sales' },
  { value: 'SUPPORT', label: 'Support' },
  { value: 'VIEWER', label: 'Viewer' }
]

const roleInfo = {
  ADMIN: {
    label: 'Administrator',
    description: 'Full access to all system features'
  },
  SALES: {
    label: 'Sales',
    description: 'Manage clients, invoices, quotations, and payments'
  },
  SUPPORT: {
    label: 'Support',
    description: 'View clients and services, handle support tasks'
  },
  VIEWER: {
    label: 'Viewer',
    description: 'Read-only access to reports and data'
  }
}

const permissionsByRole = {
  ADMIN: ['Full system access', 'User management', 'Settings', 'All reports', 'Delete records'],
  SALES: ['View clients', 'Create clients', 'Invoices', 'Quotations', 'Record payments'],
  SUPPORT: ['View clients', 'View services', 'Support tickets', 'Email logs'],
  VIEWER: ['View dashboard', 'View reports', 'View invoices', 'View clients']
}

const stats = computed(() => ({
  total: users.value.length,
  admins: users.value.filter(u => u.role === 'ADMIN').length,
  sales: users.value.filter(u => u.role === 'SALES').length,
  active: users.value.filter(u => u.isActive).length
}))

const filteredUsers = computed(() => {
  let filtered = users.value

  if (search.value) {
    const query = search.value.toLowerCase()
    filtered = filtered.filter(u => 
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    )
  }

  if (roleFilter.value) {
    filtered = filtered.filter(u => u.role === roleFilter.value)
  }

  return filtered
})

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'error'
    case 'SALES': return 'primary'
    case 'SUPPORT': return 'warning'
    case 'VIEWER': return 'neutral'
    default: return 'neutral'
  }
}

const getRoleLabel = (role: string) => {
  return roleInfo[role as keyof typeof roleInfo]?.label || role
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'i-lucide-shield'
    case 'SALES': return 'i-lucide-briefcase'
    case 'SUPPORT': return 'i-lucide-headphones'
    case 'VIEWER': return 'i-lucide-eye'
    default: return 'i-lucide-user'
  }
}

const getRoleIconBg = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'bg-red-500'
    case 'SALES': return 'bg-blue-500'
    case 'SUPPORT': return 'bg-amber-500'
    case 'VIEWER': return 'bg-slate-500'
    default: return 'bg-slate-500'
  }
}

const getRolePermissionsList = (role: string) => {
  return permissionsByRole[role as keyof typeof permissionsByRole] || []
}

const formatPermission = (perm: string) => perm

const formatDate = (date: string) => {
  return format(new Date(date), 'MMM d, yyyy h:mm a')
}

const fetchUsers = async () => {
  loading.value = true
  try {
    users.value = await $fetch('/api/users')
  } catch (error: any) {
    if (error.statusCode === 403) {
      navigateTo('/dashboard')
      toast.add({ title: 'Access denied', color: 'error' })
    }
  } finally {
    loading.value = false
  }
}

const fetchCurrentUser = async () => {
  try {
    const user = await $fetch('/api/auth/me')
    currentUserId.value = user.id
  } catch {}
}

const openModal = (user?: User) => {
  if (user) {
    editingUser.value = user
    formData.value = {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      role: user.role,
      isActive: user.isActive
    }
  } else {
    editingUser.value = null
    formData.value = {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'SALES',
      isActive: true
    }
  }
  isModalOpen.value = true
}

const saveUser = async () => {
  saving.value = true
  try {
    if (editingUser.value) {
      await $fetch(`/api/users/${editingUser.value.id}`, {
        method: 'PUT',
        body: {
          name: formData.value.name,
          email: formData.value.email,
          phone: formData.value.phone || null,
          password: formData.value.password || undefined,
          role: formData.value.role,
          isActive: formData.value.isActive
        }
      })
      toast.add({ title: 'User updated successfully', color: 'success' })
    } else {
      await $fetch('/api/users', {
        method: 'POST',
        body: formData.value
      })
      toast.add({ title: 'User created successfully', color: 'success' })
    }
    isModalOpen.value = false
    await fetchUsers()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message || 'Failed to save user', color: 'error' })
  } finally {
    saving.value = false
  }
}

const toggleUserStatus = async (user: User) => {
  try {
    await $fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      body: { isActive: !user.isActive }
    })
    toast.add({ 
      title: user.isActive ? 'User deactivated' : 'User activated', 
      color: 'success' 
    })
    await fetchUsers()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  }
}

const confirmDelete = (user: User) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) return
  
  deleting.value = true
  try {
    await $fetch(`/api/users/${userToDelete.value.id}`, { method: 'DELETE' })
    toast.add({ title: 'User deleted successfully', color: 'success' })
    showDeleteModal.value = false
    await fetchUsers()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.data?.message, color: 'error' })
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchUsers()
  fetchCurrentUser()
})
</script>

