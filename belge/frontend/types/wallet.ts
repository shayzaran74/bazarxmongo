export interface WalletCard {
  id: number;
  type: string;
  numbers: number[];
  winningNumbers?: number[];
  createdAt: string;
}

export interface WalletRequest {
  id: number;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface WithdrawalRequest {
  id: number;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  iban: string;
  accountHolder: string;
  bankName: string;
  createdAt: string;
}

export interface WalletAccount {
  id: number;
  name: string;
  type: string;
  balance: number;
  currency: string;
  createdAt: string;
}

export interface Wallet {
  balance: number;
  blockedBalance: number;
  cards: WalletCard[];
  requests: WalletRequest[];
  withdrawalRequests?: WithdrawalRequest[];
  accounts?: WalletAccount[];
}

export interface WalletTransaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  status: string;
}

export interface LedgerEntry {
  id: number;
  accountId: number;
  debit: number;
  credit: number;
  balance: number;
  description: string;
  createdAt: string;
}
