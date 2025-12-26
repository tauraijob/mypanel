// Role-based permission definitions
export const PERMISSIONS = {
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
} as const

export type Permission = keyof typeof PERMISSIONS
export type UserRole = 'ADMIN' | 'SALES' | 'SUPPORT' | 'VIEWER'

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission]
  return allowedRoles?.includes(role) ?? false
}

export function requirePermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw createError({
      statusCode: 403,
      message: `Access denied. You don't have permission to perform this action.`
    })
  }
}

// Helper to get all permissions for a role
export function getRolePermissions(role: UserRole): Permission[] {
  return Object.entries(PERMISSIONS)
    .filter(([_, roles]) => roles.includes(role))
    .map(([permission]) => permission as Permission)
}

// Role descriptions for display
export const ROLE_INFO = {
  ADMIN: {
    label: 'Administrator',
    description: 'Full access to all system features',
    color: 'red'
  },
  SALES: {
    label: 'Sales',
    description: 'Can manage clients, invoices, quotations, and record payments',
    color: 'blue'
  },
  SUPPORT: {
    label: 'Support',
    description: 'Can view clients and services, handle support tasks',
    color: 'amber'
  },
  VIEWER: {
    label: 'Viewer',
    description: 'Read-only access to reports and data',
    color: 'gray'
  }
} as const

