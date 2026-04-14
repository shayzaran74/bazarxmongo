import { useApi } from '~/services/api'
import type { ApiResponse, BarterChain, Wallet } from '@barterborsa/shared-types'

export const useBarterService = () => {
    const { $api } = useApi()

    return {
        async getBarterInfo(): Promise<ApiResponse<Wallet>> {
            return await $api<ApiResponse<Wallet>>('/api/barter/info')
        },
        async getMyChains(): Promise<ApiResponse<BarterChain[]>> {
            return await $api<ApiResponse<BarterChain[]>>('/api/barter/my-chains')
        },
        async acceptOffer(offerId: string | number): Promise<ApiResponse<void>> {
            return await $api<ApiResponse<void>>(`/api/barter/accept-offer/${offerId}`, { method: 'POST' })
        },
        async rejectOffer(offerId: string | number): Promise<ApiResponse<void>> {
            return await $api<ApiResponse<void>>(`/api/barter/reject-offer/${offerId}`, { method: 'POST' })
        },
        async transfer(body: { toUserId: string | number, amount: number, description?: string }): Promise<ApiResponse<void>> {
            return await $api<ApiResponse<void>>('/api/barter/transfer', {
                method: 'POST',
                body
            })
        }
    }
}
