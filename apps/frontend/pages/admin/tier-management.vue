<template>
  <div class="p-8 max-w-7xl mx-auto space-y-10">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <div class="flex items-center gap-3 mb-1">
          <span
            class="px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-full"
          >Yönetim
            Paneli</span>
          <span class="h-1 w-1 bg-gray-300 rounded-full" />
          <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sistem
            Konfigürasyonu</span>
        </div>
        <h1 class="text-4xl font-black text-gray-900 flex items-center gap-4 tracking-tighter">
          <div
            class="bg-gradient-to-br from-primary-500 to-primary-700 p-3 rounded-2xl shadow-xl shadow-primary-200"
          >
            <ChartBarIcon class="h-8 w-8 text-white" />
          </div>
          Satıcı Seviye (Tier) Yönetimi
        </h1>
        <p class="text-gray-500 font-medium pl-14">
          Satıcı seviyelerine ait komisyon, limit, harç ve XP katsayı
          parametrelerini dinamik olarak yönetin.
        </p>
      </div>

      <div class="flex items-center gap-4">
        <button
          :disabled="resetting"
          class="group bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-2xl hover:bg-gray-50 transition-all font-black flex items-center gap-3 shadow-sm active:scale-95 disabled:opacity-50"
          @click="resetCache"
        >
          <ArrowPathIcon
            class="h-5 w-5 text-amber-500"
            :class="{ 'animate-spin': resetting }"
          />
          ÖNBELLEĞİ TEMİZLE
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div
        v-for="stat in dynamicStats"
        :key="stat.label"
        class="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all flex flex-col gap-4 relative overflow-hidden"
      >
        <div class="flex items-center justify-between relative z-10">
          <div
            :class="stat.iconBg"
            class="p-3 rounded-xl transition-transform group-hover:scale-110"
          >
            <component
              :is="stat.icon"
              class="h-6 w-6"
              :class="stat.iconColor"
            />
          </div>
          <div
            v-if="stat.trend"
            :class="stat.trendColor"
            class="px-2 py-1 rounded-lg text-[10px] font-black"
          >
            {{ stat.trend }}
          </div>
        </div>
        <div class="relative z-10">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {{ stat.label }}
          </p>
          <p class="text-3xl font-black text-gray-900 tracking-tighter mt-1">
            {{ stat.value }}
          </p>
        </div>
        <!-- Decorative background elements -->
        <div class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
          <component
            :is="stat.icon"
            class="h-24 w-24"
          />
        </div>
      </div>
    </div>

    <!-- Rules List -->
    <div class="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden relative">
      <div
        v-if="loading"
        class="p-24 flex flex-col items-center justify-center"
      >
        <div class="relative">
          <div
            class="animate-spin h-16 w-16 border-[6px] border-primary-500/20 border-t-primary-500 rounded-full mb-6"
          />
          <ChartBarIcon class="h-6 w-6 text-primary-500 absolute top-5 left-5" />
        </div>
        <p class="text-gray-400 font-black uppercase tracking-widest animate-pulse text-xs">
          Veriler Senkronize
          Ediliyor...
        </p>
      </div>

      <div
        v-else-if="tiers.length === 0"
        class="p-24 text-center"
      >
        <div class="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <ChartBarIcon class="h-12 w-12 text-gray-300" />
        </div>
        <h3 class="text-2xl font-black text-gray-900">
          Seviye konfigürasyonu bulunamadı
        </h3>
        <p class="text-gray-500 mt-2 font-medium">
          Lütfen veritabanında (seedTierBenefits) komutunu çalıştırın.
        </p>
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr class="bg-gray-50/50">
              <th
                class="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100"
              >
                SEVİYE
              </th>
              <th
                class="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100"
              >
                KOMİSYON (NAKİT / BARTER)
              </th>
              <th
                class="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100"
              >
                AİDAT (YILLIK)
              </th>
              <th
                class="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100"
              >
                İLAN & LİMİT
              </th>
              <th
                class="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100"
              >
                MAKS ROI / XP
              </th>
              <th
                class="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right"
              >
                İŞLEMLER
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="tier in sortedTiers"
              :key="tier.tier"
              class="group hover:bg-gray-50/80 transition-all cursor-pointer relative"
              @click="openModal(tier)"
            >
              <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                  <div
                    :class="getTierBadgeColor(tier.tier)"
                    class="px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] shadow-lg transition-all group-hover:scale-110"
                  >
                    {{ tier.tier }}
                  </div>
                  <div
                    v-if="tier.tier === 'APEX'"
                    class="flex h-2 w-2 relative"
                  >
                    <span
                      class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"
                    />
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="flex items-center gap-2">
                  <div class="bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100/50">
                    <span
                      class="text-[10px] font-black text-blue-400 uppercase block leading-none mb-1"
                    >NAKİT</span>
                    <span class="text-sm font-black text-blue-700">%{{ (tier.commissionCash *
                      100).toFixed(1) }}</span>
                  </div>
                  <div class="bg-purple-50/50 px-3 py-1.5 rounded-lg border border-purple-100/50">
                    <span
                      class="text-[10px] font-black text-purple-400 uppercase block leading-none mb-1"
                    >BARTER</span>
                    <span class="text-sm font-black text-purple-700">%{{ (tier.commissionBarter *
                      100).toFixed(1) }}</span>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="flex flex-col">
                  <span class="text-base font-black text-gray-900 tracking-tight">{{
                    formatCurrency(tier.annualFee) }}</span>
                  <span
                    class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5"
                  >YILLIK
                    ÜYELİK</span>
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="grid grid-cols-2 gap-x-6 gap-y-2">
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span class="text-xs font-bold text-gray-500">İlan: <span
                      class="text-gray-900 font-black"
                    >{{ tier.listingLimit }}</span></span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span class="text-xs font-bold text-gray-500">API: <span
                      class="text-gray-900 font-black"
                    >{{ tier.apiRatePerMin
                    }}/dk</span></span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span class="text-xs font-bold text-gray-500">Excel: <span
                      class="text-gray-900 font-black"
                    >{{ tier.excelBatchLimit
                    }}</span></span>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                  <div class="flex flex-col">
                    <span class="text-sm font-black text-gray-900">%{{ (tier.roiRate *
                      100).toFixed(0) }}</span>
                    <span class="text-[8px] font-black text-gray-400 uppercase">MAKS ROI</span>
                  </div>
                  <div class="h-8 w-[1px] bg-gray-100" />
                  <div class="flex flex-col">
                    <span class="text-sm font-black text-primary-600">{{ tier.xpMultiplier
                    }}x</span>
                    <span class="text-[8px] font-black text-gray-400 uppercase">XP ÇARPANI</span>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6 text-right">
                <button
                  class="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-primary-600 hover:border-primary-100 hover:bg-primary-50 transition-all font-black text-xs uppercase tracking-widest"
                  @click.stop="openModal(tier)"
                >
                  <PencilSquareIcon class="h-4 w-4" />
                  <span>Güncelle</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal / Drawer -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-[100] flex justify-end"
    >
      <div
        class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        @click="showModal = false"
      />

      <div
        class="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left border-l border-gray-100"
      >
        <!-- Modal Header -->
        <div class="p-8 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              :class="getTierBadgeColor(form.tier)"
              class="p-4 rounded-2xl shadow-lg"
            >
              <ChartBarIcon class="h-8 w-8" />
            </div>
            <div>
              <div class="flex items-center gap-3">
                <h2 class="text-2xl font-black text-gray-900 tracking-tight">
                  {{ form.tier }} Kuralını
                  Düzenle
                </h2>
                <span
                  class="px-2 py-0.5 bg-primary-100 text-primary-700 text-[10px] font-black rounded uppercase tracking-widest"
                >Sistem</span>
              </div>
              <p class="text-sm font-medium text-gray-500 mt-0.5 whitespace-nowrap">
                Dinamik seviye avantaj
                ve limitlerini parametrik olarak ayarlayın.
              </p>
            </div>
          </div>
          <button
            class="p-3 bg-white text-gray-400 hover:text-gray-900 rounded-2xl transition-all shadow-sm border border-gray-100"
            @click="showModal = false"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- Modal Content -->
        <div class="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10 bg-white">
          <!-- Komisyonlar -->
          <section class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-50 pb-4">
              <div class="p-2 bg-blue-50 rounded-lg">
                <CurrencyDollarIcon class="h-5 w-5 text-blue-600" />
              </div>
              <h3 class="text-sm font-black text-gray-900 uppercase tracking-widest">
                Finansal Parametreler
              </h3>
            </div>
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nakit
                  Komisyon (%)</label>
                <div class="relative group">
                  <input
                    v-model.number="form.commissionCash"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    class="w-full bg-gray-50 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none border-2"
                  >
                  <span class="absolute right-5 top-4 text-gray-400 font-bold">%{{
                    (form.commissionCash * 100).toFixed(0) }}</span>
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Barter
                  Komisyon (%)</label>
                <div class="relative group">
                  <input
                    v-model.number="form.commissionBarter"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    class="w-full bg-gray-50 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none border-2"
                  >
                  <span class="absolute right-5 top-4 text-gray-400 font-bold">%{{
                    (form.commissionBarter * 100).toFixed(0) }}</span>
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Yıllık
                  Aidat (₺)</label>
                <input
                  v-model.number="form.annualFee"
                  type="number"
                  step="100"
                  min="0"
                  class="w-full bg-gray-50 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none border-2"
                >
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Burn
                  Rate</label>
                <input
                  v-model.number="form.burnRate"
                  type="number"
                  step="0.1"
                  min="0"
                  class="w-full bg-gray-50 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none border-2"
                >
              </div>
            </div>
          </section>

          <!-- Limiteler -->
          <section class="space-y-6">
            <div class="flex items-center gap-3 border-b border-gray-50 pb-4">
              <div class="p-2 bg-purple-50 rounded-lg">
                <ShieldCheckIcon class="h-5 w-5 text-purple-600" />
              </div>
              <h3 class="text-sm font-black text-gray-900 uppercase tracking-widest">
                Limitler & XP Sistemi
              </h3>
            </div>
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ürün
                  Kapasitesi</label>
                <input
                  v-model.number="form.listingLimit"
                  type="number"
                  class="w-full bg-gray-50 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none border-2"
                >
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">API Limit
                  (Dakika)</label>
                <input
                  v-model.number="form.apiRatePerMin"
                  type="number"
                  class="w-full bg-gray-50 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none border-2"
                >
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">XP
                  Çarpanı</label>
                <input
                  v-model.number="form.xpMultiplier"
                  type="number"
                  step="0.1"
                  min="1"
                  class="w-full bg-gray-50 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none border-2"
                >
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Maks. ROI
                  (%)</label>
                <input
                  v-model.number="form.roiRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  class="w-full bg-gray-50 border-transparent rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none border-2"
                >
              </div>
            </div>
          </section>
        </div>

        <!-- Modal Footer -->
        <div class="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-4">
          <button
            class="px-8 py-4 rounded-2xl text-sm font-black text-gray-400 hover:bg-white hover:text-gray-900 transition-all"
            @click="showModal = false"
          >
            Vazgeç
          </button>
          <button
            :disabled="saving"
            class="bg-gray-900 text-white px-10 py-4 rounded-2xl hover:bg-primary-600 transition-all font-black shadow-xl shadow-gray-200 active:scale-95 disabled:opacity-50"
            @click="saveTier"
          >
            {{ saving ? 'KAYDEDİLİYOR...' : 'KONFİGÜRASYONU GÜNCELLE' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
    ChartBarIcon,
    ShieldCheckIcon,
    CurrencyDollarIcon,
        PencilSquareIcon,
    XMarkIcon,
    ArrowPathIcon,
    ServerIcon,
    ArrowUpCircleIcon,
    SparklesIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
    layout: 'admin',
    middleware: 'admin'
})

const { $api } = useApi()
const toast = useNuxtApp().$toast

const loading = ref(false)
const saving = ref(false)
const resetting = ref(false)
const showModal = ref(false)
const tiers = ref([])

const form = ref({
    tier: '',
    commissionCash: 0,
    commissionBarter: 0,
    burnRate: 0,
    annualFee: 0,
    listingLimit: 0,
    excelBatchLimit: 0,
    apiRatePerMin: 0,
    archiveAfterDays: 0,
    imageCountPerListing: 0,
    roiRate: 0,
    xpMultiplier: 1.0,
})

const dynamicStats = computed(() => [
    {
        label: 'Aktif Segmentler',
        value: tiers.value.length,
        icon: ServerIcon,
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
        trend: 'STABLE',
        trendColor: 'bg-blue-50 text-blue-600'
    },
    {
        label: 'Ort. Komisyon',
        value: `%${((tiers.value.reduce((acc, t) => acc + Number(t.commissionCash), 0) / (tiers.value.length || 1)) * 100).toFixed(1)}`,
        icon: CurrencyDollarIcon,
        iconBg: 'bg-green-50',
        iconColor: 'text-green-600',
        trend: 'OPTIMIZED',
        trendColor: 'bg-green-50 text-green-600'
    },
    {
        label: 'Max XP Çarpanı',
        value: `${Math.max(...tiers.value.map(t => Number(t.xpMultiplier) || 1))}x`,
        icon: SparklesIcon,
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-600',
        trend: 'BOOSTED',
        trendColor: 'bg-purple-50 text-purple-600'
    },
    {
        label: 'Sistem Kapasite',
        value: tiers.value.reduce((acc, t) => acc + (t.listingLimit || 0), 0),
        icon: ArrowUpCircleIcon,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
        trend: 'SCALABLE',
        trendColor: 'bg-amber-50 text-amber-600'
    }
])

const sortedTiers = computed(() => {
    const order = { 'CORE': 1, 'PRIME': 2, 'ELITE': 3, 'APEX': 4 }
    return [...tiers.value].sort((a, b) => (order[a.tier] || 0) - (order[b.tier] || 0))
})

const fetchTiers = async () => {
    loading.value = true
    try {
        const data = await $api('/api/admin/tier-benefits')
        if (data.success) {
            tiers.value = data.data || []
        }
    } catch (error) {
        toast.error('Tier verileri yüklenirken hata oluştu')
    } finally {
        loading.value = false
    }
}

const resetCache = async () => {
    resetting.value = true
    try {
        const response = await $api('/api/admin/tier-benefits/reset', {
            method: 'POST'
        })
        if (response.success) {
            toast.success('Sistem önbelleği başarıyla tazelendi!')
            await fetchTiers()
        }
    } catch (error) {
        toast.error('Önbellek temizlenirken hata oluştu')
    } finally {
        resetting.value = false
    }
}

const openModal = (tier) => {
    form.value = { ...tier }
    // Ensure numbers stay as numbers
    Object.keys(form.value).forEach(key => {
        if (typeof form.value[key] === 'object' && form.value[key]?.$numberDecimal) {
            form.value[key] = parseFloat(form.value[key].$numberDecimal)
        }
    })
    showModal.value = true
}

const saveTier = async () => {
    saving.value = true
    try {
        const url = `/api/admin/tier-benefits/${form.value.tier.toLowerCase()}`
        const payload = { ...form.value }
        delete payload.tier
        delete payload.id
        delete payload.createdAt
        delete payload.updatedAt
        delete payload._stats

        const data = await $api(url, {
            method: 'PUT',
            body: payload
        })

        if (data.success) {
            toast.success(`${form.value.tier} konfigürasyonu başarıyla güncellendi!`)
            showModal.value = false
            fetchTiers()
        }
    } catch (error) {
        toast.error(error.data?.error || 'Kural kaydedilemedi')
    } finally {
        saving.value = false
    }
}

const getTierBadgeColor = (tierName) => {
    const colors = {
        'CORE': 'bg-gradient-to-br from-slate-600 to-slate-800 text-white',
        'PRIME': 'bg-gradient-to-br from-blue-500 to-blue-700 text-white',
        'ELITE': 'bg-gradient-to-br from-purple-500 to-purple-700 text-white',
        'APEX': 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-200',
    }
    return colors[tierName] || 'bg-gray-200 text-gray-800'
}

const formatCurrency = (value) => {
    if (!value && value !== 0) return '-'
    // Decimal object handle
    const val = typeof value === 'object' && value.$numberDecimal ? parseFloat(value.$numberDecimal) : value
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        maximumFractionDigits: 0
    }).format(val)
}

onMounted(() => {
    fetchTiers()
})
</script>

<style scoped>
@keyframes slide-left {
    from {
        transform: translateX(100%);
        opacity: 0;
    }

    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.animate-slide-left {
    animation: slide-left 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
}

/* Glassmorphism table effect */
table tbody tr:hover {
    box-shadow: inset 0 0 100px 100px rgba(0, 0, 0, 0.015);
}
</style>
