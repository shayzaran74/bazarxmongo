<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CalculatorIcon, ArrowPathIcon, BookOpenIcon } from '@heroicons/vue/24/outline'

const { formatNumber, getPlatformColor } = useCalculators()

const price = ref(0)
const costPrice = ref(0)
const shippingCost = ref(0)
const selectedPlatform = ref('trendyol')
const selectedCategoryRate = ref(10)
const kdvRate = ref(20)
const showCustomKdv = ref(false)
const kdvIncluded = ref(true)
const shippingPayer = ref('seller')

const platforms = [
  { id: 'trendyol', name: 'Trendyol' },
  { id: 'n11', name: 'n11' },
  { id: 'hepsiburada', name: 'Hepsiburada' },
  { id: 'amazon', name: 'Amazon' },
  { id: 'ciceksepeti', name: 'Çiçeksepeti' },
  { id: 'ticaritakas', name: 'TicariTakas' }
]

const categoryRates: Record<string, { name: string, rate: number }[]> = {
  ticaritakas: [{ name: 'Genel / Diğer', rate: 10 }, { name: 'Giyim & Moda', rate: 20 }, { name: 'Elektronik', rate: 5 }, { name: 'Ev & Yaşam', rate: 15 }],
  amazon: [{ name: 'Mobilya', rate: 20 }, { name: 'Elektronik & Bilgisayar', rate: 6 }, { name: 'Giyim', rate: 15 }, { name: 'Kişisel Bakım', rate: 10 }, { name: 'Diğer Her Şey', rate: 15 }],
  trendyol: [{ name: 'Elektronik', rate: 10 }, { name: 'Moda & Giyim', rate: 20 }, { name: 'Ayakkabı & Çanta', rate: 22 }, { name: 'Ev & Yaşam', rate: 18 }, { name: 'Kozmetik', rate: 16 }],
  hepsiburada: [{ name: 'Telefon', rate: 5 }, { name: 'Bilgisayar', rate: 9 }, { name: 'Elektronik Aksesuar', rate: 18 }, { name: 'Giyim & Ayakkabı', rate: 18 }, { name: 'Mobilya', rate: 22 }, { name: 'Altın & Mücevher', rate: 4 }],
  n11: [{ name: 'Bilgisayar', rate: 6 }, { name: 'Telefon Aksesuarları', rate: 12 }, { name: 'Giyim', rate: 20 }, { name: 'Kozmetik', rate: 13 }, { name: 'Mücevher & Saat', rate: 15 }],
  ciceksepeti: [{ name: 'Tasarım Çiçek', rate: 30 }, { name: 'Yenebilir Çiçek', rate: 15 }, { name: 'Hediyelik Eşya', rate: 20 }, { name: 'Kişisel Bakım', rate: 15 }]
}

const currentPlatformCategories = computed(() => categoryRates[selectedPlatform.value] || [])
watch(selectedPlatform, (newVal) => {
  if (categoryRates[newVal]?.length > 0) {
    selectedCategoryRate.value = categoryRates[newVal][0].rate
  }
}, { immediate: true })

const priceExcludingVat = computed(() => price.value ? price.value / (1 + kdvRate.value / 100) : 0)
const commissionAmount = computed(() => price.value ? (price.value * selectedCategoryRate.value) / 100 : 0)
const netEarnings = computed(() => {
  let earnings = (price.value || 0) - commissionAmount.value - (costPrice.value || 0)
  if (shippingPayer.value === 'seller') earnings -= (shippingCost.value || 0)
  return earnings
})

const resetForm = () => {
  price.value = 0; costPrice.value = 0; shippingCost.value = 0
  kdvRate.value = 20; showCustomKdv.value = false; kdvIncluded.value = true
  shippingPayer.value = 'seller'
}
</script>

<template>
  <div class="animate-in fade-in slide-in-from-top-4 duration-300">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-gray-900 uppercase italic font-black">
        {{ platforms.find(p => p.id === selectedPlatform)?.name }} Komisyon Hesaplama
      </h2>
      <p class="text-gray-500 mt-2 font-medium">
        {{ platforms.find(p => p.id === selectedPlatform)?.name }} ürün komisyonlarını en doğru ve kolay şekilde hesaplayın.
      </p>
    </div>

    <!-- Platform Tabs -->
    <div class="flex flex-wrap justify-center gap-3 mb-10 border-b border-gray-100 pb-8">
      <button
        v-for="p in platforms"
        :key="p.id"
        :class="selectedPlatform === p.id ? 'bg-orange-600 text-white shadow-xl shadow-orange-100 scale-105' : 'bg-white text-gray-600 border border-gray-100 hover:border-orange-300'"
        class="flex items-center gap-2 py-3 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300"
        @click="selectedPlatform = p.id"
      >
        <span class="w-4 h-4 rounded-full border-2 border-white/20" :class="getPlatformColor(p.id)" />
        {{ p.name }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <!-- Inputs -->
      <div class="space-y-6">
        <div>
          <label class="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">KATEGORİ / KOMİSYON</label>
          <select v-model="selectedCategoryRate" class="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-sm font-bold">
            <option v-for="cat in currentPlatformCategories" :key="cat.name" :value="cat.rate">{{ cat.name }} (%{{ cat.rate }})</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">ALIŞ FİYATI</label>
            <div class="relative">
              <span class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₺</span>
              <input v-model.number="costPrice" type="number" class="w-full pl-10 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 text-sm font-bold">
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">SATIŞ FİYATI</label>
            <div class="relative">
              <span class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₺</span>
              <input v-model.number="price" type="number" class="w-full pl-10 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 text-sm font-bold">
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">KDV ORANI</label>
            <div class="flex gap-2 p-1 bg-gray-100 rounded-xl">
              <button v-for="rate in [20, 10, 1]" :key="rate" :class="kdvRate === rate ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'" class="flex-1 py-2 rounded-lg font-black text-[10px] uppercase transition-all" @click="kdvRate = rate">%{{ rate }}</button>
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">KARGO BİLGİSİ</label>
            <div class="relative">
              <span class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₺</span>
              <input v-model.number="shippingCost" type="number" class="w-full pl-10 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 text-sm font-bold">
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button :class="shippingPayer === 'seller' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-400'" class="flex-1 py-4 px-6 border-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all" @click="shippingPayer = 'seller'">Satıcı Öder</button>
          <button :class="shippingPayer === 'buyer' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-400'" class="flex-1 py-4 px-6 border-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all" @click="shippingPayer = 'buyer'">Alıcı Öder</button>
        </div>

        <div class="flex gap-4 pt-4">
          <button class="flex-1 py-4 px-6 border border-gray-200 rounded-2xl font-black text-[10px] text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2" @click="resetForm">
            <ArrowPathIcon class="w-4 h-4" /> Temizle
          </button>
          <button class="flex-[2] py-4 px-6 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200">
            HESAPLA
          </button>
        </div>
      </div>

      <!-- Results -->
      <div class="space-y-6">
        <div class="bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <div class="flex items-center gap-4 mb-10">
            <div class="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <CalculatorIcon class="w-6 h-6" />
            </div>
            <div>
              <h3 class="font-black text-sm uppercase tracking-widest">Hesaplama Sonucu</h3>
              <p class="text-[10px] text-white/40 font-bold uppercase tracking-widest">{{ platforms.find(p => p.id === selectedPlatform)?.name }}</p>
            </div>
          </div>

          <div class="space-y-5">
            <div class="flex justify-between items-center py-3 border-b border-white/5">
              <span class="text-[10px] font-black text-white/40 uppercase tracking-widest">KDV DAHİL SATIŞ</span>
              <span class="font-black text-lg">₺{{ formatNumber(price) }}</span>
            </div>
            <div class="flex justify-between items-center py-3 border-b border-white/5">
              <span class="text-[10px] font-black text-white/40 uppercase tracking-widest">KDV HARİÇ SATIŞ</span>
              <span class="font-black text-lg">₺{{ formatNumber(priceExcludingVat) }}</span>
            </div>
            <div class="flex justify-between items-center py-3 border-b border-white/5">
              <span class="text-[10px] font-black text-red-400 uppercase tracking-widest">KOMİSYON (%{{ selectedCategoryRate }})</span>
              <span class="font-black text-lg text-red-400">-₺{{ formatNumber(commissionAmount) }}</span>
            </div>
            <div v-if="shippingPayer === 'seller'" class="flex justify-between items-center py-3 border-b border-white/5">
              <span class="text-[10px] font-black text-red-400 uppercase tracking-widest">KARGO ÜCRETİ</span>
              <span class="font-black text-lg text-red-400">-₺{{ formatNumber(shippingCost) }}</span>
            </div>
            <div class="mt-8 p-6 bg-white/5 rounded-3xl border border-white/10 flex justify-between items-center">
              <span class="font-black text-xs uppercase tracking-widest text-primary-400">Net Kazanç</span>
              <span class="text-3xl font-black italic tracking-tighter" :class="netEarnings >= 0 ? 'text-green-400' : 'text-red-400'">₺{{ formatNumber(netEarnings) }}</span>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-r from-orange-600 to-orange-700 rounded-[2.5rem] p-8 text-white flex items-center gap-8 shadow-xl">
          <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <BookOpenIcon class="w-8 h-8" />
          </div>
          <div>
            <h4 class="font-black text-sm uppercase tracking-widest mb-3">Satış Artırma Rehberi</h4>
            <p class="text-xs font-medium text-white/80 mb-4 leading-relaxed">Pazaryerlerinde görünürlüğünüzü artırmanın yollarını öğrenin.</p>
            <button class="bg-white text-orange-600 py-3 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-50 transition-all">REHBERİ İNDİR</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
