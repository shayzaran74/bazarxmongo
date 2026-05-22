// apps/frontend/composables/useSurplus.ts

import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { SurplusItem, TradeOffer, BarterChain, SurplusListResponse, OfferListResponse } from '~/types/surplus'

export const useSurplus = () => {
  const { $api } = useApi()
  const nuxt      = useNuxtApp()
  const authStore = useAuthStore()
  const router    = useRouter()

  const items          = ref<SurplusItem[]>([])
  const offers         = ref<TradeOffer[]>([])
  const myChains       = ref<BarterChain[]>([])
  const myCompany      = ref<{ id: string; name: string; isVendor?: boolean } | null>(null)
  const activeTab      = ref<'listings' | 'received' | 'sent'>('listings')
  const loading        = ref(true)
  const showCreateModal  = ref(false)
  const showCompanyModal = ref(false)
  const isTradeModalOpen = ref(false)
  const selectedItem   = ref<SurplusItem | null>(null)
  const selectedChain  = ref<BarterChain | null>(null)

  const fetchMyCompany = async (): Promise<void> => {
    try {
      const response = await $api<{ success: boolean; company?: { id: string; name: string } }>('/api/v1/companies/me')
      if (response.success && response.company) {
        myCompany.value = response.company
        await fetchItems()
      } else if (authStore.isVendor) {
        const user = authStore.user as { vendor?: { id?: string; businessName?: string }; vendorId?: string; name?: string } | null
        myCompany.value = {
          id:       user?.vendor?.id ?? user?.vendorId ?? 'vendor-mode',
          name:     user?.vendor?.businessName ?? user?.name ?? 'Satıcı Hesabı',
          isVendor: true,
        }
        await fetchItems()
      }
    } catch {
      // Şirket bilgisi alınamadı — kullanıcı yönlendirilmeyecek, ekran boş gösterilecek
    } finally {
      loading.value = false
    }
  }

  const fetchItems = async (): Promise<void> => {
    if (!myCompany.value) return
    try {
      const [itemsRes, chainsRes] = await Promise.all([
        $api<SurplusListResponse>('/api/v1/surplus', {
          query: { companyId: myCompany.value.id, status: 'all' },
        }),
        $api<{ data?: BarterChain[] }>('/api/v1/barter/my-chains'),
      ])

      if (itemsRes.success) items.value = itemsRes.items ?? []
      if (chainsRes.data)   myChains.value = chainsRes.data ?? []
    } catch {
      items.value = []
    }
  }

  const fetchOffers = async (): Promise<void> => {
    if (!myCompany.value) return
    loading.value = true
    try {
      const response = await $api<OfferListResponse>('/api/v1/offers/my', {
        query: { companyId: myCompany.value.id, type: activeTab.value },
      })
      if (response.success) offers.value = response.offers ?? []
    } catch {
      offers.value = []
    } finally {
      loading.value = false
    }
  }

  const deleteItem = async (id: string): Promise<void> => {
    try {
      const response = await $api<{ success: boolean }>(`/api/v1/surplus/${id}`, { method: 'DELETE' })
      if (response.success) {
        nuxt.$toast?.success('İlan silindi.')
        items.value = items.value.filter(i => i.id !== id)
      }
    } catch {
      nuxt.$toast?.error('İlan silinirken bir hata oluştu.')
    }
  }

  const reactivateItem = async (item: SurplusItem): Promise<void> => {
    const qty = prompt(`${item.title} için yeni miktar giriniz (${item.unit}):`, String(item.quantity))
    if (qty === null) return
    const quantity = parseFloat(qty)
    if (isNaN(quantity) || quantity <= 0) {
      nuxt.$toast?.error('Lütfen geçerli bir miktar giriniz.')
      return
    }
    try {
      const response = await $api<{ success: boolean }>(`/api/v1/surplus/${item.id}/reactivate`, {
        method: 'PATCH',
        body:   { quantity },
      })
      if (response.success) {
        nuxt.$toast?.success('İlan başarıyla yeniden aktif edildi.')
        await fetchItems()
      }
    } catch (err: unknown) {
      const msg = (err as { data?: { error?: string } })?.data?.error ?? 'İşlem başarısız.'
      nuxt.$toast?.error(msg)
    }
  }

  const acceptOffer = async (id: string): Promise<void> => {
    try {
      const response = await $api<{ success: boolean; sessionId?: string }>(
        `/api/v1/offers/${id}/accept`,
        { method: 'POST' }
      )
      if (response.success && response.sessionId) {
        nuxt.$toast?.success('Teklif kabul edildi! Swap sürecine yönlendiriliyorsunuz...')
        await navigateTo(`/ticaritakas/swap/${response.sessionId}`)
      } else if (response.success) {
        nuxt.$toast?.success('Teklif kabul edildi.')
        await Promise.all([fetchOffers(), fetchItems()])
      }
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'İşlem başarısız.'
      nuxt.$toast?.error(msg)
    }
  }

  const rejectOffer = async (id: string): Promise<void> => {
    try {
      const response = await $api<{ success: boolean }>(`/api/v1/offers/${id}/status`, {
        method: 'PATCH',
        body:   { status: 'rejected' },
      })
      if (response.success) {
        nuxt.$toast?.success('Teklif reddedildi.')
        await fetchOffers()
      }
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'İşlem başarısız.'
      nuxt.$toast?.error(msg)
    }
  }

  watch(activeTab, (newTab) => {
    if (newTab === 'listings') fetchItems()
    else fetchOffers()
  })

  return {
    items, offers, myChains, myCompany, activeTab, loading,
    showCreateModal, showCompanyModal, isTradeModalOpen, selectedItem, selectedChain,
    fetchMyCompany, fetchItems, fetchOffers, deleteItem, reactivateItem, acceptOffer, rejectOffer,
    handleRefresh: async (): Promise<void> => {
      if (activeTab.value === 'listings') await fetchItems()
      else await fetchOffers()
    },
    openCreateModal: (): void => {
      selectedItem.value  = null
      showCreateModal.value = true
    },
    openEditModal: (item: SurplusItem): void => {
      selectedItem.value  = item
      showCreateModal.value = true
    },
    showChainDetails: (chain: BarterChain): void => {
      selectedChain.value  = chain
      isTradeModalOpen.value = true
    },
    getItemChain: (itemId: string): BarterChain | undefined => {
      return myChains.value.find(chain =>
        chain.offers.some(o => o.offeredItemId === itemId),
      )
    },
  }
}
