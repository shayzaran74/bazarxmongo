<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 tracking-tight">
          Yeni Nesil Tier Sistemi
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          CORE, PRIME, ELITE ve APEX seviyelerinin yönetimi ve hakları.
        </p>
      </div>
      <div class="flex space-x-3">
        <button
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm"
        >
          Ayarları Kaydet
        </button>
      </div>
    </div>

    <!-- Tier Overview Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <div
        v-for="(tier, key) in tiers"
        :key="key"
        class="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1"
      >
        <!-- Tier Header -->
        <div
          class="p-5"
          :style="{ background: tier.bgGradient }"
        >
          <div class="flex justify-between items-start">
            <span class="text-3xl">{{ tier.icon }}</span>
            <span
              class="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-[10px] uppercase font-bold text-white tracking-wider"
            >
              {{ key }}
            </span>
          </div>
          <h3 class="mt-4 text-xl font-bold text-white">
            {{ tier.nametr }}
          </h3>
          <p class="text-white/80 text-xs mt-1 leading-relaxed">
            {{ tier.description }}
          </p>
        </div>

        <!-- Tier Content -->
        <div class="p-6 space-y-6">
          <!-- Commission -->
          <div>
            <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Komisyon Oranları
            </h4>
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-gray-50 p-2 rounded-lg text-center">
                <span class="block text-xl font-bold text-gray-800">%{{ (tier.commissionRate.cash *
                  100).toFixed(0) }}</span>
                <span class="text-[10px] text-gray-500 font-medium">Nakit</span>
              </div>
              <div class="bg-gray-50 p-2 rounded-lg text-center">
                <span class="block text-xl font-bold text-gray-800">%{{ (tier.commissionRate.barter *
                  100).toFixed(0) }}</span>
                <span class="text-[10px] text-gray-500 font-medium">Barter</span>
              </div>
            </div>
          </div>

          <!-- Limits -->
          <div>
            <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              İşlem Limitleri
            </h4>
            <ul class="space-y-2 text-sm">
              <li class="flex justify-between items-center text-gray-600">
                <span>Günlük Çekim:</span>
                <span class="font-bold text-gray-900">{{ formatCurrency(tier.limits.dailyWithdraw)
                }}</span>
              </li>
              <li class="flex justify-between items-center text-gray-600">
                <span>Günlük Transfer:</span>
                <span class="font-bold text-gray-900">{{ formatCurrency(tier.limits.dailyTransfer)
                }}</span>
              </li>
              <li class="flex justify-between items-center text-gray-600">
                <span>Barter Havuzu:</span>
                <span class="font-bold text-gray-900">{{ formatCurrency(tier.limits.barterPoolLimit)
                }}</span>
              </li>
            </ul>
          </div>

          <!-- Features -->
          <div>
            <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Ayrıcalıklar
            </h4>
            <ul class="space-y-2">
              <li
                v-for="feature in tier.features"
                :key="feature"
                class="flex items-start text-sm text-gray-600"
              >
                <span class="text-green-500 mr-2">✓</span>
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
    layout: 'admin',
    middleware: 'super-admin'
})

const { $api } = useApi()
const tiers = ref({})
const loading = ref(true)

const fetchTiers = async () => {
    try {
        loading.value = true
        const response = await $api('/api/tiers/config')

        if (response.success) {
            // Map tiers to our local object
            tiers.value = response.data.tiers.reduce((acc, tier) => {
                acc[tier.id] = tier
                return acc
            }, {})
        }
    } catch (error) {
        console.error('Fetch tiers error:', error)
    } finally {
        loading.value = false
    }
}

const formatCurrency = (val) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val)
}

onMounted(() => {
    fetchTiers()
})
</script>
