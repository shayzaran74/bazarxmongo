import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface VendorDashboard {
  todaySales: number;
  monthlySales: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  activeProducts: number;
  rating?: number;
  trustScore?: number;
}

export interface VendorProduct {
  id: string;
  title: string;
  price: number;
  stock: number;
  status: 'ACTIVE' | 'PASSIVE' | 'PENDING' | 'REJECTED';
  images?: string[];
  category?: { name: string };
  soldCount?: number;
}

export interface VendorOrder {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  customerName?: string;
  itemCount?: number;
  createdAt: string;
}

export interface VendorAnalytics {
  daily: { date: string; revenue: number; orders: number }[];
  topProducts: { id: string; title: string; soldCount: number; revenue: number }[];
  conversionRate?: number;
  avgOrderValue?: number;
}

export interface ApplyVendorDto {
  companyName: string;
  taxNumber: string;
  phone: string;
  city: string;
  address: string;
  description?: string;
}

// ── Dashboard ──
export const useVendorDashboard = () =>
  useQuery({
    queryKey: ['vendor-dashboard'],
    queryFn: async () => {
      const res = await api.get('vendor/dashboard');
      return res.data;
    },
  });

// ── Products ──
export const useVendorProducts = () =>
  useQuery({
    queryKey: ['vendor-products'],
    queryFn: async () => {
      const res = await api.get('vendor/products');
      return res.data;
    },
  });

export const useVendorProduct = (id: string) =>
  useQuery({
    queryKey: ['vendor-product', id],
    queryFn: async () => {
      const res = await api.get(`vendor/products/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

export const useCreateVendorProduct = () =>
  useMutation({
    mutationFn: async (data: Partial<VendorProduct>) => {
      const res = await api.post('vendor/products', data);
      return res.data;
    },
  });

export const useUpdateVendorProduct = (id: string) =>
  useMutation({
    mutationFn: async (data: Partial<VendorProduct>) => {
      const res = await api.patch(`vendor/products/${id}`, data);
      return res.data;
    },
  });

export const useDeleteVendorProduct = () =>
  useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`vendor/products/${id}`);
      return res.data;
    },
  });

// ── Orders ──
export const useVendorOrders = () =>
  useQuery({
    queryKey: ['vendor-orders'],
    queryFn: async () => {
      const res = await api.get('vendor/orders');
      return res.data;
    },
  });

export const useVendorOrderDetail = (id: string) =>
  useQuery({
    queryKey: ['vendor-order', id],
    queryFn: async () => {
      const res = await api.get(`vendor/orders/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

export const useUpdateOrderStatus = (id: string) =>
  useMutation({
    mutationFn: async (status: string) => {
      const res = await api.patch(`vendor/orders/${id}/status`, { status });
      return res.data;
    },
  });

// ── Analytics ──
export const useVendorAnalytics = () =>
  useQuery({
    queryKey: ['vendor-analytics'],
    queryFn: async () => {
      const res = await api.get('vendor/analytics');
      return res.data;
    },
  });

// ── Apply ──
export const useApplyVendor = () =>
  useMutation({
    mutationFn: async (data: ApplyVendorDto) => {
      const res = await api.post('vendor/apply', data);
      return res.data;
    },
  });
