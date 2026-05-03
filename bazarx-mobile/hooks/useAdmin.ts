import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface AdminDashboard {
  totalUsers: number;
  totalVendors: number;
  pendingVendors: number;
  totalOrders: number;
  todayRevenue: number;
  totalProducts: number;
  pendingProducts: number;
  activeAuctions: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'USER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  createdAt: string;
}

export interface AdminVendor {
  id: string;
  companyName: string;
  email: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  taxNumber?: string;
  city?: string;
  createdAt: string;
}

// Dashboard
export const useAdminDashboard = () =>
  useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await api.get('admin/dashboard');
      return res.data;
    },
  });

// Users
export const useAdminUsers = (filter?: string) =>
  useQuery({
    queryKey: ['admin-users', filter],
    queryFn: async () => {
      const res = await api.get('admin/users', { params: filter ? { role: filter } : {} });
      return res.data;
    },
  });

export const useUpdateUserStatus = () =>
  useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`admin/users/${id}/status`, { status });
      return res.data;
    },
  });

// Vendors
export const useAdminVendors = (status?: string) =>
  useQuery({
    queryKey: ['admin-vendors', status],
    queryFn: async () => {
      const res = await api.get('admin/vendors', { params: status ? { status } : {} });
      return res.data;
    },
  });

export const useApproveVendor = () =>
  useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`admin/vendors/${id}/approve`);
      return res.data;
    },
  });

export const useRejectVendor = () =>
  useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await api.patch(`admin/vendors/${id}/reject`, { reason });
      return res.data;
    },
  });

// Products
export const useAdminProducts = (status?: string) =>
  useQuery({
    queryKey: ['admin-products', status],
    queryFn: async () => {
      const res = await api.get('admin/products', { params: status ? { status } : {} });
      return res.data;
    },
  });

export const useApproveProduct = () =>
  useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`admin/products/${id}/approve`);
      return res.data;
    },
  });

// Orders
export const useAdminOrders = () =>
  useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await api.get('admin/orders');
      return res.data;
    },
  });
