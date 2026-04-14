import { useApi } from '~/services/api'
import type { ApiResponse, PaymentResponse } from '@barterborsa/shared-types'

export const usePaymentService = () => {
    const { $api } = useApi()

    return {
        async createPaymentIntent(body: Record<string, unknown>): Promise<ApiResponse<PaymentResponse>> {
            return await $api<ApiResponse<PaymentResponse>>('/api/payment/create-payment-intent', {
                method: 'POST',
                body
            })
        },
        async walletCheckout(body: Record<string, unknown>): Promise<ApiResponse<PaymentResponse>> {
            return await $api<ApiResponse<PaymentResponse>>('/api/payment/wallet-checkout', {
                method: 'POST',
                body
            })
        }
    }
}

export const usePaymentConfirmService = () => {
    const { $api } = useApi()
    
    return {
        confirmPayment: (paymentIntentId: string): Promise<ApiResponse<PaymentResponse>> => 
            $api<ApiResponse<PaymentResponse>>('/api/payment/confirm-payment', { 
                method: 'POST', 
                body: { paymentIntentId } 
            }),
            
        confirmBankTransfer: (data: Record<string, unknown>): Promise<ApiResponse<PaymentResponse>> => 
            $api<ApiResponse<PaymentResponse>>('/api/payments/bank-transfer/confirm', { 
                method: 'POST', 
                body: data 
            }),
            
        confirmEft: (data: Record<string, unknown>): Promise<ApiResponse<PaymentResponse>> => 
            $api<ApiResponse<PaymentResponse>>('/api/payments/eft/confirm', { 
                method: 'POST', 
                body: data 
            }),
            
        processCreditCard: (data: Record<string, unknown>): Promise<ApiResponse<PaymentResponse>> => 
            $api<ApiResponse<PaymentResponse>>('/api/payments/credit-card/process', { 
                method: 'POST', 
                body: data 
            }),
    }
}
