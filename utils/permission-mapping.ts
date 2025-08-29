export interface TabPermission {
  id: string;
  label: string;
  icon: string;
  requiredPermissions: string[];
  description?: string;
}

export const ADMIN_TAB_PERMISSIONS: TabPermission[] = [
  {
    id: "overview",
    label: "Overview",
    icon: "ri-dashboard-line",
    requiredPermissions: ["system.analytics"],
    description: "View system overview and analytics",
  },
  {
    id: "users",
    label: "Users",
    icon: "ri-user-line",
    requiredPermissions: ["users.read"],
    description: "Manage user accounts and profiles",
  },
  {
    id: "roles",
    label: "Roles",
    icon: "ri-shield-user-line",
    requiredPermissions: ["roles.read"],
    description: "Manage user roles and permissions",
  },
  {
    id: "audit",
    label: "Audit Log",
    icon: "ri-file-list-line",
    requiredPermissions: ["system.audit_logs"],
    description: "View system audit logs",
  },
  {
    id: "books",
    label: "Book Management",
    icon: "ri-book-line",
    requiredPermissions: ["content.read"],
    description: "Manage books, assignments, and analytics",
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: "ri-star-line",
    requiredPermissions: ["content.moderate"],
    description: "Moderate user reviews and ratings",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "ri-notification-line",
    requiredPermissions: ["system.settings"],
    description: "Manage system notifications",
  },
  {
    id: "orders",
    label: "Orders",
    icon: "ri-shopping-cart-line",
    requiredPermissions: ["content.read"],
    description: "View and manage customer orders",
  },
  {
    id: "shipping",
    label: "Shipping",
    icon: "ri-truck-line",
    requiredPermissions: ["content.read"],
    description: "Manage shipping and delivery",
  },
  {
    id: "reading",
    label: "Reading Analytics",
    icon: "ri-line-chart-line",
    requiredPermissions: ["system.analytics"],
    description: "View reading analytics and insights",
  },
  {
    id: "reports",
    label: "Reports",
    icon: "ri-file-text-line",
    requiredPermissions: ["system.analytics"],
    description: "Generate and view system reports",
  },
  {
    id: "email-templates",
    label: "Email Templates",
    icon: "ri-mail-line",
    requiredPermissions: ["system.settings"],
    description: "Manage email templates",
  },
  {
    id: "blog",
    label: "Blog Management",
    icon: "ri-file-text-line",
    requiredPermissions: ["content.read", "content.create"],
    description: "Manage blog posts and articles",
  },
  {
    id: "works",
    label: "Works Management",
    icon: "ri-image-line",
    requiredPermissions: ["content.read", "content.create"],
    description: "Manage works and portfolios",
  },
  {
    id: "about",
    label: "About Management",
    icon: "ri-information-line",
    requiredPermissions: ["content.aboutus"],
    description: "Manage about page content",
  },
  {
    id: "contact",
    label: "Contact Management",
    icon: "ri-customer-service-line",
    requiredPermissions: ["content.read", "content.update"],
    description: "Manage contact information",
  },
  {
    id: "faq-management",
    label: "FAQ Management",
    icon: "ri-question-line",
    requiredPermissions: ["content.read", "content.create", "content.update"],
    description: "Manage frequently asked questions",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "ri-settings-line",
    requiredPermissions: ["system.settings"],
    description: "Manage system settings and configuration",
  },
];

// Action-based permissions for different operations
export const ACTION_PERMISSIONS = {
  // User management actions
  'users.create': ['users.create'],
  'users.update': ['users.update'],
  'users.delete': ['users.delete'],
  'users.manage_roles': ['users.manage_roles'],
  
  // Role management actions
  'roles.create': ['roles.create'],
  'roles.update': ['roles.update'],
  'roles.delete': ['roles.delete'],
  'roles.manage_permissions': ['roles.manage_permissions'],
  
  // Permission management actions
  'permissions.create': ['permissions.create'],
  'permissions.update': ['permissions.update'],
  'permissions.delete': ['permissions.delete'],
  
  // Book management actions
  'books.create': ['books.create'],
  'books.update': ['books.update'],
  'books.delete': ['books.delete'],
  
  // Author management actions
  'authors.create': ['authors.create'],
  'authors.update': ['authors.update'],
  'authors.delete': ['authors.delete'],
  
  // Order management actions
  'orders.create': ['orders.create'],
  'orders.update': ['orders.update'],
  'orders.delete': ['orders.delete'],
  
  // Content management actions
  'content.create': ['content.create'],
  'content.update': ['content.update'],
  'content.delete': ['content.delete'],
  'content.publish': ['content.publish'],
  'content.moderate': ['content.moderate'],
  
  // Blog management actions
  'blog.create': ['blog.create'],
  'blog.update': ['blog.update'],
  'blog.delete': ['blog.delete'],
  
  // FAQ management actions
  'faq.create': ['faq.create'],
  'faq.update': ['faq.update'],
  'faq.delete': ['faq.delete'],
  
  // Email management actions
  'email.create': ['email.create'],
  'email.update': ['email.update'],
  'email.delete': ['email.delete'],
  'email.send': ['email.send'],
  
  // System management actions
  'system.settings': ['system.settings'],
  'system.analytics': ['system.analytics'],
  'system.audit_logs': ['system.audit_logs']
};

export function getVisibleTabs(userPermissions: string[]): TabPermission[] {
  // Admin users with wildcard permission can see all tabs
  if (userPermissions.includes('*')) return ADMIN_TAB_PERMISSIONS;
  
  return ADMIN_TAB_PERMISSIONS.filter((tab) => {
    // User must have at least one of the required permissions
    return tab.requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );
  });
}

export function canAccessTab(
  tabId: string,
  userPermissions: string[],
): boolean {
  // Admin users with wildcard permission can access all tabs
  if (userPermissions.includes('*')) return true;
  
  const tab = ADMIN_TAB_PERMISSIONS.find((t) => t.id === tabId);
  if (!tab) return false;

  return tab.requiredPermissions.some((permission) =>
    userPermissions.includes(permission),
  );
}

// Check if user can perform a specific action
export function canPerformAction(actionName: string, userPermissions: string[]): boolean {
  // Admin users with wildcard permission can perform all actions
  if (userPermissions.includes('*')) return true;
  
  const requiredPermissions = ACTION_PERMISSIONS[actionName as keyof typeof ACTION_PERMISSIONS];
  
  // If no permissions defined for this action, deny access
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return false;
  }
  
  // Check if user has at least one of the required permissions
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

// Check if user is super admin (has all permissions)
export function isSuperAdmin(userPermissions: string[]): boolean {
  const criticalPermissions = [
    'system.settings',
    'system.audit_logs',
    'roles.create',
    'roles.delete',
    'permissions.create',
    'permissions.delete'
  ];
  
  return criticalPermissions.every(permission => userPermissions.includes(permission));
}

// Check if user has admin-level access
export function isAdmin(userPermissions: string[]): boolean {
  const adminPermissions = [
    'users.read',
    'users.create',
    'users.update',
    'roles.read',
    'books.create',
    'books.update',
    'books.delete'
  ];
  
  return adminPermissions.some(permission => userPermissions.includes(permission));
}
