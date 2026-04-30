<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6 pb-20">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">
          Sadakat Sistemi Ayarları
        </h1>
        <p class="text-sm text-gray-500 mt-2">
          Kullanıcıların genel ve bölgesel XP kurallarını yönetin.
        </p>
      </div>
      <button
        :disabled="isSaving"
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center space-x-2 disabled:opacity-50"
        @click="saveSettings"
      >
        <span
          v-if="isSaving"
          class="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
        />
        <span>{{ isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet' }}</span>
      </button>
    </div>

    <div
      v-if="isLoading"
      class="flex justify-center py-20"
    >
      <div class="animate-spin w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full" />
    </div>

    <div
      v-else
      class="space-y-8"
    >
      <!-- Info Card -->
      <div class="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 relative overflow-hidden">
        <h3 class="text-lg font-bold text-blue-900 mb-2">
          XP Dağılım Modelini Yönetme
        </h3>
        <p class="text-sm text-blue-800 leading-relaxed">
          Sistem genelinde veya seçtiğiniz şehre özel komisyon/reklam/hizmet puanlarının ne kadar oranda
          kullanıcılara yansıyacağını belirleyebilirsiniz.
          Değerleri ondalıklı girmelisiniz (Örn: %50 için 0.50).
        </p>
      </div>

      <!-- General XP Earn Rules -->
      <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span>🏆</span> Basit XP Kazanım Görevleri
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-gray-50/50 rounded-xl p-5 border border-gray-100">
            <label class="block text-sm font-bold text-gray-900 mb-1">Günlük Giriş Ödülü</label>
            <input
              v-model.number="settings.reward_xp_daily_login"
              type="number"
              step="1"
              class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div class="bg-gray-50/50 rounded-xl p-5 border border-gray-100">
            <label class="block text-sm font-bold text-gray-900 mb-1">Yeni Ürün Girişi Ödülü</label>
            <input
              v-model.number="settings.reward_xp_product_listed"
              type="number"
              step="1"
              class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div class="bg-gray-50/50 rounded-xl p-5 border border-gray-100">
            <label class="block text-sm font-bold text-gray-900 mb-1">Profil Tamamlama Ödülü</label>
            <input
              v-model.number="settings.reward_xp_profile_completed"
              type="number"
              step="1"
              class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>
      </div>

      <!-- Global Splitting Rules -->
      <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span>🌍</span> Küresel Görev ve Dağıtım Üst Limitleri
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-gray-50/50 rounded-xl p-5 border border-gray-100">
            <label class="block text-sm font-bold text-gray-900 mb-1">Maksimum Harcama Oranı</label>
            <p class="text-xs text-gray-500 mb-2">
              Sepet tutarının en fazla yüzde kaçı XP ile ödenebilir?
              (Örn: 0.25)
            </p>
            <input
              v-model.number="settings.max_xp_burn_rate"
              type="number"
              step="0.01"
              min="0"
              max="1"
              class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div class="bg-gray-50/50 rounded-xl p-5 border border-gray-100">
            <label class="block text-sm font-bold text-gray-900 mb-1">Komisyon Dağılımı</label>
            <p class="text-xs text-gray-500 mb-2">
              Dağıtılan XP'nin komisyona dönüşme oranı
            </p>
            <input
              v-model.number="settings.xp_split_commission"
              type="number"
              step="0.01"
              min="0"
              max="1"
              class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div class="bg-gray-50/50 rounded-xl p-5 border border-gray-100">
            <label class="block text-sm font-bold text-gray-900 mb-1">Reklam Dağılımı</label>
            <p class="text-xs text-gray-500 mb-2">
              Dağıtılan XP'nin reklama dönüşme oranı
            </p>
            <input
              v-model.number="settings.xp_split_ad"
              type="number"
              step="0.01"
              min="0"
              max="1"
              class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div class="bg-gray-50/50 rounded-xl p-5 border border-gray-100">
            <label class="block text-sm font-bold text-gray-900 mb-1">Servis Dağılımı</label>
            <p class="text-xs text-gray-500 mb-2">
              Dağıtılan XP'nin servislere dönüşme oranı
            </p>
            <input
              v-model.number="settings.xp_split_service"
              type="number"
              step="0.01"
              min="0"
              max="1"
              class="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>
      </div>

      <!-- Regional Splitting Rules -->
      <div class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>📍</span> Şehir / Bölge Bazlı Kurallar
          </h2>
          <button
            class="text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-4 py-2 rounded-lg"
            @click="addRegion"
          >
            + Yeni Şehir Ekle
          </button>
        </div>

        <div
          v-if="regions.length === 0"
          class="text-center py-10 text-gray-500"
        >
          Şu an bölgesel bir kural bulunmuyor. Yeni bir hedef şehir ekleyerek lokal kampanyalar
          oluşturabilirsiniz.
        </div>

        <div
          v-else
          class="space-y-4"
        >
          <div
            v-for="(region, index) in regions"
            :key="index"
            class="bg-gray-50/50 p-5 rounded-xl border border-gray-200"
          >
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <input
                v-model="region.name"
                type="text"
                placeholder="ŞEHİR ADI (Örn: ANTALYA)"
                class="font-bold text-lg bg-transparent border-none focus:ring-0 uppercase p-0"
              >
              <button
                class="text-red-500 hover:text-red-700 p-1"
                @click="removeRegion(index)"
              >
                Devre Dışı Bırak / Sil
              </button>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-900 mb-1">Maks. Harcama Oranı</label>
                <input
                  v-model.number="region.burnRate"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-3 py-1.5 bg-white border border-gray-200 rounded text-sm"
                >
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-900 mb-1">XP Kazanım Çarpanı</label>
                <input
                  v-model.number="region.xpMultiplier"
                  type="number"
                  step="0.1"
                  min="0"
                  class="w-full px-3 py-1.5 bg-white border border-gray-200 rounded text-sm"
                >
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-900 mb-1">Komisyon Puanı (%)</label>
                <input
                  v-model.number="region.splitCommission"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-3 py-1.5 bg-white border border-gray-200 rounded text-sm"
                >
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-900 mb-1">Reklam Puanı (%)</label>
                <input
                  v-model.number="region.splitAd"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-3 py-1.5 bg-white border border-gray-200 rounded text-sm"
                >
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-900 mb-1">Servis Puanı (%)</label>
                <input
                  v-model.number="region.splitService"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-3 py-1.5 bg-white border border-gray-200 rounded text-sm"
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: ['auth', 'admin'] })

import { ref, onMounted } from 'vue'
const { $api } = useApi()
const toast = useNuxtApp().$toast

// Meta
useHead({
    title: 'Sadakat Sistemi Ayarları - Admin | TicariTakas'
})

const isLoading = ref(true)
const isSaving = ref(false)

const settings = ref({
    reward_xp_daily_login: 50,
    reward_xp_product_listed: 10,
    reward_xp_profile_completed: 50,
    max_xp_burn_rate: 0.25,
    xp_split_commission: 0.50,
    xp_split_ad: 0.25,
    xp_split_service: 0.25
})

const regions = ref([])

onMounted(() => {
    fetchSettings()
})

const parseRegionSettings = (keysMap) => {
    const regionMap = {}

    Object.keys(keysMap).forEach(key => {
        if (key.startsWith('XP_BURN_RATE_')) {
            const city = key.replace('XP_BURN_RATE_', '')
            if (!regionMap[city]) regionMap[city] = {}
            regionMap[city].burnRate = Number(keysMap[key])
        }
        else if (key.startsWith('XP_AWARD_MULTIPLIER_')) {
            const city = key.replace('XP_AWARD_MULTIPLIER_', '')
            if (!regionMap[city]) regionMap[city] = {}
            regionMap[city].xpMultiplier = Number(keysMap[key])
        }
        else if (key.startsWith('XP_SPLIT_') && !['COMMISSION', 'AD', 'SERVICE'].includes(key.replace('XP_SPLIT_', ''))) {
            // It's a regional split: XP_SPLIT_{CITY}_COMMISSION
            const parts = key.split('_')
            // parts: ["XP", "SPLIT", "ANTALYA", "COMMISSION"]
            if (parts.length >= 4) {
                const city = parts[2]
                const type = parts[3]
                if (!regionMap[city]) regionMap[city] = {}
                if (type === 'COMMISSION') regionMap[city].splitCommission = Number(keysMap[key])
                if (type === 'AD') regionMap[city].splitAd = Number(keysMap[key])
                if (type === 'SERVICE') regionMap[city].splitService = Number(keysMap[key])
            }
        }
    })

    regions.value = Object.keys(regionMap).map(city => {
        const c = regionMap[city]
        return {
            name: city,
            burnRate: c.burnRate ?? 0.25,
            xpMultiplier: c.xpMultiplier ?? 1.0,
            splitCommission: c.splitCommission ?? 0.50,
            splitAd: c.splitAd ?? 0.25,
            splitService: c.splitService ?? 0.25,
        }
    })
}

const fetchSettings = async () => {
    try {
        isLoading.value = true
        const response = await $api('/api/v1/admin/settings')
        if (response?.data) {
            const d = response.data

            // map global fields
            if (d.reward_xp_daily_login !== undefined) settings.value.reward_xp_daily_login = Number(d.reward_xp_daily_login)
            if (d.reward_xp_product_listed !== undefined) settings.value.reward_xp_product_listed = Number(d.reward_xp_product_listed)
            if (d.reward_xp_profile_completed !== undefined) settings.value.reward_xp_profile_completed = Number(d.reward_xp_profile_completed)
            if (d.MAX_XP_BURN_RATE !== undefined) settings.value.max_xp_burn_rate = Number(d.MAX_XP_BURN_RATE)
            if (d.XP_SPLIT_COMMISSION !== undefined) settings.value.xp_split_commission = Number(d.XP_SPLIT_COMMISSION)
            if (d.XP_SPLIT_AD !== undefined) settings.value.xp_split_ad = Number(d.XP_SPLIT_AD)
            if (d.XP_SPLIT_SERVICE !== undefined) settings.value.xp_split_service = Number(d.XP_SPLIT_SERVICE)

            parseRegionSettings(d)
        }
    } catch (error) {
        console.error('Settings load error:', error)
        toast.error('Ayarlar yüklenirken bir hata oluştu')
    } finally {
        isLoading.value = false
    }
}

const addRegion = () => {
    regions.value.push({
        name: '',
        burnRate: 0.25,
        xpMultiplier: 1.0,
        splitCommission: 0.50,
        splitAd: 0.25,
        splitService: 0.25
    })
}

const removeRegion = (index) => {
    regions.value.splice(index, 1)
}

const saveSettings = async () => {
    try {
        isSaving.value = true

        const payload = {
            reward_xp_daily_login: String(settings.value.reward_xp_daily_login),
            reward_xp_product_listed: String(settings.value.reward_xp_product_listed),
            reward_xp_profile_completed: String(settings.value.reward_xp_profile_completed),
            MAX_XP_BURN_RATE: String(settings.value.max_xp_burn_rate),
            XP_SPLIT_COMMISSION: String(settings.value.xp_split_commission),
            XP_SPLIT_AD: String(settings.value.xp_split_ad),
            XP_SPLIT_SERVICE: String(settings.value.xp_split_service)
        }

        // Warning: if a region is removed from the UI, sending just the active ones via upsert in backend
        // will not delete the removed ones. A full sync API might be needed later, or admins could just
        // set the multiplier back to 1. For simplicity, we just send all current ones.
        regions.value.forEach(r => {
            if (!r.name.trim()) return;
            const city = r.name.toUpperCase().trim()
            payload[`XP_BURN_RATE_${city}`] = String(r.burnRate)
            payload[`XP_AWARD_MULTIPLIER_${city}`] = String(r.xpMultiplier)
            payload[`XP_SPLIT_${city}_COMMISSION`] = String(r.splitCommission)
            payload[`XP_SPLIT_${city}_AD`] = String(r.splitAd)
            payload[`XP_SPLIT_${city}_SERVICE`] = String(r.splitService)
        })

        const response = await $api('/api/v1/admin/settings', {
            method: 'POST',
            body: payload
        })

        if (response?.success) {
            toast.success('Bölgesel ve Genel sadakat ayarları başarıyla kaydedildi')
        } else {
            throw new Error(response?.error || 'Kaydetme başarısız')
        }
    } catch (error) {
        console.error('Settings save error:', error)
        toast.error('Ayarlar kaydedilirken bir hata oluştu')
    } finally {
        isSaving.value = false
    }
}
</script>
