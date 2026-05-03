import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface Lottery {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  ticketPrice: number;
  totalTickets: number;
  soldTickets?: number;
  maxTicketsPerUser: number;
  drawTime: string;
  prize?: string;
  prizeImage?: string;
  winnerId?: string | null;
}

export const useLotteries = () =>
  useQuery({
    queryKey: ['lotteries'],
    queryFn: async () => {
      const res = await api.get('lotteries', { params: { status: 'ACTIVE' } });
      return res.data;
    },
  });

export const useLotteryDetail = (id: string) =>
  useQuery({
    queryKey: ['lottery', id],
    queryFn: async () => {
      const res = await api.get(`lotteries/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

export const useBuyTicket = (lotteryId: string) =>
  useMutation({
    mutationFn: async (quantity: number = 1) => {
      const res = await api.post(`lotteries/${lotteryId}/participate`, { quantity });
      return res.data;
    },
  });
