import { ref, computed, onMounted } from 'vue'

export const useAuctionDetail = () => {
    const { $api } = useApi()
    const toast = useNuxtApp().$toast

    const auction = ref<any>(null)
    const bids = ref<any[]>([])
    const loading = ref(true)
    const bidAmount = ref(0)
    const submitting = ref(false)

    const fetchAuction = async (id: string) => {
        loading.value = true
        try {
            const response = await $api<any>(`/api/v1/auctions/${id}`) as any
            if (response.success) {
                auction.value = response.auction || response.data?.auction || response.data
                bidAmount.value = (auction.value.currentPrice || auction.value.startPrice) + (auction.value.minBidIncrement || 0)
                await fetchBids(id)
            }
        } catch (err) {
            console.error('Fetch auction error:', err)
        } finally {
            loading.value = false
        }
    }

    const fetchBids = async (auctionId: string) => {
        try {
            const bidsRes = await $api<any>(`/api/v1/auctions/${auctionId}/bids`) as any
            bids.value = (bidsRes.data || []) as any[]
        } catch (err) {
            console.error('Fetch bids error:', err)
        }
    }

    const placeBid = async () => {
        if (!auction.value) return
        submitting.value = true
        try {
            const res = await $api<any>(`/api/v1/auctions/${auction.value.id}/bid`, {
                method: 'POST',
                body: { amount: bidAmount.value }
            }) as any
            if (res.success) {
                toast.success('Teklifiniz başarıyla iletildi!')
                await fetchAuction(auction.value.id)
            }
        } catch (err: any) {
            toast.error(err.data?.error || 'Teklif verilemedi')
        } finally {
            submitting.value = false
        }
    }

    return { auction, bids, loading, bidAmount, submitting, fetchAuction, placeBid }
}
