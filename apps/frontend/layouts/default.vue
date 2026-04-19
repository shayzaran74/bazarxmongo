<template>
  <div class="min-h-screen bg-mesh pb-20 lg:pb-0 relative" style="overflow-x: clip;">
    <!-- Bileşenleşmiş Header -->
    <LayoutHeader 
      :currentEcosystem="currentEcosystem"
      :brandName="(ecosystemDisplayName as string)"
      :brandSubtitle="(ecosystemDisplaySubtitle as string)"
      :logoUrl="(siteLogoUrl || '')"
      :categories="mainCategories"
      :loading="pendingMegaMenu"
      @navigate="safeNavigateToEcosystem"
      @logo-click="handleLogoClick"
      @open-search="showAdvancedSearch = true"
      @open-location="locationModalOpen = true"
    />

    <!-- Page Content Area -->
    <div class="relative flex justify-center">
      <!-- Left Side Ads -->
      <ClientOnly>
        <LayoutPremiumSideAd v-if="showAds && isHomePage" side="left" :ads="leftAds" />
        <div v-else-if="isProductPage || isCheckoutPage" class="w-64 hidden 2xl:block" />
      </ClientOnly>

      <!-- Main Content -->
      <main class="max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 relative z-[1]">
        <slot />
      </main>

      <!-- Right Side Area -->
      <ClientOnly>
        <LayoutPremiumSideAd v-if="showAds && isHomePage" side="right" :ads="rightAds" />
        <CommonSidebarWidget v-else-if="isProductPage || isCheckoutPage" />
      </ClientOnly>
    </div>

    <!-- Bileşenleşmiş Footer -->
    <LayoutFooter />

    <!-- Bileşenleşmiş Mobil Navigasyon -->
    <LayoutMobileNav :cartCount="cartStore.count" />

    <!-- Modals & Overlays -->
    <Transition name="fade">
      <div
        v-show="locationModalOpen"
        class="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <div
          class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          @click="locationModalOpen = false"
        />
        <div
          class="relative bg-white rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-slide-up"
        >
          <div class="h-1.5 w-12 bg-gray-200 rounded-full mx-auto mt-4 sm:hidden" />
          <div class="p-8">
            <h3 class="text-2xl font-black text-gray-900 mb-6 flex items-center italic">
              <MapPinIcon class="h-7 w-7 mr-3 text-primary-600" />
              {{ $t('location.title') }}
            </h3>

            <div class="space-y-4">
              <!-- Auto Detect Location Button -->
              <button
                :disabled="geoLoading"
                class="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-2xl px-5 py-4 font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-wait"
                @click="autoDetectLocation"
              >
                <template v-if="geoLoading">
                  <svg
                    class="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>{{ $t('location.detecting') }}</span>
                </template>
                <template v-else>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>{{ $t('location.autoDetect') }}</span>
                </template>
              </button>

              <!-- Error Message -->
              <div
                v-if="geoError"
                class="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 flex items-start space-x-2"
              >
                <svg
                  class="h-5 w-5 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>{{ geoError }}</span>
              </div>

              <!-- Detected Location Display -->
              <div
                v-if="detectedCity"
                class="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3"
              >
                <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    class="h-5 w-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p class="text-[10px] font-bold text-green-600 uppercase tracking-wider">
                    {{ $t('location.detected')
                    }}
                  </p>
                  <p class="text-lg font-black text-green-800">
                    {{ detectedCity }}
                  </p>
                </div>
              </div>

              <div class="flex items-center space-x-4 my-4">
                <div class="flex-1 h-px bg-gray-200" />
                <span class="text-xs font-bold text-gray-400 uppercase">{{ $t('location.manualSelect') }}</span>
                <div class="flex-1 h-px bg-gray-200" />
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{{
                  $t('location.selectCity') }}</label>
                <select
                  v-model="selectedCity"
                  class="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 cursor-pointer appearance-auto"
                >
                  <option value="">
                    {{ $t('common.select') }}
                  </option>
                  <option
                    v-for="city in cities_list"
                    :key="city"
                    :value="city"
                  >
                    {{ city }}
                  </option>
                </select>
              </div>
              <button
                :disabled="!selectedCity && !detectedCity"
                class="w-full btn-primary h-14 uppercase tracking-widest text-xs font-black disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                @click="saveLocation"
              >
                {{
                  $t('location.apply') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Advanced Search Modal -->
    <Transition name="fade">
      <div
        v-show="showAdvancedSearch"
        class="fixed inset-0 z-[200] flex items-start justify-center pt-20 sm:pt-24 p-4"
      >
        <div
          class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          @click="showAdvancedSearch = false"
        />
        <div
          class="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all animate-slide-up"
        >
          <button
            class="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            @click="showAdvancedSearch = false"
          >
            <XMarkIcon class="h-5 w-5 text-gray-600" />
          </button>
          <div class="p-6">
            <ProductAdvancedSearch
              :initial-filters="{ search: '' }"
              :start-expanded="true"
              @filter="handleAdvancedSearch"
            />
          </div>
        </div>
      </div>
    </Transition>

    <!-- AI Assistant Widgets 
    <ClientOnly>
      <AiAIChatWidget />
      <AiAIAssistant />
    </ClientOnly>
    -->


    <!-- Vendor Required Warning Modal -->
    <Transition name="fade">
      <div
        v-show="showVendorRequiredModal"
        class="fixed inset-0 z-[300] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          @click="showVendorRequiredModal = false"
        />
        <div
          class="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-bounce-in"
        >
          <!-- Premium Background Pattern -->
          <div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary-600 to-indigo-700 opacity-10" />

          <div class="p-8 pt-12 text-center relative">
            <!-- Icon with Glow -->
            <div
              class="relative w-24 h-24 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary-500/30 rotate-3 group-hover:rotate-0 transition-transform"
            >
              <BuildingOffice2Icon class="h-12 w-12 text-white" />
              <LockClosedIcon
                class="absolute -bottom-2 -right-2 h-8 w-8 bg-white text-red-500 p-1.5 rounded-xl shadow-lg border-2 border-red-50"
              />
            </div>

            <h3 class="text-3xl font-black text-gray-900 mb-4 tracking-tighter italic">
              {{
                $t('ecosystem.vendorRequired')
              }}
            </h3>

            <p class="text-gray-500 font-medium leading-relaxed mb-8 px-4">
              {{ $t('ecosystem.vendorDescription') }}
            </p>

            <div class="grid grid-cols-1 gap-4">
              <button
                class="w-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl px-6 py-4 font-black uppercase tracking-widest text-sm shadow-xl shadow-primary-500/30 hover:scale-[1.02] transition-all"
                @click="navigateToVendorRegistration"
              >
                🚀 {{ $t('ecosystem.becomeVendor') }}
              </button>
              <button
                class="w-full bg-gray-50 text-gray-400 rounded-2xl px-6 py-4 font-bold uppercase tracking-widest text-xs hover:text-gray-600 transition-colors"
                @click="showVendorRequiredModal = false"
              >
                {{ $t('ecosystem.maybeLater') }}
              </button>
            </div>

            <!-- Footer Note -->
            <p class="mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {{ $t('ecosystem.trustCenter') }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { UserDTO, Category, ApiResponse } from '@barterborsa/shared-types'
import { cities as allCities, districts as allDistrictsMap } from '@/data/turkey_locations'
const cities_list = allCities
import {
  BriefcaseIcon,
  BuildingOffice2Icon,
  ShoppingCartIcon,
  HeartIcon,
  UserIcon,
  Cog6ToothIcon,
  ShoppingBagIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  HomeIcon,
  XMarkIcon,
  SparklesIcon,
  CreditCardIcon,
  ArrowLeftOnRectangleIcon,
  ArrowsRightLeftIcon,
    LockClosedIcon,
    ChevronDownIcon,
  ScaleIcon,
  QuestionMarkCircleIcon,
  PhoneIcon
} from '@heroicons/vue/24/outline'
import { useCategories } from '~/composables/useCategories'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()


// Store declarations MUST be before any functions that reference them
const authStore = useAuthStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const siteSettingsStore = useSiteSettingsStore()
const config = useRuntimeConfig()
const route = useRoute()
const { $api } = useApi()
const { resolveImageUrl } = useAppImage()

const categories = ref<Category[]>([])
const siteLogoUrl = computed(() => {
  const logo = siteSettingsStore.settings[`${currentEcosystem.value}_siteLogo`] || siteSettingsStore.settings.siteLogo
  return logo ? resolveImageUrl(logo as any) : null
})
const surplusCategories = ref<Category[]>([])
const { data: megaMenuData, pending: pendingMegaMenu } = useCategories()
const categoriesLoading = ref(false)
const showVendorRequiredModal = ref(false)

const safeNavigateToEcosystem = (path: string) => {
  // If Target is Ticari Takas (/surplus)
  if (path.startsWith('/surplus')) {
    if (!authStore.isLoggedIn) {
      useNuxtApp().$toast.error(t('ecosystem.loginRequired', { eco: 'Ticari Takas' }))
      return navigateTo('/login')
    }

    // Vendor Check
    if (!authStore.isVendor) {
      showVendorRequiredModal.value = true
      return
    }
  }

  // If Target is Barter Borsa
  if (path.startsWith('/barterborsa')) {
    if (!authStore.isLoggedIn) {
      useNuxtApp().$toast.error(t('ecosystem.loginRequired', { eco: 'Barter Borsa' }))
      return navigateTo('/login')
    }

    const tier = (authStore.user as UserDTO)?.currentTier || 'CORE'
    if (tier !== 'ELITE' && tier !== 'APEX') {
      interface NuxtAppWithToast { $toast: { success: (msg: string) => void; error: (msg: string, opts?: { duration?: number }) => void; info: (msg: string) => void } }
      (useNuxtApp() as unknown as NuxtAppWithToast).$toast.error(t('ecosystem.eliteApexOnly'), { duration: 4000 })
      return navigateTo('/premium')
    }
  }

  navigateTo(path)
}

const handleLogoClick = () => {
  safeNavigateToEcosystem(ecosystemHomeLink.value)
}

const navigateToVendorRegistration = () => {
  showVendorRequiredModal.value = false
  navigateTo('/become-vendor')
}


// Main categories shown in header - depends on current route
const mainCategories = computed(() => {
  // For /surplus, /my/surplus, /barter pages -> use SurplusCategory table
  if (route.path.startsWith('/surplus') || route.path.startsWith('/my/surplus') || route.path.startsWith('/barter')) {
    return surplusCategories.value.filter(c => !c.parentId && c.isActive)
  }
  // For other pages -> use Category table (mega menu optimized)
  return megaMenuData.value || []
})

interface HelpCategory { id: string | number; name: string; title?: string; slug: string }
interface LegalDocument { id: string | number; name: string; title: string; slug: string }
const helpCategories = ref<HelpCategory[]>([])
const legalDocuments = ref<LegalDocument[]>([])

const fetchHelpAndLegal = async () => {
  try {
    const [helpRes, legalRes] = await Promise.all([
      $api<HelpCategory[]>('/api/help/categories'),
      $api<LegalDocument[]>('/api/legal')
    ])
    if (helpRes.success) helpCategories.value = helpRes.data as any
    if (legalRes.success) legalDocuments.value = legalRes.data as any
  } catch (err) {
    console.warn('Fetch help/legal error:', err)
  }
}

const fetchCategories = async () => {
  categoriesLoading.value = true
  try {
    // Fetch standard product categories (Category table)
    const data = await $api<any>('/api/categories', {
      query: { all: true, includeChildren: true }
    })
    if (data.success) {
      categories.value = data.data
    }

    // Fetch Mega Menu categories - Handled by useCategories composable
    /*
    const megaMenuData = await $fetch('/api/categories/mega-menu', {
      baseURL: useRuntimeConfig().public.apiBase
    })
    if (megaMenuData.success) {
      megaMenuCategories.value = megaMenuData.data
    }
    */

    // Fetch surplus/barter categories (SurplusCategory table)
    const surplusData = await $fetch<ApiResponse<any>>('/api/surplus/categories', {
      baseURL: useRuntimeConfig().public.apiBase,
      query: { all: false, includeChildren: true } // all: false to get root-only with children
    })
    if (surplusData.success) {
      surplusCategories.value = surplusData.data
    }
  } catch (err) {
    console.error('Fetch categories error:', err)
  } finally {
    categoriesLoading.value = false
  }
}

onMounted(() => {
  fetchCategories()
})


interface SideAd { id: string | number; side: 'LEFT' | 'RIGHT'; link?: string; url?: string; image?: string }
const sideAds = ref<SideAd[]>([])
const leftAds = computed<SideAd[]>(() => sideAds.value.filter(ad => ad.side === 'LEFT'))
const rightAds = computed<SideAd[]>(() => sideAds.value.filter(ad => ad.side === 'RIGHT'))

const isHomePage = computed(() => {
  if (!route.name) return false
  const name = String(route.name)
  return name === 'index' ||
    name === 'barterborsa' ||
    name === 'barterborsa-index' ||
    name === 'surplus' ||
    name === 'surplus-index' ||
    route.path === '/' ||
    route.path === '/surplus' ||
    route.path === '/barterborsa'
})

const showAds = computed(() => {
  const eco = currentEcosystem.value
  const prefix = eco === 'ticaritakas' ? 'ticaritakas_' :
    eco === 'barterborsa' ? 'barterborsa_' :
      eco === 'bazarx' ? 'bazarx_' : ''

  const specific = siteSettingsStore.settings[`${prefix}showAds`]
  const global = siteSettingsStore.settings.showAds

  // Return true if either the ecosystem-specific setting or the global setting is 'true'
  return String(specific || global) === 'true'
})

const isProductPage = computed(() => {
  return route.name === 'products-slug' || route.path.startsWith('/products/')
})

const isCheckoutPage = computed(() => {
  return route.name === 'checkout' || route.path.startsWith('/checkout')
})

const fetchSideAds = async (city = '') => {
  try {
    const eco = currentEcosystem.value === 'ticaritakas' ? 'TICARITAKAS' :
      currentEcosystem.value === 'barterborsa' ? 'BARTER_BORSA' : 'BAZARX'
    const response = await $api<SideAd[]>('/api/settings/side-ads', {
      query: {
        city: city && city !== 'Tüm Türkiye' ? city : undefined,
        ecosystem: eco
      }
    })
    if (response.success) {
      sideAds.value = response.data as any
    }
  } catch (error) {
    console.error('Fetch side ads error:', error)
  }
}

onMounted(() => {
  fetchSideAds(selectedCity.value)
})

// UI States
const locationModalOpen = ref(false)
const showUserDropdown = ref(false)
const showAdvancedSearch = ref(false)
const selectedCity = ref(authStore.user?.city || '')

// Geolocation States
const geoLoading = ref(false)
const geoError = ref('')
const detectedCity = ref('')

// Auto-detect location using browser Geolocation API or IP fallback
const autoDetectLocation = async () => {
  geoLoading.value = true
  geoError.value = ''
  detectedCity.value = ''

  const hostname = window.location.hostname
  const isLocal = ['localhost', '127.0.0.1'].includes(hostname) ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.') ||
    hostname.endsWith('.nip.io') ||
    hostname.endsWith('.local')
  const isSecure = window.isSecureContext || window.location.protocol === 'https:'

  try {
    // 1. Try Browser Geolocation first (if secure or local)
    if (isSecure || isLocal) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0 // Her zaman taze konum al
          })
        })

        const { latitude, longitude, accuracy } = (position as GeolocationPosition).coords
        console.log(`[GEO] Browser coords: lat=${latitude}, lng=${longitude}, accuracy=${accuracy}m`)

        // Using reverse geocoding with addressdetails and zoom for better province resolution
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=tr&addressdetails=1&zoom=10&t=${Date.now()}`,
          {
            headers: { 'User-Agent': `TicariTakas/1.0 v${Date.now()}` },
            cache: 'no-store'
          }
        )

        if (response.ok) {
          const data = await response.json()
          const address = data.address || {}
          console.log('[GEO] Nominatim raw address:', JSON.stringify(address))

          // Province is the most reliable field for Turkish il (province)
          // state_district can also help in some cases
          const rawCity = address.province || address.state || address.state_district || address.city || address.region || address.town || ''
          const district = address.county || address.district || address.suburb || address.town || ''

          console.log(`[GEO] Parsed: rawCity="${rawCity}", district="${district}"`)

          if (rawCity) {
            processDetectedCity(rawCity, district)
            return
          }
        }
      } catch (browserErr) {
        console.warn('Browser geolocation failed, falling back to IP detection...', browserErr)
      }
    }

    // 2. Fallback: IP-based Geolocation via Backend Proxy
    try {
      const resp = await $fetch<ApiResponse<{city?: string; regionName?: string; district?: string;}>>('/api/settings/detect-location', {
        baseURL: useRuntimeConfig().public.apiBase
      })

      if (resp.success && (resp.data?.city || resp.data?.regionName)) {
        console.log(`[GEO] IP fallback: city="${resp.data.city}", region="${resp.data.regionName}"`)
        processDetectedCity(resp.data.city || '', resp.data.regionName || resp.data.district || '')
      } else {
        throw new Error('Şehir bilgisi otomatik tespit edilemedi.')
      }
    } catch (proxyErr) {
      throw new Error('Konum servislerine şu an ulaşılamıyor.')
    }

  } catch (err: unknown) {
    geoError.value = (err as { message?: string })?.message || 'Konum tespit edilemedi'
    console.error('Geolocation logic error:', err)
  } finally {
    geoLoading.value = false
  }
}

// Türkiye'de Nominatim ve IP servislerinin sıkça döndürdüğü alternatif isimler -> resmi il eşleştirmesi
const PROVINCE_ALIASES = {
  'antakya': 'Hatay',
  'iskenderun': 'Hatay',
  'defne': 'Hatay',
  'samandağ': 'Hatay',
  'samandag': 'Hatay',
  'reyhanlı': 'Hatay',
  'reyhanli': 'Hatay',
  'dörtyol': 'Hatay',
  'dortyol': 'Hatay',
  'erzin': 'Hatay',
  'payas': 'Hatay',
  'altınözü': 'Hatay',
  'altınozu': 'Hatay',
  'belen': 'Hatay',
  'hassa': 'Hatay',
  'kırıkhan': 'Hatay',
  'kirikhan': 'Hatay',
  'kumlu': 'Hatay',
  'yayladağı': 'Hatay',
  'yayladagi': 'Hatay',
  'hatay': 'Hatay',
  'izmit': 'Kocaeli',
  'gebze': 'Kocaeli',
  'adapazarı': 'Sakarya',
  'adapazari': 'Sakarya',
  'icel': 'Mersin',
  'içel': 'Mersin',
  'tarsus': 'Mersin',
  'silifke': 'Mersin',
  'anamur': 'Mersin',
  'erdemli': 'Mersin',
  'maras': 'Kahramanmaraş',
  'kahramanmaras': 'Kahramanmaraş',
  'urfa': 'Şanlıurfa',
  'sanliurfa': 'Şanlıurfa',
  'antep': 'Gaziantep',
  'nizip': 'Gaziantep',
  'islahiye': 'Gaziantep',
  'alanya': 'Antalya',
  'manavgat': 'Antalya',
  'serik': 'Antalya',
  'kas': 'Antalya',
  'kaş': 'Antalya',
  'ceyhan': 'Adana',
  'kozan': 'Adana',
  'pozantı': 'Adana',
  'pozanti': 'Adana'
}

// Helper to normalize and save detected city
const processDetectedCity = (rawCity: string, district = '') => {
  const trMap = {
    'İ': 'i', 'I': 'i', 'ı': 'i', 'ğ': 'g', 'Ğ': 'g',
    'ü': 'u', 'Ü': 'u', 'ş': 's', 'Ş': 's',
    'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c'
  };

  const normalize = (str: string | null | undefined) => {
    if (!str) return '';
    let n = str.toLowerCase();
    const map = trMap as Record<string, string>
    for (const key in map) n = n.replace(new RegExp(key, 'g'), map[key]);
    return n.trim();
  };

  const normalizedDetect = normalize(rawCity);
  console.log(`[GEO] processDetectedCity: rawCity="${rawCity}", normalized="${normalizedDetect}", district="${district}"`)

  let matchedCity = null

  // 0. Check province aliases first (Hatay/Antakya, Kocaeli/İzmit, etc.)
  if ((PROVINCE_ALIASES as Record<string, string>)[normalizedDetect]) {
    matchedCity = (PROVINCE_ALIASES as Record<string, string>)[normalizedDetect]
    console.log(`[GEO] Matched via alias: "${normalizedDetect}" -> "${matchedCity}"`)
  }

  // 1. Exact match with our province list
  if (!matchedCity) {
    matchedCity = cities_list.find(c => normalize(c) === normalizedDetect)
    if (matchedCity) console.log(`[GEO] Exact province match: "${matchedCity}"`)
  }

  // 2. Check alias for district
  if (!matchedCity && district) {
    const normalizedDistrict = normalize(district);
    if ((PROVINCE_ALIASES as Record<string, string>)[normalizedDistrict]) {
      matchedCity = (PROVINCE_ALIASES as Record<string, string>)[normalizedDistrict]
      console.log(`[GEO] District alias match: "${normalizedDistrict}" -> "${matchedCity}"`)
    }
  }

  // 3. Exact match district with province list
  if (!matchedCity && district) {
    const normalizedDistrict = normalize(district);
    matchedCity = cities_list.find(c => normalize(c) === normalizedDistrict)
    if (matchedCity) console.log(`[GEO] District exact province match: "${matchedCity}"`)
  }

  // 4. Search: Is rawCity a district of any province in our districts map?
  if (!matchedCity) {
    for (const [cityName, dists] of Object.entries(allDistrictsMap)) {
      if (dists.some(d => normalize(d) === normalizedDetect)) {
        matchedCity = cityName;
        console.log(`[GEO] rawCity is district of: "${cityName}"`)
        break;
      }
    }
  }

  // 5. Search: Is district name a district of any province?
  if (!matchedCity && district) {
    const normalizedDistrict = normalize(district);
    for (const [cityName, dists] of Object.entries(allDistrictsMap)) {
      if (dists.some(d => normalize(d) === normalizedDistrict)) {
        matchedCity = cityName;
        console.log(`[GEO] district is district of: "${cityName}"`)
        break;
      }
    }
  }

  // NOTE: We intentionally do NOT use includes() matching here
  // as it can cause false positives (e.g., matching "Adana" from partial strings)

  detectedCity.value = matchedCity || rawCity
  selectedCity.value = detectedCity.value
  console.log(`[GEO] Final detected city: "${detectedCity.value}"`)

  // Save to localStorage
  localStorage.setItem('detected_location', JSON.stringify({
    city: detectedCity.value,
    district: district,
    timestamp: Date.now()
  }))

  interface NuxtAppWithToast { $toast: { success: (msg: string) => void; error: (msg: string) => void; info: (msg: string) => void } }
  const toast = (useNuxtApp() as unknown as NuxtAppWithToast).$toast
  toast.success(`Konum tespit edildi: ${detectedCity.value}`)
}

// Load saved location on mount
const loadSavedLocation = () => {
  try {
    const saved = localStorage.getItem('detected_location')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Check if less than 24 hours old
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        detectedCity.value = parsed.city
        if (!selectedCity.value) {
          selectedCity.value = parsed.city
        }

        // Auto-apply to store if header/filters are empty
        if (!(authStore.user as UserDTO)?.city) {
          if (!authStore.user) {
            authStore.user = { city: parsed.city } as UserDTO
          } else {
            (authStore.user as UserDTO).city = parsed.city
          }
        }
      }
    }
  } catch (err) {
    console.error('Load saved location error:', err)
  }
}

watch(() => (authStore.user as UserDTO)?.city, (newCity) => {
  if (newCity) selectedCity.value = newCity
})

// Advanced Search from Modal
interface SearchFilters { search?: string; category?: string; minPrice?: number; maxPrice?: number; sort?: string }
const handleAdvancedSearch = (filters: SearchFilters) => {
  showAdvancedSearch.value = false
  const query: Record<string, string | number | undefined> = {}
  if (filters.search) query.search = filters.search
  if (filters.category) query.category = filters.category
  if (filters.minPrice) query.minPrice = filters.minPrice
  if (filters.maxPrice) query.maxPrice = filters.maxPrice
  if (filters.sort) query.sort = filters.sort

  const basePath = currentEcosystem.value === 'ticaritakas' ? '/surplus' : '/products'
  navigateTo({ path: basePath, query })
}

// Logic
const toggleUserDropdown = () => showUserDropdown.value = !showUserDropdown.value
const handleClickOutside = (e: MouseEvent) => {
  if (showUserDropdown.value && !(e.target as HTMLElement).closest('.group')) showUserDropdown.value = false
}

const saveLocation = async () => {
  const cityToSave = selectedCity.value || detectedCity.value
  console.log('[GEO] saveLocation called. Selected:', selectedCity.value, 'Detected:', detectedCity.value, 'Saving:', cityToSave)

  if (!cityToSave) {
    console.error('[GEO] Cannot save: No city selected or detected.')
    return
  }

  try {
    if (authStore.isLoggedIn && authStore.user) {
      console.log('[GEO] Saving for logged in user:', authStore.user.email)
      await authStore.updateLocation({
        city: cityToSave,
        district: ''
      })
    } else {
      console.log('[GEO] Saving for guest user -> cookies & state')
      // For guest users, save to cookie
      const locationCookie = useCookie('user_location')
      locationCookie.value = cityToSave

      // Update store state for UI matching
      if (!authStore.user) {
        authStore.user = { id: 'guest', email: '', role: 'GUEST', city: cityToSave } as UserDTO
      } else {
        (authStore.user as UserDTO).city = cityToSave
      }
    }

    // Persist to localStorage for automatic reload across sessions/pages
    localStorage.setItem('detected_location', JSON.stringify({
      city: cityToSave,
      timestamp: Date.now()
    }))

    // Refresh targeted content
    await fetchSideAds(cityToSave)

    locationModalOpen.value = false
    interface NuxtAppWithToast { $toast: { success: (msg: string) => void; error: (msg: string) => void; info: (msg: string) => void } }
    const toast = (useNuxtApp() as unknown as NuxtAppWithToast).$toast
    toast.success(`Konumunuz ${cityToSave} olarak güncellendi!`)
  } catch (error) {
    console.error('Error saving location:', error)
  }
}

// Watch for city changes to refresh ads
watch(selectedCity, (newCity) => {
  if (newCity && locationModalOpen.value) {
    // Only fetch if modal is open (user is interacting)
    // or if we want it to be fully reactive
    fetchSideAds(newCity)
  }
})

const handleLogout = async () => {
  await authStore.logout()
  navigateTo('/login')
}

const formatPrice = (p: number) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p || 0)
}

const { connect, disconnect } = useSocket()

// Global Lifecycle
// Ecosystem detection based on route
const currentEcosystem = computed(() => {
  if (route.path.startsWith('/surplus') || route.path.startsWith('/my/surplus') || route.path.startsWith('/my/offers') || route.path.startsWith('/my/trades')) {
    return 'ticaritakas'
  }
  if (route.path.startsWith('/barterborsa')) {
    return 'barterborsa'
  }
  return 'bazarx'
})

const ecosystemDisplayName = computed(() => {
  if (currentEcosystem.value === 'ticaritakas') return siteSettingsStore.settings.ticaritakas_siteName || t('ecosystem.ecoTicariTakas')
  if (currentEcosystem.value === 'barterborsa') return siteSettingsStore.settings.barterborsa_siteName || t('ecosystem.ecoBarterBorsa')
  return siteSettingsStore.settings.bazarx_siteName || t('ecosystem.ecoBazarX')
})

const ecosystemDisplaySubtitle = computed(() => {
  if (currentEcosystem.value === 'ticaritakas') return t('ecosystem.ticaritakasSubtitle')
  if (currentEcosystem.value === 'barterborsa') return t('ecosystem.barterborsaSubtitle')
  return t('ecosystem.bazarxSubtitle')
})

const ecosystemHomeLink = computed(() => {
  if (currentEcosystem.value === 'ticaritakas') return '/surplus'
  if (currentEcosystem.value === 'barterborsa') return '/barterborsa'
  return '/'
})

// Watch route changes to update ecosystem
watch(() => route.path, (newPath, oldPath) => {
  if (siteSettingsStore.settings && Object.keys(siteSettingsStore.settings).length > 0) {
    siteSettingsStore.setEcosystem(currentEcosystem.value)
  }
  // Re-fetch side ads when ecosystem changes
  if (newPath !== oldPath) {
    fetchSideAds(selectedCity.value || detectedCity.value)
  }
}, { immediate: true })

onMounted(async () => {
  await authStore.init()
  loadSavedLocation()
  await siteSettingsStore.fetchSettings()
  siteSettingsStore.setEcosystem(currentEcosystem.value)
  fetchSideAds(selectedCity.value || detectedCity.value)
  fetchHelpAndLegal()
  if (authStore.isLoggedIn) {
    cartStore.fetchCart()
    wishlistStore.fetchWishlist()

    // Connect to TicariTakas Socket
    try {
      const res = await $fetch<any>('/api/companies/me', {
        baseURL: config.public.apiBase,
        headers: { Authorization: `Bearer ${authStore.token}` }
      }).catch(() => null)
      if (res?.success && res?.company) {
        connect(res.company.id)
      } else {
        connect()
      }
    } catch (err) {
      console.error('Socket setup error:', err)
    }
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  disconnect()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom Additions for SSO Switcher Scale effect */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

.animate-slide-up {
  animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}

.nav-icon {
  transition-property: transform;
  transition-duration: 300ms;
}

/* Animated Side Ads Styles */
.ad-card {
  position: relative;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  background: white;
}

.ad-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  transform: skewX(-20deg);
  z-index: 10;
  pointer-events: none;
  transition: all 0.5s ease;
}

.ad-card:hover::after {
  animation: shine-sweep 1s ease-in-out forwards;
}

.ad-card-inner {
  position: relative;
  z-index: 2;
  border-radius: inherit;
  background-clip: padding-box;
}

.ad-card-left {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03), inset 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.ad-card-left .ad-card-inner {
  background: linear-gradient(to bottom, rgba(239, 246, 255, 0.9), rgba(255, 255, 255, 0.98));
}

.ad-card-left:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 50px rgba(59, 130, 246, 0.15), 0 0 30px rgba(59, 130, 246, 0.3), inset 0 0 0 2px rgba(59, 130, 246, 0.8);
}

.ad-card-right {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03), inset 0 0 0 2px rgba(168, 85, 247, 0.2);
}

.ad-card-right .ad-card-inner {
  background: linear-gradient(to bottom, rgba(250, 245, 255, 0.9), rgba(255, 255, 255, 0.98));
}

.ad-card-right:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 50px rgba(168, 85, 247, 0.15), 0 0 30px rgba(168, 85, 247, 0.3), inset 0 0 0 2px rgba(168, 85, 247, 0.8);
}

@keyframes shine-sweep {
  0% {
    left: -150%;
  }

  100% {
    left: 200%;
  }
}

@keyframes float-ad {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }

  100% {
    transform: translateY(0px);
  }
}

.animate-float-ad {
  animation: float-ad 6s ease-in-out infinite;
  will-change: transform;
}

@keyframes shimmer-fast {
  0% {
    transform: translateX(-150%);
  }

  100% {
    transform: translateX(200%);
  }
}

.animate-shimmer-fast {
  animation: shimmer-fast 1.2s ease-in-out infinite;
}

.ad-float-delay-0 {
  animation-delay: 0s;
}

.ad-float-delay-1 {
  animation-delay: 1.2s;
}

.ad-float-delay-2 {
  animation-delay: 2.4s;
}

.ad-float-delay-3 {
  animation-delay: 3.6s;
}

.ad-float-delay-4 {
  animation-delay: 4.8s;
}
</style>