export type Id = string;

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface User {
  id: Id;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  companyId?: Id;
  roleIds: Id[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: Id;
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: Address;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: Id;
  name: string;
  description?: string;
  permissions: Id[];
  companyId?: Id;
  isActive: boolean;
}

export interface Permission {
  id: Id;
  key: string;
  description?: string;
  module: string;
  companyId?: Id;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
