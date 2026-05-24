<template>
  <div class="space-y-8 italic">
    <div v-if="selectedEco" class="bg-white rounded-[3.5rem] border border-neutral-100 p-10 shadow-sm space-y-10 sticky top-8">

      <!-- TAB BAR -->
      <div class="flex gap-1 border-b border-gray-100 mb-4">
        <button
          v-for="tab in ['members', 'map', 'audit'] as const"
          :key="tab"
          class="px-3 py-2 text-sm transition-colors relative"
          :class="activeTab === tab ? 'text-purple-700 font-medium' : 'text-gray-500 hover:text-gray-700'"
          @click="activeTab = tab"
        >
          {{ tab === 'members' ? 'Üyeler' : tab === 'map' ? 'MAP İhlaller' : 'Audit' }}
          <span
            v-if="tab === 'map' && mapViolations.length > 0"
            class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
          >
            {{ mapViolations.length }}
          </span>
        </button>
      </div>

      <!-- MEMBERS TAB -->
      <div v-show="activeTab === 'members'">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-black text-gray-900 tracking-tightest uppercase italic">{{ selectedEco.name }}</h2>
          <button class="w-10 h-10 bg-neutral-50 text-gray-400 hover:text-black rounded-xl transition-all shadow-inner flex items-center justify-center font-black" @click="$emit('deselect')">&times;</button>
        </div>

        <div class="space-y-6">
          <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2 italic">EKOSİSTEM ÜYELERİ</h3>
          <div class="divide-y divide-neutral-50">
            <div v-for="member in selectedEco.Members" :key="member.id" class="py-5 flex items-center justify-between group/member">
              <div class="flex flex-col">
                <span class="text-[13px] font-black text-gray-900 leading-tight uppercase italic group-hover/member:text-indigo-600 transition-colors">{{ member.businessName }}</span>
                <span class="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1 opacity-60 italic">{{ member.tier || 'STANDART' }}</span>
              </div>
              <div class="flex items-center gap-4">
                <div class="flex flex-col items-end">
                  <span :class="getTrustScoreColor(member.trustScore)" class="text-sm font-black italic">{{ member.trustScore }}%</span>
                  <span class="text-[7px] text-gray-300 font-black uppercase tracking-widest italic leading-none">SCORE</span>
                </div>
                <div class="flex gap-2">
                  <button class="w-9 h-9 bg-neutral-50 rounded-xl hover:bg-black hover:text-white text-gray-400 transition-all flex items-center justify-center shadow-inner" title="SKORU DEĞIŞTIR" @click="$emit('override', member)">
                    <WrenchScrewdriverIcon class="h-4 w-4" />
                  </button>
                  <button class="w-9 h-9 bg-neutral-50 rounded-xl hover:bg-rose-600 hover:text-white text-gray-400 transition-all flex items-center justify-center shadow-inner" title="ÜYELIĞI SIL" @click="$emit('remove', member.id)">
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-6 border-t border-neutral-50">
           <button class="w-full h-16 bg-neutral-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl shadow-neutral-100 flex items-center justify-center gap-4 active:scale-95" @click="$emit('logs')">
              <ShieldCheckIcon class="h-5 w-5" />
              AUDIT LOGLARI →
           </button>
        </div>
      </div>

      <!-- MAP İHLAL LİSTESİ TAB -->
      <div v-show="activeTab === 'map'" class="space-y-2">
        <div v-if="mapLoading" class="text-center text-sm text-gray-400 py-4">Yükleniyor...</div>
        <div v-else-if="mapViolations.length === 0" class="text-center text-sm text-green-600 py-4">
          ✓ MAP ihlali yok
        </div>
        <div
          v-for="v in mapViolations"
          :key="v.listingId"
          class="bg-red-50 border border-red-100 rounded-lg p-3 space-y-1"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900">{{ v.productName }}</p>
              <p class="text-xs text-gray-500">{{ v.dealerName }}</p>
            </div>
            <span class="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded">
              ↓ {{ v.mapGap.toLocaleString('tr-TR') }} ₺ eksik
            </span>
          </div>
          <div class="flex items-center gap-3 text-xs text-gray-500">
            <span>Satış: {{ v.currentPrice.toLocaleString('tr-TR') }} ₺</span>
            <span>MIN: {{ v.minMarketPrice.toLocaleString('tr-TR') }} ₺</span>
          </div>
        </div>
      </div>

      <!-- AUDIT TAB -->
      <div v-show="activeTab === 'audit'">
        <p class="text-sm text-gray-500 italic">Audit logları için AUDIT LOGLARI butonuna tıklayın.</p>
      </div>

    </div>

    <!-- Quick Actions if no selection -->
    <div v-else class="bg-indigo-600 rounded-[3.5rem] p-10 text-white shadow-2xl space-y-8 italic relative overflow-hidden group">
      <div class="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
      <div class="w-16 h-16 bg-white/10 backdrop-blur-3xl rounded-[1.5rem] flex items-center justify-center border border-white/20 shadow-2xl"><BoltIcon class="h-8 w-8 text-white" /></div>
      <div>
        <h3 class="font-black text-2xl leading-tight uppercase tracking-tightest">WATCHTOWER <span class="text-indigo-200">HAZIR</span></h3>
        <p class="text-indigo-100/60 text-[11px] font-black leading-relaxed mt-4 uppercase tracking-widest italic">EKOSİSTEM BAZLI DENETİM YAPMAK İÇİN LİSTEDEN BİR MARKA SEÇİN.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WrenchScrewdriverIcon, TrashIcon, ShieldCheckIcon, BoltIcon } from '@heroicons/vue/24/solid'

interface MapViolation {
  listingId: string
  productName: string
  dealerId: string
  dealerName: string
  currentPrice: number
  minMarketPrice: number
  mapGap: number
  publishedAt: string
}

const props = defineProps<{ selectedEco: Record<string, unknown> | null }>()
defineEmits(['deselect', 'override', 'remove', 'logs'])

const activeTab = ref<'members' | 'map' | 'audit'>('members')
const mapViolations = ref<MapViolation[]>([])
const mapLoading = ref(false)

async function fetchMapViolations(ecosystemId: string) {
  mapLoading.value = true
  try {
    const data = await $api<{ listings?: MapViolation[] }>(`/api/v1/ecosystem/published-listings?ecosystemId=${ecosystemId}`)
    mapViolations.value = (data.listings ?? []).filter((l: MapViolation) => !(l as { mapCompliant?: boolean }).mapCompliant)
  } catch {
    mapViolations.value = []
  } finally {
    mapLoading.value = false
  }
}

watch(() => props.selectedEco, (eco) => {
  if (eco && eco.id) {
    fetchMapViolations(eco.id as string)
  }
}, { immediate: true })

const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500'
    if (score >= 70) return 'text-blue-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-rose-500'
}
</script>
