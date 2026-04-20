import { ref, onMounted } from 'vue'

export const useHomepageSettings = (ecosystem?: string) => {
  const { $api } = useApi()
  const config = useRuntimeConfig()
  const toast = useNuxtApp().$toast

  const saving = ref(false)
  const logoPreview = ref<string | null>(null)
  const logoFile = ref<File | null>(null)
  const shippingTiers = ref<any[]>([])

  const settings = ref({
    siteName: 'TicariTakas',
    siteLogo: '',
    showAuctions: true,
    showLotteries: true,
    showGroupBuy: true,
    showFlashSales: true,
    showSpecialOffers: true,
    showAds: true,
    showHomeSlider: true,
    showPersonalized: true,
    showBarterPool: true,
    showQuadCards: true,
    autoApproveListings: 'none',
    autoApproveOffers: 'none',
    shippingTiers: '[]'
  })

  const getLogoUrl = (logo: string) => {
    if (!logo) return null
    return logo.startsWith('http') ? logo : `${config.public.apiBase}${logo}`
  }

  const fetchSettings = async () => {
    try {
      const res: any = await $api('/api/admin/settings')
      if (res.success) {
        const prefix = ecosystem ? `${ecosystem.toLowerCase()}_` : ''
        const getVal = (key: string) => (res.data[prefix + key] !== undefined) ? res.data[prefix + key] : res.data[key]

        // Map settings
        Object.keys(settings.value).forEach(key => {
          const val = getVal(key)
          if (val === 'true') (settings.value as any)[key] = true
          else if (val === 'false') (settings.value as any)[key] = false
          else if (val !== undefined) (settings.value as any)[key] = val
        })

        // Shipping tiers parse
        try {
          shippingTiers.value = JSON.parse(settings.value.shippingTiers || '[]')
        } catch (e) {
          shippingTiers.value = []
        }
      }
    } catch (e) {
      toast.error('Ayarlar yüklenemedi')
    }
  }

  const saveSettings = async () => {
    saving.value = true
    try {
      let logoUrl = settings.value.siteLogo
      if (logoFile.value) {
        const formData = new FormData()
        formData.append('logo', logoFile.value)
        const uploadRes: any = await $api('/api/admin/settings/upload-logo', { method: 'POST', body: formData })
        if (uploadRes.success) logoUrl = uploadRes.logoUrl
      }

      const prefix = ecosystem ? `${ecosystem.toLowerCase()}_` : ''
      const payload: any = {}
      
      Object.keys(settings.value).forEach(key => {
        let val = (settings.value as any)[key]
        if (typeof val === 'boolean') val = val.toString()
        payload[prefix + key] = val
      })
      
      payload[prefix + 'shippingTiers'] = JSON.stringify(shippingTiers.value)
      payload[prefix + 'siteLogo'] = logoUrl

      const res: any = await $api('/api/admin/settings', { method: 'PATCH', body: { settings: payload } })
      if (res.success) {
        toast.success('Ayarlar kaydedildi')
        await fetchSettings()
      }
    } finally {
      saving.value = false
    }
  }

  return {
    settings, shippingTiers, saving, logoPreview, logoFile,
    getLogoUrl, fetchSettings, saveSettings
  }
}
