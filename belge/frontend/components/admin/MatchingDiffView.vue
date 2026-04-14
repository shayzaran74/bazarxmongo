<template>
  <div
    class="grid grid-cols-1 lg:grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-2xl overflow-hidden shadow-lg relative"
  >
    <!-- Match Score Badge (Center) -->
    <div class="absolute left-1/2 top-10 -translate-x-1/2 z-10 hidden lg:block">
      <div
        class="flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 border-white shadow-xl text-white font-black text-2xl"
        :class="scoreColorClass"
      >
        <span class="text-xs font-bold opacity-80 mb-[-4px]">SKOR</span>
        %{{ score }}
      </div>
    </div>

    <!-- LEFT SIDE: Buyer / Demand (Blue Theme) -->
    <div class="bg-blue-50 p-6 lg:p-10 space-y-8 min-h-[500px] border-r border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-blue-900 font-black text-xl tracking-tight flex items-center">
          <div class="w-3 h-3 bg-blue-600 rounded-full mr-3 animate-pulse" />
          ALICI TALEBİ
        </h3>
        <span
          class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 uppercase"
        >
          ID: #{{ buyerItem?.id?.slice(-6) }}
        </span>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
        <div class="flex items-center space-x-4 mb-6">
          <div
            class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl"
          >
            {{ buyerItem?.company?.name?.charAt(0) }}
          </div>
          <div>
            <div class="text-gray-900 font-bold text-lg">
              {{ buyerItem?.company?.name }}
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-blue-600 font-medium">Doğrulanmış Üye</span>
              <div class="w-1 h-1 bg-gray-300 rounded-full" />
              <span class="text-xs text-gray-500">{{ buyerItem?.user?.email }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kategori</label>
            <div class="text-gray-900 font-bold">
              {{ buyerItem?.category?.name || 'Belirtilmedi' }}
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Açıklama</label>
            <p class="text-gray-700 text-sm leading-relaxed">
              {{ buyerItem?.description }}
            </p>
          </div>
          <div>
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Anahtar
              Kelimeler</label>
            <div class="flex flex-wrap gap-2 mt-2">
              <span
                v-for="kw in buyerItem?.keywords"
                :key="kw"
                class="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                :class="isMatch(kw) ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-600'"
              >
                #{{ kw }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT SIDE: Seller / Offering (Green Theme) -->
    <div class="bg-emerald-50 p-6 lg:p-10 space-y-8 min-h-[500px]">
      <div class="flex items-center justify-between">
        <h3 class="text-emerald-900 font-black text-xl tracking-tight flex items-center">
          <div class="w-3 h-3 bg-emerald-600 rounded-full mr-3 animate-pulse" />
          SATICI ARZI
        </h3>
        <span
          class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 uppercase"
        >
          {{ type === 'SURPLUS' ? 'FAZLA STOK' : 'SATIŞ TALEBİ' }}
          ID: #{{ (sellerItem?.id || surplusItem?.id)?.slice(-6) }}
        </span>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
        <div class="flex items-center space-x-4 mb-6">
          <div
            class="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-xl"
          >
            {{ (sellerItem?.company?.name || surplusItem?.company?.name)?.charAt(0) }}
          </div>
          <div>
            <div class="text-gray-900 font-bold text-lg">
              {{ sellerItem?.company?.name ||
                surplusItem?.company?.name }}
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-emerald-600 font-medium">Güvenilir Tedarikçi</span>
              <div class="w-1 h-1 bg-gray-300 rounded-full" />
              <span class="text-xs text-gray-500">{{ sellerItem?.user?.email || 'Kurumsal Satıcı'
              }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Başlık /
              Kategori</label>
            <div class="text-gray-900 font-bold">
              {{ type === 'SURPLUS' ? surplusItem?.title : (sellerItem?.category?.name || 'Belirtilmedi')
              }}
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Açıklama</label>
            <p class="text-gray-700 text-sm leading-relaxed">
              {{ sellerItem?.description ||
                surplusItem?.description }}
            </p>
          </div>

          <div v-if="offerKeywords.length > 0">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Anahtar
              Kelimeler</label>
            <div class="flex flex-wrap gap-2 mt-2">
              <span
                v-for="kw in offerKeywords"
                :key="kw"
                class="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                :class="isMatch(kw) ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-gray-100 text-gray-600'"
              >
                #{{ kw }}
              </span>
            </div>
          </div>

          <div
            v-if="type === 'SURPLUS'"
            class="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-50"
          >
            <div>
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Miktar</label>
              <div class="text-emerald-700 font-black">
                {{ surplusItem?.quantity }} {{ surplusItem?.unit }}
              </div>
            </div>
            <div>
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Birim
                Fiyat</label>
              <div class="text-emerald-700 font-black">
                {{ surplusItem?.unitPrice || 'Anlaşılıyor' }} TL
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from '#imports'
import type { WantedItem, SurplusItem } from '@barterborsa/shared-types'

const props = defineProps<{
    buyerItem: WantedItem
    sellerItem?: WantedItem | null
    surplusItem?: SurplusItem | null
    type: string // DIRECT or SURPLUS
    score: number
}>()

const offerKeywords = computed(() => {
    if (props.type === 'SURPLUS') return props.surplusItem?.wantedCategories as string[] || []
    return props.sellerItem?.keywords || []
})


const isMatch = (kw: string) => {
    const norm = (s: string) => s.toLocaleLowerCase('tr-TR').trim()
    const normalizedKw = norm(kw)

    if (props.buyerItem?.keywords?.some(k => norm(k) === normalizedKw)) return true
    if (offerKeywords.value.some(k => norm(k) === normalizedKw)) return true

    return false
}

const scoreColorClass = computed(() => {
    if (props.score >= 80) return 'bg-gradient-to-br from-green-500 to-emerald-600'
    if (props.score >= 50) return 'bg-gradient-to-br from-amber-500 to-orange-600'
    return 'bg-gradient-to-br from-red-500 to-pink-600'
})
</script>
