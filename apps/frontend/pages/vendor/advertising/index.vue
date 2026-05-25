<!-- apps/frontend/pages/vendor/advertising/index.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
    PlusIcon, 
    GiftIcon, 
    EyeIcon, 
    CursorArrowRaysIcon as MouseIcon, 
    CreditCardIcon, 
    RocketLaunchIcon 
} from '@heroicons/vue/24/outline'

// Components
import AdStatsCards from '~/components/vendor/advertising/AdStatsCards.vue'
import AdCampaignTable from '~/components/vendor/advertising/AdCampaignTable.vue'
import AdStoreLayoutCards from '~/components/vendor/advertising/AdStoreLayoutCards.vue'
import AdCampaignModal from '~/components/vendor/advertising/AdCampaignModal.vue'
import AdSwapModal from '~/components/vendor/advertising/AdSwapModal.vue'
import AdLayoutEditorModal from '~/components/vendor/advertising/AdLayoutEditorModal.vue'
import AdReportModal from '~/components/vendor/advertising/AdReportModal.vue'

// Types & Composables
import type { 
    AdCampaign, 
    AdSummary, 
    VendorProduct, 
    TargetSlot, 
    NewCampaignForm, 
    SwapCampaignForm, 
    LayoutForm,
    SummaryStat
} from '~/types/advertising'
import type { ApiResponse } from '@barterborsa/shared-types'
import { useAds } from '~/composables/useAds'

definePageMeta({
    layout: 'vendor',
    middleware: 'vendor'
})

const ads = useAds()
const { $api } = useApi()
const { $toast } = useNuxtApp()

// --- State ---
const adCampaigns = ref<AdCampaign[]>([])
const vendorProducts = ref<VendorProduct[]>([])
const currentTab = ref('HEPSİ')
const summary = ref<AdSummary>({
    impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0, ctr: 0, cpc: 0, roas: 0
})

// UI State
const isLoading = ref(false)
const isCreateModalOpen = ref(false)
const isAdSwapModalOpen = ref(false)
const isLayoutModalOpen = ref(false)
const isReportModalOpen = ref(false)
const reportLoading = ref(false)

// Modals State
const activeReportCampaign = ref<AdCampaign | null>(null)
const reportCoupons = ref<any[]>([])
const selectedLayoutType = ref(1)
const isSavingLayout = ref(false)
const isUploadingBanner = ref(false)
const initialLayoutForm = ref<LayoutForm>({ id: null, imageUrl: '', linkUrl: '', template: 'A' })

// Temporary previews
const campaignImagePreview = ref<string | null>(null)
const swapImagePreview = ref<string | null>(null)

const availableSlots: TargetSlot[] = [
    { id: 'SEARCH_TOP', label: 'Arama Sonuçları (Üst)' },
    { id: 'SEARCH_SIDEBAR', label: 'Arama Yan Panel' },
    { id: 'CATEGORY_BANNER', label: 'Kategori Banner' },
    { id: 'PRODUCT_SIMILAR', label: 'Benzer Ürünler' },
    { id: 'HOMEPAGE_FEATURED', label: 'Anasayfa Öne Çıkan' },
    { id: 'CART_UPSELL', label: 'Sepet Önerileri' },
    { id: 'PERSONALIZED_FEED', label: 'Kişiselleştirilmiş Akış' },
    { id: 'SPECIAL_OFFER_SPOT', label: 'Özel Fırsat Spotu' },
    { id: 'FLASH_PRODUCTS', label: 'Flaş Ürünler' },
    { id: 'SANA_OZEL', label: 'Sana Özel Tercihler' },
    { id: 'PERFORMANCE_VITRIN', label: 'Performans Vitrini' },
    { id: 'HOME_BANNER', label: 'Anasayfa Ana Banner' },
    { id: 'SIDE_ADS', label: 'Yan Reklamlar' }
]

// --- Computed ---
const filteredAds = computed(() => {
    if (currentTab.value === 'AKTİF') return adCampaigns.value.filter(a => a.status === 'ENABLED')
    if (currentTab.value === 'DURAKLATILDI') return adCampaigns.value.filter(a => a.status === 'PAUSED')
    return adCampaigns.value
})

const summaryStats = computed<SummaryStat[]>(() => {
    // Helper formatting internally (or import from a utility if available)
    const formatNumber = (num: number) => new Intl.NumberFormat('tr-TR').format(num || 0)
    const formatCurrency = (amount: number) => ((amount || 0) / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    return [
        { label: 'GÖSTERİM', value: formatNumber(summary.value.impressions), icon: EyeIcon, color: 'indigo', trend: 1 },
        { label: 'TIKLAMA', value: formatNumber(summary.value.clicks), icon: MouseIcon, color: 'purple', trend: 1 },
        { label: 'HARCAMA', value: '₺' + formatCurrency(summary.value.spend), icon: CreditCardIcon, color: 'pink', trend: 1 },
        { label: 'ROAS', value: (summary.value.roas || 0).toFixed(2) + 'x', icon: RocketLaunchIcon, color: 'green', trend: 1 }
    ]
})

// --- Methods ---
const fetchData = async () => {
    try {
        // Explicitly type the API calls to avoid tuple inference issues
        const adsRes = await ads.fetchCampaigns() as any
        const summaryRes = await ads.getAdSummary(30) as any
        const productsRes = await $api<any[]>('/api/v1/vendors/products', { params: { limit: 500 } })

        if (summaryRes && (summaryRes as any).success && (summaryRes as any).data) {
            summary.value = (summaryRes as any).data.summary || {
                impressions: 0, clicks: 0, spend: 0, sales: 0, orders: 0, ctr: 0, cpc: 0, roas: 0
            }
        }
        if (productsRes && productsRes.success && productsRes.data) {
            vendorProducts.value = (productsRes.data as any[]).map((p: any) => ({
                id: p.id,
                name: p.name,
                sku: p.sku,
                price: p.price,
                image: p.image || p.visual1 || 'https://placehold.co/100x100?text=Ürün',
                stock: p.stock,
                status: p.status
            }))
        }

        if (adsRes && (adsRes as any).success && (adsRes as any).data) {
            const rawCampaigns = (adsRes as any).data || []
            adCampaigns.value = rawCampaigns.map((campaign: any) => {
                let productIds = campaign.targetKeywords || []
                if (!Array.isArray(productIds)) productIds = [productIds]
                const matchedProducts = productIds.map((pId: string) => {
                    const product = vendorProducts.value.find(p => p.id === pId)
                    return product ? {
                        id: pId,
                        product: {
                            id: pId,
                            name: product.name,
                            image: product.image,
                            sku: product.sku
                        }
                    } : null
                }).filter(Boolean)
                return {
                    ...campaign,
                    products: matchedProducts
                }
            })
        }

        console.log('[DEBUG] fetchCampaigns response:', JSON.stringify(adsRes, null, 2))
        console.log('[DEBUG] adCampaigns after fetch:', JSON.stringify(adCampaigns.value, null, 2))
    } catch (err) {
        console.error('Fetch data error:', err)
    }
}

const handleCreateCampaign = async (form: NewCampaignForm, products: string[], cities: string[], districts: string[], file: File | null) => {
    isLoading.value = true
    try {
        let mediaUrl: string | undefined = undefined
        if (file) {
            const uploadRes = await ads.uploadBanner(file)
            if (uploadRes.success && uploadRes.data?.url) {
                mediaUrl = uploadRes.data.url
            }
        }

        const payload = {
            name: form.name,
            platform: form.platform || 'BAZARX',
            budget: Number(form.budget),
            adType: form.type,
            bidAmount: form.pricingModel === 'CPC' ? Number(form.maxBidPerClick) : Number(form.maxBidPerMille),
            pricingModel: form.pricingModel,
            startDate: form.startDate,
            endDate: form.endDate || undefined,
            targetCities: cities,
            targetDistricts: districts,
            targetSlots: form.targetSlots,
            targetKeywords: products,
            negativeKeywords: form.negativeKeywords,
            mediaUrl: mediaUrl
        }

        const res = await ads.createAdCampaign(payload as any)
        console.log('[DEBUG] createAdCampaign response:', JSON.stringify(res, null, 2))
        if (res.success) {
            $toast.success('Kampanya oluşturuldu')
            isCreateModalOpen.value = false
            fetchData()
        }
    } catch (err) {
        $toast.error('Oluşturma başarısız')
    } finally {
        isLoading.value = false
    }
}

const handleCreateSwap = async (form: SwapCampaignForm, cities: string[], districts: string[], file: File | null) => {
    isLoading.value = true
    try {
        let imageUrl: string | undefined = undefined
        if (file) {
            const uploadRes = await ads.uploadBanner(file)
            if (uploadRes.success && uploadRes.data?.url) {
                imageUrl = uploadRes.data.url
            }
        }

        const payload = {
            name: form.name,
            adPackage: form.adPackage,
            campaignType: form.campaignType,
            platform: form.platform || 'BAZARX',
            targetSlots: form.targetSlots,
            productIds: form.productIds,
            targetUrl: form.targetUrl,
            targetCities: cities,
            targetDistricts: districts,
            imageUrl: imageUrl
        }

        const res = await $api<any>('/api/v1/vendors/ads/ad-swap', { method: 'POST', body: payload })
        if (res.success) {
            $toast.success('Ad-Swap başlatıldı')
            isAdSwapModalOpen.value = false
            fetchData()
        }
    } catch (err) {
        $toast.error('Takas oluşturulamadı')
    } finally {
        isLoading.value = false
    }
}

const openLayoutModal = async (type: number) => {
    selectedLayoutType.value = type
    initialLayoutForm.value = { id: null, imageUrl: '', linkUrl: '', template: 'A' }
    
    try {
        const res = await ads.fetchBanners({ type })
        if (res.success && res.data && res.data.length > 0) {
            const existing = res.data[0] // Type is correctly inferred from useAds
            initialLayoutForm.value = {
                id: existing.id,
                imageUrl: existing.mediaUrl || existing.imageUrl || '',
                linkUrl: existing.targetUrl || existing.linkUrl || '',
                template: existing.template || 'A',
                status: existing.adStatus || existing.status,
                rejectionReason: existing.rejectionReason
            }
        }
    } catch (e) {}
    isLayoutModalOpen.value = true
}

const handleSaveLayout = async (form: LayoutForm, cities: string[], districts: string[]) => {
    isSavingLayout.value = true
    try {
        const titles: Record<number, string> = {
            1: 'Kategori Sayfası Bannerı',
            2: 'Benzer Ürünler Reklamı',
            3: 'Marka Mağazası Tasarımı'
        }
        const slotIds: Record<number, string> = {
            1: 'CATEGORY_BANNER',
            2: 'PRODUCT_SIMILAR',
            3: 'BRAND_STORE'
        }

        const payload = {
            name: titles[selectedLayoutType.value] || 'Özel Yerleşim',
            platform: 'BAZARX',
            budget: 0,
            adType: 'BANNER',
            bidAmount: 0,
            pricingModel: 'CPC',
            startDate: new Date().toISOString(),
            targetSlots: [slotIds[selectedLayoutType.value]],
            mediaUrl: form.imageUrl,
            targetUrl: form.linkUrl,
            targetCities: cities,
            targetDistricts: districts
        }
        // Satıcıların kampanya güncelleme yetkisi olmadığı için her kaydetmede yeni bir kayıt oluşturuyoruz.
        // Eski kampanyalar listeden pasife alınabilir.
        const res = await ads.createBanner(payload)

        if (res && res.success) {
            $toast.success('Düzen kaydedildi')
            isLayoutModalOpen.value = false
            fetchData()
        } else {
            const errorMsg = (res as any)?.message || 'Bilinmeyen hata'
            $toast.error('Kayıt başarısız: ' + errorMsg)
            console.error('Kayıt hatası:', res)
        }
    } catch (err: any) {
        $toast.error('Kaydetme hatası: ' + (err.message || 'Sunucu hatası'))
        console.error('Kaydetme catch hatası:', err)
    } finally {
        isSavingLayout.value = false
    }
}

const handleBannerUpload = async (file: File) => {
    isUploadingBanner.value = true
    try {
        const res = await ads.uploadBanner(file)
        if (res && res.success) {
            const uploadedUrl = (res as any).url || (res as any).data?.url || ''
            initialLayoutForm.value = { ...initialLayoutForm.value, imageUrl: uploadedUrl }
            $toast.success('Görsel yüklendi')
        }
    } catch (err) {
        $toast.error('Yükleme hatası')
    } finally {
        isUploadingBanner.value = false
    }
}

const handleToggleStatus = async (ad: AdCampaign) => {
    const newStatus = ad.status === 'ENABLED' ? 'PAUSED' : 'ENABLED'
    try {
        await ads.updateAdCampaign(ad.id, { status: newStatus })
        ad.status = newStatus
        $toast.success('Durum güncellendi')
    } catch (err) {
        $toast.error('Güncelleme hatası')
    }
}

const handleDeleteAd = async (id: string) => {
    if (!confirm('Emin misiniz?')) return
    try {
        const res = await ads.deleteAdCampaign(id)
        if (res.success) {
            $toast.success('Silindi')
            fetchData()
        }
    } catch (err) {
        $toast.error('Silinemedi')
    }
}

const openReport = async (ad: AdCampaign) => {
    activeReportCampaign.value = ad
    isReportModalOpen.value = true
    reportLoading.value = true
    try {
        const res = await $api<any[]>(`/api/v1/vendors/ads/${ad.id}/report`)
        if (res.success && res.data) reportCoupons.value = res.data
    } catch (err) {
        $toast.error('Rapor yüklenemedi')
    } finally {
        reportLoading.value = false
    }
}

const updatePreview = (file: File, type: 'campaign' | 'swap') => {
  if (type === 'campaign') campaignImagePreview.value = URL.createObjectURL(file)
  else swapImagePreview.value = URL.createObjectURL(file)
}

onMounted(() => {
    fetchData()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <!-- Header -->
    <header class="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-bold text-white tracking-tight">Reklam ve Sponsorlu Ürünler</h1>
          <p class="mt-2 text-indigo-100 max-w-xl">
            Ürünlerinizi öne çıkarın ve satışlarınızı BazarX profesyonel reklam araçlarıyla yönetin.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button @click="isAdSwapModalOpen = true" class="px-5 py-2.5 bg-gradient-to-r from-orange-400 to-red-500 text-white hover:from-orange-500 hover:to-red-600 rounded-xl transition-all font-bold text-sm shadow-lg flex items-center gap-2 border border-orange-300">
            <GiftIcon class="w-5 h-5" /> Ad-Swap
          </button>
          <button @click="isCreateModalOpen = true" class="px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all font-bold text-sm shadow-lg flex items-center gap-2">
            <PlusIcon class="w-5 h-5" /> Yeni Kampanya
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
      <AdStatsCards :stats="summaryStats" />
      
      <AdCampaignTable 
        :campaigns="adCampaigns"
        :filtered-ads="filteredAds"
        :current-tab="currentTab"
        @update:current-tab="currentTab = $event"
        @toggle-status="handleToggleStatus"
        @delete="handleDeleteAd"
        @open-report="openReport"
        @open-create="isCreateModalOpen = true"
      />

      <AdStoreLayoutCards @open-layout="openLayoutModal" />
    </main>

    <!-- Modals -->
    <AdCampaignModal 
      v-model="isCreateModalOpen"
      :vendor-products="vendorProducts"
      :available-slots="availableSlots"
      :is-loading="isLoading"
      :image-preview="campaignImagePreview"
      @upload-file="updatePreview($event, 'campaign')"
      @clear-file="campaignImagePreview = null"
      @create="handleCreateCampaign"
    />

    <AdSwapModal 
      v-model="isAdSwapModalOpen"
      :vendor-products="vendorProducts"
      :available-slots="availableSlots"
      :is-loading="isLoading"
      :image-preview="swapImagePreview"
      @upload-file="updatePreview($event, 'swap')"
      @clear-file="swapImagePreview = null"
      @create="handleCreateSwap"
    />

    <AdLayoutEditorModal 
      v-model="isLayoutModalOpen"
      :layout-type="selectedLayoutType"
      :initial-form="initialLayoutForm"
      :is-saving="isSavingLayout"
      :is-uploading="isUploadingBanner"
      @upload="handleBannerUpload"
      @save="handleSaveLayout"
    />

    <AdReportModal 
      v-model="isReportModalOpen"
      :campaign="activeReportCampaign"
      :coupons="reportCoupons"
      :loading="reportLoading"
    />
  </div>
</template>
