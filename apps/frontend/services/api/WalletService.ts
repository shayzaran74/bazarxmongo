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
      return await $api<ApiResponse<Wallet>>('wallet')
    },

    async topUpPrice(amount: number, paymentMethod: string = 'bank_transfer'): Promise<ApiResponse<{ message: string, transactionId?: string }>> {
      return await $api<ApiResponse<{ message: string, transactionId?: string }>>('wallet/topup', {
        method: 'POST',
        body: { amount, paymentMethod }
      })
    },

    async getTransactions(params: WalletTransactionParams = {}): Promise<ApiResponse<WalletTransaction[]>> {
      return await $api<ApiResponse<WalletTransaction[]>>('wallet/transactions', {
        params
      })
    },

    async getAccountTransactions(accountId: number | string, params: WalletTransactionParams = {}): Promise<ApiResponse<WalletTransaction[]>> {
      return await $api<ApiResponse<WalletTransaction[]>>(`wallet/accounts/${accountId}/transactions`, {
        params
      })
    },

    async getLedger(params: Record<string, unknown> = {}): Promise<ApiResponse<LedgerEntry[]>> {
      return await $api<ApiResponse<LedgerEntry[]>>('wallet/ledger', {
        params
      })
    },

    async withdraw(data: { amount: number, iban: string, accountHolder: string, bankName: string }): Promise<ApiResponse<{ message: string, id: string }>> {
      return await $api<ApiResponse<{ message: string, id: string }>>('wallet/withdraw', {
        method: 'POST',
        body: data
      })
    }
  }
}
