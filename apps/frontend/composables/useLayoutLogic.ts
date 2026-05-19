import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { UserDTO } from '@barterborsa/shared-types'
import { cities as cityList, districts as districtMap } from '@/data/turkey_locations'

export const useLayoutLogic = () => {
  const { $api } = useApi()
  const route = useRoute()
  const authStore = useAuthStore()
  const siteSettingsStore = useSiteSettingsStore()
  const cartStore = useCartStore()
  const wishlistStore = useWishlistStore()
  const { t } = useI18n()
  const { connect, disconnect } = useSocket()
  const { resolveImageUrl } = useAppImage()

  // ── UI State ─────────────────────────────────────────────
  const locationModalOpen    = ref(false)
  const showAdvancedSearch   = ref(false)
  const showVendorRequiredModal = ref(false)
  const selectedCity         = ref(authStore.user?.city || '')
  const geoLoading           = ref(false)
  const geoError             = ref('')
  const detectedCity = ref('')
  const sideAds = ref<any[]>([])
  const layoutCategories = ref<any[]>([])

  // ── Ecosystem ─────────────────────────────────────────────
  const currentEcosystem = computed(() => {
    if (route.path.startsWith('/ticaritakas') || route.path.startsWith('/my/offers')) return 'ticaritakas'
    if (route.path.startsWith('/barterborsa')) return 'barterborsa'
    return 'bazarx'
  })

  const ecosystemHomeLink = computed(() => {
    if (currentEcosystem.value === 'ticaritakas') return '/ticaritakas'
    if (currentEcosystem.value === 'barterborsa') return '/barterborsa'
    return '/'
  })

  const siteLogoUrl = computed(() => {
    const logo = siteSettingsStore.settings[`${currentEcosystem.value}_siteLogo`] || siteSettingsStore.settings.siteLogo
    return logo ? resolveImageUrl(logo as any) : null
  })

  // ── Side Ads ──────────────────────────────────────────────
  const fetchSideAds = async (city = '') => {
    try {
      const ecoMap: Record<string, string> = { ticaritakas: 'TICARITAKAS', barterborsa: 'BARTER_BORSA', bazarx: 'BAZARX' }
      const res: any = await $api('/api/v1/side-ads', {
        query: { city: city && city !== 'Tüm Türkiye' ? city : undefined, ecosystem: ecoMap[currentEcosystem.value] }
      })
      console.log('useLayoutLogic - fetchSideAds result:', res)
      if (res.success) {
        sideAds.value = res.data
        console.log('useLayoutLogic - sideAds.value set to:', sideAds.value.length, 'items')
      }
    } catch (e) { console.error('Ads error:', e) }
  }

  // ── Location: save ────────────────────────────────────────
  const saveLocation = async (city: string) => {
    if (!city) return
    try {
      if (authStore.isLoggedIn) {
        await authStore.updateLocation({ city, district: '' })
      } else {
        const cookie = useCookie('user_location')
        cookie.value = city
        if (!authStore.user) authStore.user = { id: 'guest', city } as any
        else (authStore.user as UserDTO).city = city
      }
      localStorage.setItem('detected_location', JSON.stringify({ city, timestamp: Date.now() }))
      await fetchSideAds(city)
      locationModalOpen.value = false
      useNuxtApp().$toast.success(`Konumunuz ${city} olarak güncellendi!`)
    } catch (e) { console.error('Save location error:', e) }
  }

  // ── Location: auto-detect ─────────────────────────────────
  const PROVINCE_ALIASES: Record<string, string> = {
    antakya: 'Hatay', iskenderun: 'Hatay', izmit: 'Kocaeli', gebze: 'Kocaeli',
    adapazarı: 'Sakarya', adapazari: 'Sakarya', icel: 'Mersin', içel: 'Mersin',
    urfa: 'Şanlıurfa', sanliurfa: 'Şanlıurfa', antep: 'Gaziantep', maras: 'Kahramanmaraş'
  }

  const normalize = (s: string) => {
    if (!s) return ''
    const map: Record<string, string> = { İ: 'i', I: 'i', ı: 'i', ğ: 'g', Ğ: 'g', ü: 'u', Ü: 'u', ş: 's', Ş: 's', ö: 'o', Ö: 'o', ç: 'c', Ç: 'c' }
    return s.toLowerCase().replace(/[İIığĞüÜşŞöÖçÇ]/g, c => map[c] ?? c).trim()
  }

  const matchCity = (raw: string, district = '') => {
    const n = normalize(raw)
    if (PROVINCE_ALIASES[n]) return PROVINCE_ALIASES[n]
    const direct = cityList.find(c => normalize(c) === n)
    if (direct) return direct
    if (district) {
      const nd = normalize(district)
      if (PROVINCE_ALIASES[nd]) return PROVINCE_ALIASES[nd]
      const fromDistrict = cityList.find(c => normalize(c) === nd)
      if (fromDistrict) return fromDistrict
    }
    for (const [city, dists] of Object.entries(districtMap)) {
      if ((dists as string[]).some(d => normalize(d) === n)) return city
    }
    return raw
  }

  const autoDetectLocation = async () => {
    geoLoading.value = true
    geoError.value = ''
    detectedCity.value = ''

    try {
      const isSecure = window.isSecureContext || location.protocol === 'https:'
      const isLocal  = ['localhost', '127.0.0.1'].includes(location.hostname)

      if (isSecure || isLocal) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000 })
          )
          const { latitude: lat, longitude: lon } = pos.coords
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=tr&addressdetails=1&zoom=10`, {
            headers: { 'User-Agent': 'BazarX/1.0' }, cache: 'no-store'
          })
          if (r.ok) {
            const d = await r.json()
            const a = d.address || {}
            const raw  = a.province || a.state || a.city || a.region || ''
            const dist = a.county  || a.district || a.town || ''
            if (raw) {
              const city = matchCity(raw, dist)
              detectedCity.value = city
              selectedCity.value = city
              localStorage.setItem('detected_location', JSON.stringify({ city, timestamp: Date.now() }))
              useNuxtApp().$toast.success(`Konum tespit edildi: ${city}`)
              return
            }
          }
        } catch { /* fall through to IP */ }
      }
      // IP fallback
      const resp: any = await $api('/api/settings/detect-location')
      if (resp.success && (resp.data?.city || resp.data?.regionName)) {
        const city = matchCity(resp.data.city || '', resp.data.regionName || '')
        detectedCity.value = city
        selectedCity.value = city
      } else {
        throw new Error('Şehir bilgisi tespit edilemedi.')
      }
    } catch (err: any) {
      geoError.value = err?.message || 'Konum tespit edilemedi'
    } finally {
      geoLoading.value = false
    }
  }

  // ── Auth city watch ───────────────────────────────────────
  watch(() => (authStore.user as UserDTO)?.city, (c) => { if (c) selectedCity.value = c })

  // ── Route watch (ecosystem & ads) ─────────────────────────
  watch(() => route.path, (n, o) => {
    if (siteSettingsStore.settings && Object.keys(siteSettingsStore.settings).length) {
      siteSettingsStore.setEcosystem(currentEcosystem.value)
    }
    if (n !== o) fetchSideAds(selectedCity.value || detectedCity.value)
  }, { immediate: true })

  // ── Global Init ───────────────────────────────────────────
  const initLayout = async () => {
    // Load saved location from localStorage
    try {
      const saved = localStorage.getItem('detected_location')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Date.now() - parsed.timestamp < 86400000) {
          detectedCity.value = parsed.city
          if (!selectedCity.value) selectedCity.value = parsed.city
        }
      }
    } catch { /* ignore */ }

    await authStore.init()
    await siteSettingsStore.fetchSettings()
    siteSettingsStore.setEcosystem(currentEcosystem.value)
    fetchSideAds(selectedCity.value)
    
    // Fetch categories for layout
    try {
      const res: any = await $api('/api/categories', { query: { all: true } })
      if (res.success && res.data) {
        layoutCategories.value = Array.isArray(res.data.items) ? res.data.items : (Array.isArray(res.data) ? res.data : [])
      }
    } catch { /* ignore */ }

    if (authStore.isLoggedIn) {
      cartStore.fetchCart()
      wishlistStore.fetchWishlist()
      try {
        const res: any = await $api('/api/companies/me').catch(() => null)
        connect(res?.data?.id || undefined)
      } catch { connect() }
    }
  }

  return {
    // state
    locationModalOpen, showAdvancedSearch, showVendorRequiredModal,
    selectedCity, geoLoading, geoError, detectedCity, sideAds,
    // computed
    currentEcosystem, ecosystemHomeLink, siteLogoUrl,
    brandName: computed(() => (siteSettingsStore.settings?.brandName as string) || 'BazarX'),
    brandSubtitle: computed(() => (siteSettingsStore.settings?.brandSubtitle as string) || 'Private Apex Portal'),
    categories: computed(() => layoutCategories.value),
    cartCount: computed(() => cartStore.itemCount || 0),
    // methods
    fetchSideAds, saveLocation, autoDetectLocation, initLayout, disconnect
  }
}
