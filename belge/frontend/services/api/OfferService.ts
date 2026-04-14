import { useApi } from '~/services/api'
import type { ApiResponse, Offer } from '@barterborsa/shared-types'

export const useOfferService = () => {
    const { $api } = useApi()
    
    return {
        async getMyOffers(): Promise<ApiResponse<Offer[]>> {
            return await $api<ApiResponse<Offer[]>>('/api/offers/my')
        },
        async updateStatus(id: string | number, status: string): Promise<ApiResponse<void>> {
            return await $api<ApiResponse<void>>(`/api/offers/${id}/status`, { 
                method: 'PATCH', 
                body: { status } 
            })
        },
        async accept(id: string | number): Promise<ApiResponse<void>> {
            return await $api<ApiResponse<void>>(`/api/offers/${id}/accept`, { 
                method: 'POST' 
            })
        },
    }
}
