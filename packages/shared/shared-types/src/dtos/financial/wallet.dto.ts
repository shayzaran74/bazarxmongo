export interface Wallet {
  id?: string;
  userId?: string;
  balance: number;
  availableBalance?: number;
  blockedBalance?: number;
  currency: string;
  isActive?: boolean;
  cards?: any[];
  requests?: any[];
  giftCards?: any[];
  auctions?: any[];
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amount: number;
  type: string;
  direction?: 'DEBIT' | 'CREDIT';
  status: string;
  description?: string;
  account?: {
    id: string;
    type: string;
  };
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}
