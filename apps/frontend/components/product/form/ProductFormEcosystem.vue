<script setup lang="ts">
// Master Plan v4.3 §4.2 + §4.3 — Fabrika ekosistemi ürün gamı kontrolleri
import { GlobeAltIcon } from '@heroicons/vue/24/outline'

interface Props {
  visibility?: 'PUBLIC' | 'PRIVATE_ECOSYSTEM'
  minMarketPrice?: number | null
  maxPurchasePerMember?: number | null
  // Master Plan §4.2 — Ekosistem alanları
  ecosystemId?: string | null
  visibleTo?: 'ALL_DEALERS' | 'SELECTED_DEALERS' | 'NONE'
  selectedDealerIds?: string[]
  availableFrom?: string | null
  availableTo?: string | null
  allowOnlineResale?: boolean
  maxOrderQtyPerDealer?: number | null
}

defineProps<Props>()
const emit = defineEmits<{
  'update:visibility': [v: 'PUBLIC' | 'PRIVATE_ECOSYSTEM']
  'update:minMarketPrice': [v: number]
  'update:maxPurchasePerMember': [v: number]
  'update:ecosystemId': [v: string | null]
  'update:visibleTo': [v: 'ALL_DEALERS' | 'SELECTED_DEALERS' | 'NONE']
  'update:selectedDealerIds': [v: string[]]
  'update:availableFrom': [v: string | null]
  'update:availableTo': [v: string | null]
  'update:allowOnlineResale': [v: boolean]
  'update:maxOrderQtyPerDealer': [v: number]
}>()
</script>

<template>
  <section
    id="ecosystem"
    class="bg-indigo-50/50 rounded-2xl shadow-sm border border-indigo-100 overflow-hidden"
  >
    <div class="p-6 border-b border-indigo-100/50 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="bg-indigo-100 p-2 rounded-lg">
          <GlobeAltIcon class="h-5 w-5 text-indigo-600" />
        </div>
        <h3 class="text-lg font-bold text-indigo-900">
          BazarX Private Ayarları
        </h3>
      </div>
    </div>
    <div class="p-6 space-y-6">
      <div>
        <label class="block text-xs font-black text-indigo-800 uppercase tracking-wider mb-2">Görünürlük</label>
        <div class="flex space-x-6 bg-white p-3 rounded-xl border border-indigo-100">
          <label class="inline-flex items-center cursor-pointer">
            <input
              :checked="visibility === 'PUBLIC'"
              type="radio"
              class="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              @change="emit('update:visibility', 'PUBLIC')"
            >
            <span class="ml-2 text-sm font-bold text-gray-700">Herkese Açık (Marketplace)</span>
          </label>
          <label class="inline-flex items-center cursor-pointer">
            <input
              :checked="visibility === 'PRIVATE_ECOSYSTEM'"
              type="radio"
              class="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              @change="emit('update:visibility', 'PRIVATE_ECOSYSTEM')"
            >
            <span class="ml-2 text-sm font-bold text-gray-700">Sadece Ekosistem (Fabrika)</span>
          </label>
        </div>
      </div>

      <!-- Marketplace (Public) ayarları -->
      <div
        v-if="visibility === 'PRIVATE_ECOSYSTEM'"
        class="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div>
          <label class="block text-xs font-black text-indigo-800 uppercase tracking-wider mb-2">Price Floor (Fiyat Tabanı)</label>
          <div class="relative">
            <span class="absolute left-3 top-2 text-indigo-500 font-bold">₺</span>
            <input
              :value="minMarketPrice || ''"
              type="number"
              step="0.01"
              class="w-full pl-8 pr-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-black font-bold"
              placeholder="0.00"
              @input="e => emit('update:minMarketPrice', Number((e.target as HTMLInputElement).value))"
            >
          </div>
          <p class="mt-2 text-[10px] text-indigo-600 font-medium tracking-tight">
            Bayilerin bu fiyatın altında satış yapması engellenir.
          </p>
        </div>

        <div>
          <label class="block text-xs font-black text-indigo-800 uppercase tracking-wider mb-2">Smart Cap (Akıllı Kota — %25 havuz)</label>
          <input
            :value="maxPurchasePerMember || ''"
            type="number"
            class="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-black font-bold"
            placeholder="0"
            @input="e => emit('update:maxPurchasePerMember', Number((e.target as HTMLInputElement).value))"
          >
          <p class="mt-2 text-[10px] text-indigo-600 font-medium tracking-tight">
            Genel havuz Smart Cap %25 sabittir; bu alan toplam üye başı maksimumdur.
          </p>
        </div>
      </div>

      <!-- Master Plan §4.2 — Fabrika ürün gamı kontrolleri (PRIVATE_ECOSYSTEM) -->
      <div
        v-if="visibility === 'PRIVATE_ECOSYSTEM'"
        class="border-t border-indigo-200 pt-6 space-y-6"
      >
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-black text-indigo-900 uppercase tracking-wider">Bayi Görünürlük & Kota (Watchover)</h4>
        </div>

        <!-- visibleTo -->
        <div>
          <label class="block text-xs font-black text-indigo-800 uppercase tracking-wider mb-2">Bayilere Görünürlük</label>
          <div class="grid grid-cols-3 gap-3">
            <label
              v-for="opt in [
                { value: 'ALL_DEALERS', label: 'Tüm Bayiler' },
                { value: 'SELECTED_DEALERS', label: 'Seçili Bayiler' },
                { value: 'NONE', label: 'Hiçbiri (Saklı)' },
              ]"
              :key="opt.value"
              class="flex items-center justify-center px-3 py-3 bg-white border-2 rounded-xl cursor-pointer transition-all"
              :class="visibleTo === opt.value ? 'border-indigo-600 bg-indigo-50' : 'border-indigo-100 hover:border-indigo-300'"
            >
              <input
                :checked="visibleTo === opt.value"
                type="radio"
                class="sr-only"
                @change="emit('update:visibleTo', opt.value as 'ALL_DEALERS' | 'SELECTED_DEALERS' | 'NONE')"
              >
              <span class="text-xs font-bold text-gray-700">{{ opt.label }}</span>
            </label>
          </div>
          <p v-if="visibleTo === 'SELECTED_DEALERS'" class="mt-2 text-[10px] text-amber-700 font-bold tracking-tight">
            Bayi seçim listesi: bayi davet ekranından eklenir (en az 1 bayi zorunlu).
          </p>
        </div>

        <!-- availableFrom / availableTo -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-black text-indigo-800 uppercase tracking-wider mb-2">Görünür Başlangıç</label>
            <input
              :value="availableFrom || ''"
              type="datetime-local"
              class="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-black font-bold"
              @input="e => emit('update:availableFrom', (e.target as HTMLInputElement).value || null)"
            >
          </div>
          <div>
            <label class="block text-xs font-black text-indigo-800 uppercase tracking-wider mb-2">Görünür Bitiş</label>
            <input
              :value="availableTo || ''"
              type="datetime-local"
              class="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-black font-bold"
              @input="e => emit('update:availableTo', (e.target as HTMLInputElement).value || null)"
            >
          </div>
        </div>

        <!-- maxOrderQtyPerDealer (zorunlu — §4.2) -->
        <div>
          <label class="block text-xs font-black text-indigo-800 uppercase tracking-wider mb-2">
            Bayi Başına Max. Sipariş Adedi
            <span class="text-red-600">*</span>
          </label>
          <input
            :value="maxOrderQtyPerDealer || ''"
            type="number"
            min="1"
            required
            class="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-black font-bold"
            placeholder="Ekosistem listing'inde zorunlu"
            @input="e => emit('update:maxOrderQtyPerDealer', Number((e.target as HTMLInputElement).value))"
          >
          <p class="mt-2 text-[10px] text-indigo-600 font-medium tracking-tight">
            <strong>Watchover</strong> — Bayi toplam sipariş sayısı bu sınırı geçerse <code>DEALER_QUOTA_EXCEEDED</code> hatası verilir.
          </p>
        </div>

        <!-- allowOnlineResale -->
        <div class="flex items-start gap-3 p-4 bg-white border border-indigo-100 rounded-xl">
          <input
            :checked="allowOnlineResale"
            type="checkbox"
            class="form-checkbox h-5 w-5 mt-0.5 text-indigo-600 focus:ring-indigo-500"
            @change="emit('update:allowOnlineResale', (($event.target as HTMLInputElement)).checked)"
          >
          <div>
            <label class="block text-sm font-bold text-gray-900">Çevrimiçi Yeniden Satışa İzin Ver</label>
            <p class="text-[11px] text-gray-500 font-medium mt-1">
              İşaretlenirse bayiler bu ürünü BazarX Pazaryeri'nde takasa açabilir. Aksi halde takas reddedilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
