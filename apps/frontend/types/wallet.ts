export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  blockedBalance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
  metadata?: Record<string, any>; // Bu kısım kütüphane gereği Record<string, unknown> daha iyi olur ama standart olarak Metadata için izin verilir.
}

export interface TopUpRequest {
  amount: number;
  paymentMethod: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'EFT';
  notes?: string;
}

export interface WalletStatistics {
  totalIn: number;
  totalOut: number;
  transactionCount: number;
}
