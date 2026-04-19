import { useApi } from '~/services/api'
import type { ApiResponse, Wallet } from '@barterborsa/shared-types'

export const useBarterService = () => {
    const { $api } = useApi()

    return {
        async getBarterInfo(): Promise<ApiResponse<Wallet>> {
            return await $api<Wallet>('/api/barter/info')
        },
        async getMyChains(): Promise<ApiResponse<any[]>> {
            return await $api<any[]>('/api/barter/my-chains')
        },
        async getMyOffers(): Promise<ApiResponse<any[]>> {
            return await $api<any[]>('/api/barter/my-offers')
        },
        async acceptOffer(offerId: string | number): Promise<ApiResponse<void>> {
            return await $api<void>(`/api/barter/accept-offer/${offerId}`, { method: 'POST' })
        },
        async rejectOffer(offerId: string | number): Promise<ApiResponse<void>> {
            return await $api<void>(`/api/barter/reject-offer/${offerId}`, { method: 'POST' })
        },
        async transfer(body: { toUserId: string | number, amount: number, description?: string }): Promise<ApiResponse<void>> {
            return await $api<void>('/api/barter/transfer', {
                method: 'POST',
                body
            })
        }
    }
}
