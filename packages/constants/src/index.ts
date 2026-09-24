export const API_VERSION = 'v1';
export const API_BASE_PATH = `/api/${API_VERSION}`;

export const APP_ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  VIEWER: 'viewer',
} as const;

export const DEFAULT_PORT = 4000;
export const DEFAULT_NODE_ENV = 'development';
