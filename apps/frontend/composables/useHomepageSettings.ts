// composables/useHomepageSettings.ts
import { useApi } from '~/composables/useApi'

interface ShippingTier {
  min: number
  max: number
  cost: number
}

interface HomepageSettings {
  siteName: string
  siteLogo: string
  showFlashSales: boolean
  showSpecialOffers: boolean
  showAds: boolean
  showHomeSlider: boolean
  showQuadCards: boolean
  showAuctions: boolean
  showLotteries: boolean
  showGroupBuy: boolean
  showPersonalized: boolean
  showBarterPool: boolean
  autoApproveListings: 'none' | 'verified_companies' | 'all'
  autoApproveOffers: 'none' | 'verified_companies' | 'all'
  showPersonalizedProducts: boolean
  showPerformance: boolean
  showVendors: boolean
  showRestaurants: boolean
  showBrands: boolean
  showNewsletter: boolean
  [key: string]: unknown
}

const SETTING_DEFAULTS: HomepageSettings = {
  siteName:             '',
  siteLogo:             '',
  showFlashSales:       true,
  showSpecialOffers:    true,
  showAds:              true,
  showHomeSlider:       true,
  showQuadCards:        true,
  showAuctions:         true,
  showLotteries:        true,
  showGroupBuy:         true,
  showPersonalized:     true,
  showBarterPool:       true,
  autoApproveListings:  'none',
  autoApproveOffers:    'none',
  showPersonalizedProducts: true,
  showPerformance:      true,
  showVendors:          true,
  showRestaurants:      true,
  showBrands:           true,
  showNewsletter:       true,
}

export const useHomepageSettings = (ecosystem?: string) => {
  const { $api } = useApi()
  const config = useRuntimeConfig()
  const { $toast } = useNuxtApp() as { $toast: { success: (m: string) => void; error: (m: string) => void } }

  const endpoint = ecosystem
    ? `/api/v1/admin/settings/homepage?ecosystem=${ecosystem}`
    : '/api/v1/admin/settings/homepage'

  const settings    = ref<HomepageSettings>({ ...SETTING_DEFAULTS })
  const shippingTiers = ref<ShippingTier[]>([])
  const loading     = ref(false)
  const saving      = ref(false)
  const logoPreview = ref<string | null>(null)
  const logoFile    = ref<File | null>(null)

  const getLogoUrl = (logo: string): string => {
    if (!logo) return ''
    if (logo.startsWith('http')) return logo
    return `${config.public.apiBase}${logo}`
  }

  const fetchSettings = async (): Promise<void> => {
    loading.value = true
    try {
      const res = await $api<{ shippingTiers?: ShippingTier[] } & HomepageSettings>(endpoint)
      if (res.success && res.data) {
        const { shippingTiers: tiers = [], ...rest } = res.data as Record<string, unknown> & { shippingTiers?: ShippingTier[] }
        settings.value    = { ...SETTING_DEFAULTS, ...(rest as HomepageSettings) }
        shippingTiers.value = Array.isArray(tiers) ? tiers : []
      }
    } catch {
      // Sessiz hata — sayfa boş varsayılanlarla açılır
    } finally {
      loading.value = false
    }
  }

  const saveSettings = async (): Promise<void> => {
    saving.value = true
    try {
      // Logo dosyası seçildiyse önce yükle
      if (logoFile.value) {
        const form = new FormData()
        form.append('file', logoFile.value)
        const uploadRes = await $api<{ mediaId: string; url: string }>(
          '/api/v1/media/upload?subPath=settings',
          { method: 'POST', body: form },
        )
        if (uploadRes.success && uploadRes.data) {
          settings.value.siteLogo = uploadRes.data.url || uploadRes.data.mediaId
        }
        logoFile.value = null
      }

      await $api(endpoint, {
        method: 'PUT',
        body: { ...settings.value, shippingTiers: shippingTiers.value },
      })

      $toast.success('Ayarlar kaydedildi')
    } catch {
      $toast.error('Ayarlar kaydedilemedi')
    } finally {
      saving.value = false
    }
  }

  return {
    settings,
    shippingTiers,
    loading,
    saving,
    logoPreview,
    logoFile,
    getLogoUrl,
    fetchSettings,
    saveSettings,
  }
}
