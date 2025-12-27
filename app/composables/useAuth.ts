export interface AuthUser {
  id: number
  email: string
  name: string
  role: string
  organizationId?: number | null
}

const authUser = ref<AuthUser | null>(null)
const authLoading = ref(true)

export const useAuth = () => {
  const toast = useToast()

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        authUser.value = null
        return
      }

      const user = await $fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      authUser.value = user
    } catch {
      authUser.value = null
      localStorage.removeItem('auth_token')
    } finally {
      authLoading.value = false
    }
  }

  const login = async (email: string, password: string) => {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })

    if (response.token) {
      localStorage.setItem('auth_token', response.token)
      authUser.value = response.user
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    authUser.value = null
    navigateTo('/login')
  }

  const hasPermission = (permission: string): boolean => {
    if (!authUser.value) return false

    const role = authUser.value.role
    const permissions: Record<string, string[]> = {
      // User Management
      'users.view': ['ADMIN'],
      'users.create': ['ADMIN'],
      'users.edit': ['ADMIN'],
      'users.delete': ['ADMIN'],

      // Client Management
      'clients.view': ['ADMIN', 'SALES', 'SUPPORT', 'VIEWER'],
      'clients.create': ['ADMIN', 'SALES'],
      'clients.edit': ['ADMIN', 'SALES'],
      'clients.delete': ['ADMIN'],

      // Services
      'services.view': ['ADMIN', 'SALES', 'SUPPORT', 'VIEWER'],
      'services.create': ['ADMIN', 'SALES'],
      'services.edit': ['ADMIN', 'SALES'],
      'services.delete': ['ADMIN'],
      'services.terminate': ['ADMIN'],

      // Invoices
      'invoices.view': ['ADMIN', 'SALES', 'VIEWER'],
      'invoices.create': ['ADMIN', 'SALES'],
      'invoices.edit': ['ADMIN', 'SALES'],
      'invoices.send': ['ADMIN', 'SALES'],
      'invoices.delete': ['ADMIN'],

      // Quotations
      'quotations.view': ['ADMIN', 'SALES', 'VIEWER'],
      'quotations.create': ['ADMIN', 'SALES'],
      'quotations.edit': ['ADMIN', 'SALES'],
      'quotations.send': ['ADMIN', 'SALES'],
      'quotations.delete': ['ADMIN'],

      // Payments
      'payments.view': ['ADMIN', 'SALES', 'VIEWER'],
      'payments.create': ['ADMIN', 'SALES'],
      'payments.edit': ['ADMIN'],
      'payments.delete': ['ADMIN'],

      // Reports & Dashboard
      'dashboard.view': ['ADMIN', 'SALES', 'SUPPORT', 'VIEWER'],
      'reports.view': ['ADMIN', 'VIEWER'],
      'reports.export': ['ADMIN'],

      // Settings
      'settings.view': ['ADMIN'],
      'settings.edit': ['ADMIN'],

      // Email Logs
      'email-logs.view': ['ADMIN', 'SALES'],
      'email-logs.retry': ['ADMIN'],
    }

    return permissions[permission]?.includes(role) ?? false
  }

  const isAdmin = computed(() => authUser.value?.role === 'ADMIN')
  const isSales = computed(() => authUser.value?.role === 'SALES')
  const isSupport = computed(() => authUser.value?.role === 'SUPPORT')
  const isViewer = computed(() => authUser.value?.role === 'VIEWER')

  return {
    user: authUser,
    loading: authLoading,
    fetchUser,
    login,
    logout,
    hasPermission,
    isAdmin,
    isSales,
    isSupport,
    isViewer
  }
}

