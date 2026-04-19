import { useApi } from '~/services/api'
import type { ApiResponse, Wallet, WalletTransaction, LedgerEntry } from '@barterborsa/shared-types'

export interface WalletTransactionParams {
  type?: string
  status?: string
  limit?: number
  offset?: number
  [key: string]: unknown
}

export const useWalletService = () => {
  const { $api } = useApi()

  return {
    async getWallet(): Promise<ApiResponse<Wallet>> {
      return await $api<Wallet>('/api/wallet')
    },

    async topUpPrice(amount: number, paymentMethod: string = 'bank_transfer'): Promise<ApiResponse<{ message: string, transactionId?: string }>> {
      return await $api<{ message: string, transactionId?: string }>('/api/wallet/topup', {
        method: 'POST',
        body: { amount, paymentMethod }
      })
    },

    async getTransactions(params: WalletTransactionParams = {}): Promise<ApiResponse<WalletTransaction[]>> {
      return await $api<WalletTransaction[]>('/api/wallet/transactions', {
        params
      })
    },

    async getAccountTransactions(accountId: number | string, params: WalletTransactionParams = {}): Promise<ApiResponse<WalletTransaction[]>> {
      return await $api<WalletTransaction[]>(`/api/wallet/accounts/${accountId}/transactions`, {
        params
      })
    },

    async getLedger(params: Record<string, unknown> = {}): Promise<ApiResponse<LedgerEntry[]>> {
      return await $api<LedgerEntry[]>('/api/wallet/ledger', {
        params
      })
    },

    async withdraw(data: { amount: number, iban: string, accountHolder: string, bankName: string }): Promise<ApiResponse<{ message: string, id: string }>> {
      return await $api<{ message: string, id: string }>('/api/wallet/withdraw', {
        method: 'POST',
        body: data
      })
    }
  }
}
