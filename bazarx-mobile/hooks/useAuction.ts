import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface Auction {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'ACTIVE' | 'CLOSED' | 'CANCELLED';
  startingPrice: number;
  currentBid?: number;
  participationDeposit: number;
  startTime: string;
  endTime: string;
  images?: string[];
  bidCount?: number;
  winnerId?: string | null;
}

export interface AuctionBid {
  id: string;
  amount: number;
  userId: string;
  userName?: string;
  createdAt: string;
}

export const useAuctions = () =>
  useQuery({
    queryKey: ['auctions'],
    queryFn: async () => {
      const res = await api.get('auction', { params: { status: 'ACTIVE' } });
      return res.data;
    },
  });

export const useAuctionDetail = (id: string) =>
  useQuery({
    queryKey: ['auction', id],
    queryFn: async () => {
      const res = await api.get(`auction/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

export const useAuctionBids = (id: string) =>
  useQuery({
    queryKey: ['auction-bids', id],
    queryFn: async () => {
      const res = await api.get(`auction/${id}/bids`);
      return res.data;
    },
    enabled: !!id,
    refetchInterval: 5000,
  });

export const useParticipate = (auctionId: string) =>
  useMutation({
    mutationFn: async () => {
      const res = await api.post(`auction/${auctionId}/participate`);
      return res.data;
    },
  });

export const usePlaceBid = (auctionId: string) =>
  useMutation({
    mutationFn: async (amount: number) => {
      const res = await api.post(`auction/${auctionId}/bid`, { amount });
      return res.data;
    },
  });
