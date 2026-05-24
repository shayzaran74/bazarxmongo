// apps/frontend/composables/useVendorEcosystem.ts
// Sprint 4: Ekosistem yönetim sayfaları için genişletildi

import { ref, computed } from 'vue'

export interface EcosystemMembership {
  ecosystem: {
    id: string
    name: string
    slug: string
    logoUrl?: string
    internalCommRate: number
    isBlindPool: boolean
  }
  status: 'ACTIVE' | 'SUSPENDED' | 'REMOVED'
  joinedAt: string
}

export interface BazarXListing {
  listingId: string
  productName: string
  currentPrice: number
  minMarketPrice: number
  mapCompliant: boolean
  mapGap?: number
  publishedAt?: string
  ecosystemName: string
  bazarxPublished: boolean
}

export interface GarageSale {
  id: string
  ecosystemName: string
  productName: string
  originalPrice: number
  campaignPrice: number
  discountRate: number
  maxQtyPerDealer: number
  myPurchasedQty: number
  remainingForMe: number
  totalRemaining: number
  startsAt: string
  endsAt: string
  status: 'SCHEDULED' | 'ACTIVE' | 'EXHAUSTED' | 'ENDED'
}

export const useVendorEcosystem = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp()

  // === MEVCUT STATE (Sprint 1-3) ===
  const ecosystem = ref<Record<string, unknown> | null>(null)
  const members = ref<Record<string, unknown>[]>([])
  const auditLogs = ref<Record<string, unknown>[]>([])
  const loading = ref(false)
  const creating = ref(false)
  const isOwner = ref(false)
  const vendorTier = ref<string | null>(null)
  const isApexPlus = computed(() => vendorTier.value === 'APEX')
  const error = ref<string | null>(null)
  const showInviteModal = ref(false)

  // === SPRINT 4: YENİ STATE'LER ===
  const memberships = ref<EcosystemMembership[]>([])
  const membershipLimit = ref<number>(0)
  const membershipCount = ref<number>(0)
  const canJoinMore = ref<boolean>(false)
  const upgradeRequired = ref<string | null>(null)

  const activeGarageSales = ref<GarageSale[]>([])
  const publishedListings = ref<BazarXListing[]>([])
  const publishLoading = ref<Record<string, boolean>>({})

  // === MEVCUT FONKSİYONLAR ===
  const fetchData = async () => {
    loading.value = true
    error.value = null
    try {
      const [ecoRes, auditRes, profileRes] = await Promise.allSettled([
        $api<{ success: boolean; ecosystem?: Record<string, unknown>; isOwner?: boolean }>('/api/v1/ecosystem/my'),
        $api<{ success: boolean; data?: Record<string, unknown>[] }>('/api/v1/ecosystem/audit'),
        $api<{ data?: { tier?: string }; tier?: string }>('/api/v1/vendors/me'),
      ])

      if (ecoRes.status === 'fulfilled' && ecoRes.value?.success) {
        ecosystem.value = ecoRes.value.ecosystem
        isOwner.value = ecoRes.value.isOwner
        members.value = (ecosystem.value?.members as Record<string, unknown>[]) || []
      }

      if (auditRes.status === 'fulfilled' && auditRes.value?.success) {
        auditLogs.value = auditRes.value.data || []
      }

      if (profileRes.status === 'fulfilled') {
        vendorTier.value = profileRes.value?.data?.tier ?? profileRes.value?.tier ?? null
      }
    } catch {
      error.value = 'Ekosistem verileri alınamadı'
    } finally {
      loading.value = false
    }
  }

  const inviteMember = async (memberVendorId: string) => {
    try {
      await $api('/api/v1/ecosystem/members', {
        method: 'POST',
        body: { memberVendorId }
      })
      $toast.success('Üye davet edildi')
      showInviteModal.value = false
      await fetchData()
    } catch {
      $toast.error('Davet gönderilemedi')
    }
  }

  const createEcosystem = async (name: string, description?: string) => {
    creating.value = true
    try {
      const res = await $api<{ success: boolean }>('/api/v1/ecosystem/create', {
        method: 'POST',
        body: { name, description }
      })
      if (res.success) {
        $toast.success('Ekosistem oluşturuldu')
        await fetchData()
        return true
      }
      return false
    } catch (e: unknown) {
      const errObj = e as { data?: { code?: string; message?: string } }
      const code = errObj?.data?.code
      if (code === 'ECOSYSTEM_REQUIRES_APEX') {
        $toast.error('Ekosistem kurabilmek için APEX B2B üyeliği gereklidir.')
      } else {
        $toast.error(errObj?.data?.message || 'Oluşturulamadı')
      }
      return false
    } finally {
      creating.value = false
    }
  }

  const removeMember = async (memberId: string) => {
    try {
      await $api(`/api/v1/ecosystem/members/${memberId}`, { method: 'DELETE' })
      $toast.success('Üye çıkarıldı')
      await fetchData()
    } catch {
      $toast.error('Üye çıkarılamadı')
    }
  }

  // === SPRINT 4: YENİ FONKSİYONLAR ===

  async function fetchMemberships(): Promise<void> {
    try {
      const data = await $api<{
        memberships?: EcosystemMembership[]
        membershipLimit?: number
        membershipCount?: number
        canJoinMore?: boolean
        upgradeRequired?: string
      }>('/api/v1/ecosystem/my')
      memberships.value = data.memberships ?? []
      membershipLimit.value = data.membershipLimit ?? 0
      membershipCount.value = data.membershipCount ?? 0
      canJoinMore.value = data.canJoinMore ?? false
      upgradeRequired.value = data.upgradeRequired ?? null
    } catch {
      // Membership fetch hatası — kota bilgisi alınamaz
    }
  }

  async function fetchPublishedListings(): Promise<void> {
    try {
      const data = await $api<{ listings?: BazarXListing[] }>('/api/v1/ecosystem/dealer/published')
      publishedListings.value = data.listings ?? []
    } catch {
      // Yayın listesi alınamaz
    }
  }

  async function toggleBazarXPublish(listingId: string, currentlyPublished: boolean): Promise<void> {
    publishLoading.value[listingId] = true
    try {
      if (currentlyPublished) {
        await $api(`/api/v1/ecosystem/dealer/publish/${listingId}`, {
          method: 'DELETE',
          body: { ecosystemId: '' }
        })
      } else {
        await $api(`/api/v1/ecosystem/dealer/publish/${listingId}`, {
          method: 'POST',
          body: { ecosystemId: '' }
        })
      }
      await fetchPublishedListings()
    } catch (e: unknown) {
      const errObj = e as { data?: { code?: string; message?: string } }
      const code = errObj?.data?.code
      if (code === 'MAP_PRICE_VIOLATION') {
        $toast.error('Fiyatınız MAP politikasının altında — yayınlanamaz.')
      } else if (code === 'ONLINE_RESALE_NOT_ALLOWED') {
        $toast.error('Fabrika bu ürün için online satışa izin vermiyor.')
      } else if (code === 'NOT_ECOSYSTEM_MEMBER') {
        $toast.error('Bu işlem için ekosistemin üyesi olmalısınız.')
      } else {
        $toast.error(errObj?.data?.message || ' işlem başarısız')
      }
      throw e
    } finally {
      publishLoading.value[listingId] = false
    }
  }

  async function fetchActiveGarageSales(): Promise<void> {
    try {
      const data = await $api<{ garageSales?: GarageSale[] }>('/api/v1/ecosystem/dealer/garage-sales')
      activeGarageSales.value = data.garageSales ?? []
    } catch {
      // Garaj günü kampanyaları alınamaz
    }
  }

  return {
    // Mevcut state
    ecosystem, members, auditLogs, loading, creating, isOwner, isApexPlus, vendorTier,
    error, showInviteModal, fetchData, inviteMember, createEcosystem, removeMember,
    // Sprint 4 state'ler
    memberships, membershipLimit, membershipCount, canJoinMore, upgradeRequired,
    activeGarageSales, publishedListings, publishLoading,
    // Sprint 4 fonksiyonları
    fetchMemberships, fetchPublishedListings, toggleBazarXPublish, fetchActiveGarageSales,
  }
}
