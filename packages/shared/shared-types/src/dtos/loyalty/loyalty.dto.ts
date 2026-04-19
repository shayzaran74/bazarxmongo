export interface LoyaltyStatus {
  currentTier: string;
  currentXp: number;
  nextTier: string;
  nextTierXp: number;
  progress: number;
  message?: string;
}

export interface LoyaltyHistoryItem {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}
