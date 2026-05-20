<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 tracking-tight">
          Yeni Nesil Tier Sistemi
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          CORE, PRIME, ELITE ve APEX seviyelerinin yönetimi ve hakları.
        </p>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-24 text-gray-400 text-sm font-medium">
      Yükleniyor...
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <div
        v-for="tier in tiers"
        :key="tier.tier"
        class="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1"
      >
        <div class="p-5" :class="getTierHeaderClass(tier.tier)">
          <div class="flex justify-between items-start">
            <span class="text-3xl">{{ getTierIcon(tier.tier) }}</span>
            <span class="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-[10px] uppercase font-bold text-white tracking-wider">
              {{ tier.tier }}
            </span>
          </div>
          <h3 class="mt-4 text-xl font-bold text-white">{{ getTierNameTr(tier.tier) }}</h3>
        </div>

        <div class="p-6 space-y-6">
          <div>
            <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Komisyon Oranları</h4>
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-gray-50 p-2 rounded-lg text-center">
                <span class="block text-xl font-bold text-gray-800">%{{ (tier.commissionCash * 100).toFixed(0) }}</span>
                <span class="text-[10px] text-gray-500 font-medium">Nakit</span>
              </div>
              <div class="bg-gray-50 p-2 rounded-lg text-center">
                <span class="block text-xl font-bold text-gray-800">%{{ (tier.commissionBarter * 100).toFixed(0) }}</span>
                <span class="text-[10px] text-gray-500 font-medium">Barter</span>
              </div>
            </div>
          </div>

          <div>
            <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Limitler</h4>
            <ul class="space-y-2 text-sm">
              <li class="flex justify-between items-center text-gray-600">
                <span>Yıllık Aidat:</span>
                <span class="font-bold text-gray-900">{{ formatCurrency(tier.annualFee) }}</span>
              </li>
              <li class="flex justify-between items-center text-gray-600">
                <span>İlan Limiti:</span>
                <span class="font-bold text-gray-900">{{ tier.listingLimit }}</span>
              </li>
              <li class="flex justify-between items-center text-gray-600">
                <span>XP Çarpanı:</span>
                <span class="font-bold text-gray-900">{{ tier.xpMultiplier }}x</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'super-admin' })

interface TierRecord {
  id: string
  tier: 'CORE' | 'PRIME' | 'ELITE' | 'APEX'
  commissionCash: number
  commissionBarter: number
  annualFee: number
  listingLimit: number
  xpMultiplier: number
}

const { $api } = useApi()
const tiers = ref<TierRecord[]>([])
const loading = ref(true)

const fetchTiers = async (): Promise<void> => {
  try {
    loading.value = true
    const response = await $api<{ success: boolean; data: TierRecord[] }>('/api/v1/admin/tiers')
    if (response.success) tiers.value = response.data ?? []
  } finally {
    loading.value = false
  }
}

const getTierHeaderClass = (tier: string): string => ({
  CORE:  'bg-slate-800',
  PRIME: 'bg-blue-600',
  ELITE: 'bg-purple-600',
  APEX:  'bg-amber-500',
}[tier] ?? 'bg-gray-500')

const getTierIcon = (tier: string): string =>
  ({ CORE: '🌱', PRIME: '⭐', ELITE: '🏢', APEX: '🏆' }[tier] ?? '●')

const getTierNameTr = (tier: string): string =>
  ({ CORE: 'Çekirdek', PRIME: 'Asil', ELITE: 'Elit', APEX: 'Zirve' }[tier] ?? tier)

const formatCurrency = (val: number): string =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val)

onMounted(fetchTiers)
</script>
