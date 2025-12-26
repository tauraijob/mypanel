<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">Service Categories</h1>
        <p class="text-slate-400 mt-1">Manage service categories for organization</p>
      </div>
      <UButton v-if="hasPermission('settings.edit')" color="primary" icon="i-lucide-plus" @click="openModal()">
        Add Category
      </UButton>
    </div>

    <!-- Categories Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="category in categories"
        :key="category.id"
        class="glass-card p-5 hover:bg-white/5 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center"
              :style="{ backgroundColor: category.color + '20' }"
            >
              <UIcon :name="getIconName(category.icon)" class="w-6 h-6" :style="{ color: category.color }" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-white">{{ category.name }}</h3>
              <p class="text-sm text-slate-400">{{ category.description || 'No description' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <UButton
              icon="i-lucide-pencil"
              variant="ghost"
              color="neutral"
              size="sm"
              @click="openModal(category)"
            />
            <UButton
              icon="i-lucide-trash-2"
              variant="ghost"
              color="error"
              size="sm"
              :disabled="category._count?.services > 0"
              :title="category._count?.services > 0 ? 'Cannot delete - has services' : 'Delete category'"
              @click="confirmDelete(category)"
            />
          </div>
        </div>
        <div class="mt-4 flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded" :style="{ backgroundColor: category.color }"></div>
            <span class="text-xs text-slate-400">{{ category.color }}</span>
          </div>
          <UBadge color="info" variant="subtle">
            {{ category._count?.services || 0 }} service(s)
          </UBadge>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="categories.length === 0" class="col-span-full glass-card p-12 text-center">
        <UIcon name="i-lucide-folder-open" class="w-16 h-16 mx-auto text-slate-500 mb-4" />
        <h3 class="text-xl font-semibold text-white mb-2">No Categories</h3>
        <p class="text-slate-400 mb-6">Create your first category to organize services</p>
        <UButton color="primary" icon="i-lucide-plus" @click="openModal()">
          Add Category
        </UButton>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="isModalOpen = false" />
        <div class="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <!-- Header -->
          <div class="bg-slate-800/50 border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :style="{ backgroundColor: (form.color || '#3b82f6') + '30' }"
              >
                <UIcon :name="getIconName(form.icon)" class="w-5 h-5" :style="{ color: form.color || '#3b82f6' }" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">{{ editingCategory ? 'Edit Category' : 'New Category' }}</h2>
                <p class="text-slate-400 text-xs">{{ editingCategory ? 'Update category details' : 'Create a new service category' }}</p>
              </div>
            </div>
            <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="isModalOpen = false" />
          </div>

          <!-- Form -->
          <form @submit.prevent="saveCategory" class="p-6 space-y-4">
            <UFormField label="Category Name *" name="name">
              <UInput v-model="form.name" placeholder="e.g., Web Hosting" required />
            </UFormField>

            <UFormField label="Description" name="description">
              <UTextarea v-model="form.description" placeholder="Brief description of this category" rows="2" />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Color" name="color">
                <div class="flex items-center gap-2">
                  <input
                    type="color"
                    v-model="form.color"
                    class="w-10 h-10 rounded-lg cursor-pointer border-0"
                  />
                  <UInput v-model="form.color" class="flex-1" placeholder="#3b82f6" />
                </div>
              </UFormField>

              <UFormField label="Icon" name="icon">
                <USelect v-model="form.icon" :items="iconOptions" />
              </UFormField>
            </div>

            <!-- Color Preview -->
            <div class="p-4 rounded-xl bg-white/5 border border-white/10">
              <p class="text-xs text-slate-400 mb-2">Preview</p>
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center"
                  :style="{ backgroundColor: (form.color || '#3b82f6') + '20' }"
                >
                  <UIcon :name="getIconName(form.icon)" class="w-6 h-6" :style="{ color: form.color || '#3b82f6' }" />
                </div>
                <div>
                  <p class="font-semibold text-white">{{ form.name || 'Category Name' }}</p>
                  <p class="text-sm text-slate-400">{{ form.description || 'Description' }}</p>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-white/10">
              <UButton variant="ghost" color="neutral" @click="isModalOpen = false">
                Cancel
              </UButton>
              <UButton type="submit" color="primary" :loading="saving" icon="i-lucide-check">
                {{ editingCategory ? 'Update' : 'Create' }} Category
              </UButton>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isDeleteModalOpen">
      <template #content>
        <div class="p-8 text-center w-[400px] max-w-[90vw]">
          <div class="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-lucide-trash-2" class="w-8 h-8 text-rose-400" />
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Delete Category?</h3>
          <p class="text-slate-400 mb-6">
            Are you sure you want to delete <span class="text-white font-semibold">{{ categoryToDelete?.name }}</span>?
          </p>
          <div class="flex justify-center gap-3">
            <UButton variant="ghost" color="neutral" @click="isDeleteModalOpen = false">
              Cancel
            </UButton>
            <UButton color="error" :loading="deleting" icon="i-lucide-trash-2" @click="deleteCategory">
              Delete
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const toast = useToast()
const { hasPermission } = useAuth()

const categories = ref<any[]>([])
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const editingCategory = ref<any>(null)
const categoryToDelete = ref<any>(null)
const saving = ref(false)
const deleting = ref(false)

const form = ref({
  name: '',
  description: '',
  color: '#3b82f6',
  icon: 'server'
})

const iconOptions = [
  { label: 'Server', value: 'server' },
  { label: 'Globe', value: 'globe' },
  { label: 'Code', value: 'code' },
  { label: 'At Sign', value: 'at-sign' },
  { label: 'Wrench', value: 'wrench' },
  { label: 'Message', value: 'message-circle' },
  { label: 'Database', value: 'database' },
  { label: 'Cloud', value: 'cloud' },
  { label: 'Shield', value: 'shield' },
  { label: 'Zap', value: 'zap' },
  { label: 'Smartphone', value: 'smartphone' },
  { label: 'Monitor', value: 'monitor' },
  { label: 'Mail', value: 'mail' },
  { label: 'Lock', value: 'lock' },
  { label: 'Settings', value: 'settings' }
]

const getIconName = (icon: string) => `i-lucide-${icon || 'server'}`

const fetchCategories = async () => {
  try {
    categories.value = await $fetch('/api/categories')
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

const openModal = (category?: any) => {
  if (category) {
    editingCategory.value = category
    form.value = {
      name: category.name,
      description: category.description || '',
      color: category.color || '#3b82f6',
      icon: category.icon || 'server'
    }
  } else {
    editingCategory.value = null
    form.value = {
      name: '',
      description: '',
      color: '#3b82f6',
      icon: 'server'
    }
  }
  isModalOpen.value = true
}

const saveCategory = async () => {
  saving.value = true
  try {
    if (editingCategory.value) {
      await $fetch(`/api/categories/${editingCategory.value.id}`, {
        method: 'PUT',
        body: form.value
      })
      toast.add({ title: 'Category updated successfully', color: 'success' })
    } else {
      await $fetch('/api/categories', {
        method: 'POST',
        body: form.value
      })
      toast.add({ title: 'Category created successfully', color: 'success' })
    }
    isModalOpen.value = false
    fetchCategories()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to save category',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (category: any) => {
  categoryToDelete.value = category
  isDeleteModalOpen.value = true
}

const deleteCategory = async () => {
  if (!categoryToDelete.value) return
  
  deleting.value = true
  try {
    await $fetch(`/api/categories/${categoryToDelete.value.id}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Category deleted successfully', color: 'success' })
    isDeleteModalOpen.value = false
    fetchCategories()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to delete category',
      color: 'error'
    })
  } finally {
    deleting.value = false
  }
}

onMounted(fetchCategories)
</script>
