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

export function getVisibleTabs(userPermissions: string[]): TabPermission[] {
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
  const tab = ADMIN_TAB_PERMISSIONS.find((t) => t.id === tabId);
  if (!tab) return false;

  return tab.requiredPermissions.some((permission) =>
    userPermissions.includes(permission),
  );
}
