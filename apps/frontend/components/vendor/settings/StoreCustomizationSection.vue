<script setup lang="ts">
import { SparklesIcon, InformationCircleIcon, CheckIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  form: any
  vendorProducts: any[]
}>()

const emit = defineEmits(['toggleFlash'])

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0)
}
</script>

<template>
  <div class="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
    <div class="p-8 border-b border-gray-50">
      <h2 class="text-xl font-black text-gray-900 italic tracking-tighter uppercase">Mağaza Özelleştirme</h2>
    </div>

    <div class="p-10 space-y-10">
      <!-- Ads Configuration -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div v-for="side in ['LEFT', 'RIGHT']" :key="side" class="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-6">
          <div class="flex items-center gap-3">
            <div :class="side === 'LEFT' ? 'bg-orange-500' : 'bg-purple-500'" class="w-3 h-3 rounded-full animate-pulse" />
            <h3 class="text-[10px] font-black uppercase tracking-widest text-gray-900">{{ side === 'LEFT' ? 'Sol Fırsat Alanı' : 'Sağ Reklam Alanı' }}</h3>
          </div>
          <div>
            <label class="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">ÖNE ÇIKACAK ÜRÜN</label>
            <select v-model="form[side === 'LEFT' ? 'adProductIdLeft' : 'adProductIdRight']" class="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer">
              <option value="">Ürün Seçiniz (Opsiyonel)</option>
              <option v-for="p in vendorProducts" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Toggles -->
      <div class="space-y-4">
        <div v-for="toggle in [
          { key: 'showAd', label: 'Reklam Alanını Göster', desc: 'Üst banner reklamını aktif eder.', icon: SparklesIcon, iconColor: 'text-orange-500' },
          { key: 'showFlashSales', label: 'Flaş Ürünler Bölümü', desc: 'Profilin en üstünde flaş ürünleri listeler.', icon: InformationCircleIcon, iconColor: 'text-blue-500' }
        ]" :key="toggle.key" class="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100 group transition-all hover:bg-gray-100/50">
          <div class="flex items-center gap-5">
            <div class="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
              <component :is="toggle.icon" :class="toggle.iconColor" class="w-6 h-6" />
            </div>
            <div>
              <p class="text-xs font-black text-gray-900 uppercase tracking-tight">{{ toggle.label }}</p>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ toggle.desc }}</p>
            </div>
          </div>
          <button type="button" :class="form[toggle.key] ? 'bg-gray-900' : 'bg-gray-200'" class="relative inline-flex h-7 w-12 rounded-full border-2 border-transparent transition-colors duration-300 outline-none" @click="form[toggle.key] = !form[toggle.key]">
            <span :class="form[toggle.key] ? 'translate-x-5' : 'translate-x-0'" class="inline-block h-6 w-6 transform rounded-full bg-white shadow-xl transition duration-300" />
          </button>
        </div>
      </div>

      <!-- Flash Sales Selection -->
      <div v-if="form.showFlashSales" class="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 animate-in zoom-in duration-500">
        <div class="flex justify-between items-center mb-6">
           <h4 class="text-xs font-black text-amber-900 uppercase tracking-widest">Flaş Ürün Seçimi (Maks. 10)</h4>
           <span class="text-[10px] font-black bg-white px-3 py-1 rounded-full text-amber-600 border border-amber-200">{{ form.flashProductIds?.length || 0 }} / 10 ÜRÜN</span>
        </div>
        <div class="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
           <div v-for="product in vendorProducts" :key="product.id" :class="form.flashProductIds?.includes(product.id) ? 'bg-white border-amber-400 ring-4 ring-amber-500/10' : 'bg-white/50 border-transparent hover:bg-white'" class="p-4 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer" @click="$emit('toggleFlash', product.id)">
              <div class="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shadow-inner">
                 <img :src="product.image || 'https://placehold.co/100x100'" class="w-full h-full object-cover">
              </div>
              <div class="flex-1 min-w-0">
                 <p class="text-[10px] font-black text-gray-900 uppercase tracking-tight truncate mb-1">{{ product.name }}</p>
                 <p class="text-[10px] font-bold text-amber-600 uppercase tracking-widest">{{ formatCurrency(product.price) }}</p>
              </div>
              <div v-if="form.flashProductIds?.includes(product.id)" class="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
                 <CheckIcon class="h-4 w-4" />
              </div>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>
