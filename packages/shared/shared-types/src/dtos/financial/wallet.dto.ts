export interface WalletAccount {
  id: string;
  type: string;
  balance: string;
  availableBalance?: string;
  blockedBalance?: string;
  currency: string;
}

export interface WalletTopUpRequest {
  id: string;
  userId: string;
  amount: string;
  status: string;
  paymentMethod?: string;
  createdAt: string;
}

export interface WalletWithdrawalRequest {
  id: string;
  userId: string;
  amount: string;
  status: string;
  iban?: string;
  accountHolder?: string;
  bankName?: string;
  rejectionReason?: string;
  processedAt?: string;
  createdAt: string;
}

export interface WalletGiftCard {
  id: string;
  code: string;
  initialValue: string;
  currentValue: string;
  status: string;
  expiresAt?: string;
  customerId?: string;
  note?: string;
  createdAt: string;
}

export interface Wallet {
  id?: string;
  userId?: string;
  balance: string;
  availableBalance?: string;
  blockedBalance?: string;
  currency: string;
  isActive?: boolean;
  accounts?: WalletAccount[];
  cards?: WalletAccount[];
  requests?: WalletTopUpRequest[];
  giftCards?: WalletGiftCard[];
  auctions?: string[];
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amount: string;
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
  amount: string;
  description: string;
  createdAt: string;
}
