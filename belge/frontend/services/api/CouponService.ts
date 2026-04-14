import { useApi } from '~/services/api'
import type { ApiResponse, Coupon } from '@barterborsa/shared-types'

export const useCouponService = () => {
    const { $api } = useApi()

    return {
        async validateCoupon(code: string, amount: number): Promise<ApiResponse<Coupon>> {
            return await $api<ApiResponse<Coupon>>(`/api/coupons/validate/${code}`, {
                params: { amount }
            })
        }
    }
}
