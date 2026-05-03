import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  earnedAt?: string;
  isEarned: boolean;
}

export interface ReferralStats {
  code: string;
  totalReferrals: number;
  earnedXp: number;
  earnedVouchers: number;
}

export const useBadges = () =>
  useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const res = await api.get('loyalty/badges');
      return res.data;
    },
  });

export const useReferralStats = () =>
  useQuery({
    queryKey: ['referral-stats'],
    queryFn: async () => {
      const res = await api.get('loyalty/referral');
      return res.data;
    },
  });
