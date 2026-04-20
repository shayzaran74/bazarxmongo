<template>
  <div v-if="ad" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
    <div class="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <!-- Header -->
      <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 class="text-xl font-black text-gray-900">Reklam Detayları</h3>
          <p class="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{{ ad.name || ad.vendor?.businessName }}</p>
        </div>
        <button class="p-2 hover:bg-gray-100 rounded-xl transition-colors" @click="$emit('close')">
          <XMarkIcon class="w-6 h-6 text-gray-400" />
        </button>
      </div>

      <div class="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
        <!-- Platform & Type -->
        <div class="grid grid-cols-2 gap-6">
          <div class="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <div class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Platform</div>
            <div class="text-sm font-black text-indigo-700">{{ ad.platform || 'TÜM PLATFORMLAR' }}</div>
          </div>
          <div class="p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
            <div class="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Tür</div>
            <div class="text-sm font-black text-purple-700 uppercase">
              {{ ad.pricingModel || (ad.isBanner ? 'BANNER REKLAM' : 'SABİT') }}
            </div>
          </div>
        </div>

        <!-- Target Slots -->
        <div v-if="!ad.isBanner" class="space-y-3">
          <h4 class="text-sm font-black text-gray-900 uppercase tracking-wider">Hedef Reklam Alanları</h4>
          <div class="flex flex-wrap gap-2">
            <span v-for="slot in ad.targetSlots" :key="slot" class="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
              {{ slot.replace('_', ' ') }}
            </span>
            <span v-if="!ad.targetSlots?.length" class="text-xs font-bold text-gray-400 italic">Tüm alanlar</span>
          </div>
        </div>

        <!-- Target Cities -->
        <div class="space-y-3">
          <h4 class="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <MapPinIcon class="w-4 h-4 text-indigo-600" /> Geo-Smart Şehir Hedefleme
          </h4>
          <div class="flex flex-wrap gap-2">
            <span v-for="city in ad.targetCities" :key="city" class="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[10px] font-black uppercase tracking-wider">
              {{ city }}
            </span>
            <span v-if="!ad.targetCities?.length" class="text-xs font-bold text-gray-400 italic">Tüm Türkiye</span>
          </div>
        </div>

        <!-- Image/Media -->
        <div v-if="ad.mediaUrl || ad.imageUrl" class="space-y-3">
          <h4 class="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2 text-indigo-600">
            <PhotoIcon class="w-4 h-4" /> Reklam Görseli / Banner
          </h4>
          <div class="relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-100 bg-gray-50 p-1">
            <img :src="ad.mediaUrl || ad.imageUrl" class="w-full h-auto object-cover max-h-48 rounded-xl shadow-sm">
          </div>
        </div>

        <!-- Products -->
        <div v-if="ad.products?.length" class="space-y-3">
          <h4 class="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2 text-indigo-600">
            <ArchiveBoxIcon class="w-4 h-4" /> Tanıtılan Ürünler
          </h4>
          <div class="flex flex-wrap gap-3">
            <div v-for="p in ad.products" :key="p.id" class="flex items-center gap-3 p-3 bg-gray-50/80 border border-gray-100 rounded-2xl hover:bg-white transition-all min-w-[180px]">
              <img :src="p.Listing?.CatalogProduct?.images?.[0] || '/images/no-image.png'" class="w-10 h-10 object-cover rounded-lg">
              <div class="flex-1 min-w-0">
                <div class="text-[11px] font-black text-gray-900 truncate">{{ p.Listing?.CatalogProduct?.name }}</div>
                <div class="text-[9px] font-bold text-gray-400">#{{ p.listingId.substring(0, 8) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Rejection Form -->
        <div v-if="isRejecting" class="space-y-4 pt-4 border-t border-gray-100 italic">
          <label class="text-sm font-bold text-red-600">Red Nedeni Belirtin</label>
          <textarea
            v-model="internalReason"
            rows="3"
            placeholder="Lütfen reklamın neden reddedildiğini açıklayın..."
            class="w-full px-4 py-3 bg-red-50 border border-red-100 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm font-medium"
          />
        </div>

        <!-- Existing Rejection Reason -->
        <div v-if="ad.rejectionReason && ad.status === 'REJECTED' && !isRejecting" class="p-4 bg-red-50 rounded-2xl border border-red-100">
          <div class="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Red Nedeni</div>
          <div class="text-sm font-medium text-red-700">{{ ad.rejectionReason }}</div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
        <button class="px-6 py-3 text-sm font-black text-gray-500 hover:text-gray-700 transition-colors" @click="$emit('close')">Vazgeç</button>
        
        <template v-if="ad.status === 'PENDING'">
          <button v-if="!isRejecting" class="px-6 py-3 bg-red-100 text-red-600 text-sm font-black rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm" @click="isRejecting = true">Reddet</button>
          <button v-else :disabled="!internalReason" class="px-6 py-3 bg-red-600 text-white text-sm font-black rounded-2xl hover:bg-red-700 transition-all shadow-md disabled:opacity-50" @click="$emit('confirm-reject', internalReason)">Reddi Onayla</button>
          <button class="px-8 py-3 bg-green-600 text-white text-sm font-black rounded-2xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg" @click="$emit('approve', ad.id)">Reklamı Onayla</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XMarkIcon, MapPinIcon, PhotoIcon, ArchiveBoxIcon, LinkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  ad: Object,
  isRejecting: Boolean
})

const emit = defineEmits(['close', 'approve', 'confirm-reject'])

const internalReason = ref('')
const isRejecting = ref(props.isRejecting)

watch(() => props.isRejecting, (newVal) => { isRejecting.value = newVal })
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
</style>
