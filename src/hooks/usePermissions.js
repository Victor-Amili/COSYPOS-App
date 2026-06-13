// src/hooks/usePermissions.js
import { useAuth } from "./useAuth";

const DEFAULT_PERMISSIONS = {
  dashboard: true,
  reports: false,
  inventory: false,
  orders: true,
  customers: false,
  settings: false,
};

const ROLE_PERMISSIONS = {
  admin: {
    dashboard: true,
    reports: true,
    inventory: true,
    orders: true,
    customers: true,
    settings: true,
  },
  manager: {
    dashboard: true,
    reports: true,
    inventory: true,
    orders: true,
    customers: true,
    settings: false,
  },
  staff: {
    dashboard: true,
    reports: false,
    inventory: false,
    orders: true,
    customers: false,
    settings: false,
  },
  "sub-admin": {
    dashboard: true,
    reports: true,
    inventory: true,
    orders: true,
    customers: true,
    settings: false,
  },
};

export const usePermissions = () => {
  const { user, isAdmin } = useAuth();

  const getPermissions = () => {
    if (!user) return DEFAULT_PERMISSIONS;
    if (isAdmin) return ROLE_PERMISSIONS.admin;

    // Merge role defaults with user-specific overrides
    const rolePerms = ROLE_PERMISSIONS[user.role] || DEFAULT_PERMISSIONS;
    return {
      ...rolePerms,
      ...user.permissions,
    };
  };

  const permissions = getPermissions();

  const canAccess = (page) => {
    return permissions[page] === true;
  };

  const canManageUsers = () => isAdmin || user?.role === "manager";
  const canManageInventory = () => permissions.inventory === true;
  const canViewReports = () => permissions.reports === true;
  const canManageSettings = () => permissions.settings === true;

  return {
    permissions,
    canAccess,
    canManageUsers,
    canManageInventory,
    canViewReports,
    canManageSettings,
  };
};
