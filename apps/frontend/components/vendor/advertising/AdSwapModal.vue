<!-- apps/frontend/pages/vendor/advertising/components/AdSwapModal.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  XMarkIcon, 
  GiftIcon, 
  MapPinIcon, 
  ChevronDownIcon, 
  CheckCircleIcon,
  CloudArrowUpIcon,
  TrashIcon,
  InformationCircleIcon as InfoIcon,
  ArrowPathIcon,
  SparklesIcon,
  ArchiveBoxIcon as PackageIcon
} from '@heroicons/vue/24/outline'
import { useGeoSelector } from '~/composables/advertising/useGeoSelector'
import type { SwapCampaignForm, VendorProduct, TargetSlot } from '~/types/advertising'

const props = defineProps<{
  modelValue: boolean
  vendorProducts: VendorProduct[]
  availableSlots: TargetSlot[]
  isLoading: boolean
  imagePreview: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'create', form: SwapCampaignForm, city: string[], district: string[], file: File | null): void
  (e: 'uploadFile', file: File): void
  (e: 'clearFile'): void
}>()

const geo = useGeoSelector()
const currentFile = ref<File | null>(null)

// Form State
const localForm = ref<SwapCampaignForm>({
    name: '',
    adPackage: 'SILVER',
    campaignType: 'REWARD_DISTRIBUTION',
    platform: 'BAZARX',
    targetSlots: [],
    productIds: [],
    targetUrl: ''
})

const adPackages = [
    { id: 'BRONZE', label: 'Bronze Paket', price: '₺2.500 Değerinde', features: ['Arama Üst', 'Yan Reklam'] },
    { id: 'SILVER', label: 'Silver Paket', price: '₺5.000 Değerinde', features: ['Anasayfa Öne Çıkarılanlar', 'Ürün Detay'] },
    { id: 'GOLD', label: 'Gold Paket', price: '₺10.000 Değerinde', features: ['Kategori Banner', 'Sana Özel Akış'] }
]

const campaignTypes = [
    { id: 'REWARD_DISTRIBUTION', label: 'Hediye Dağıtımı', desc: 'Ürünlerinizi kullanıcılarımıza hediye olarak dağıtırız.' },
    { id: 'SAMPLING', label: 'Sampling', desc: 'Deneme boy ürünlerinizi hedef kitlenize ulaştırırız.' }
]

const toggleProduct = (id: string) => {
    const idx = localForm.value.productIds.indexOf(id)
    if (idx === -1) localForm.value.productIds.push(id)
    else localForm.value.productIds.splice(idx, 1)
}

const toggleSlot = (id: string) => {
    const idx = localForm.value.targetSlots.indexOf(id)
    if (idx === -1) localForm.value.targetSlots.push(id)
    else localForm.value.targetSlots.splice(idx, 1)
}

const handleFileUpload = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files[0]) {
        currentFile.value = target.files[0]
        emit('uploadFile', target.files[0])
    }
}

const onSubmit = () => {
    emit('create', 
        localForm.value, 
        geo.selectedCities.value, 
        geo.selectedDistricts.value,
        currentFile.value
    )
}

const isValid = computed(() => {
    const basic = localForm.value.name.trim() !== '' && localForm.value.productIds.length > 0
    const needsImage = localForm.value.targetSlots.some(s => ['HOME_BANNER', 'SIDE_ADS'].includes(s))
    if (needsImage && !props.imagePreview) return false
    return basic
})
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden shadow-orange-500/10">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/50 to-red-50/50">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
              <GiftIcon class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-xl font-black text-gray-900 tracking-tight">Ad-Swap (Ürünle Öde) Kampanyası</h3>
              <p class="text-sm text-gray-500 font-medium">Reklam bütçenizi ürünlerinizi takas ederek oluşturun</p>
            </div>
          </div>
          <button @click="emit('update:modelValue', false)" class="p-2.5 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200">
            <XMarkIcon class="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <!-- Left: Packages & Types (7 cols) -->
            <div class="lg:col-span-7 space-y-10">
              <!-- Name & Type -->
              <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">KAMPANYA ADI</label>
                    <input v-model="localForm.name" type="text" placeholder="Örn: Yeni Koleksiyon Takası" class="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/5 transition-all font-bold" />
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">KAMPANYA TÜRÜ</label>
                    <select v-model="localForm.campaignType" class="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 outline-none focus:border-orange-400 font-bold appearance-none">
                        <option v-for="t in campaignTypes" :key="t.id" :value="t.id">{{ t.label }}</option>
                    </select>
                </div>
              </section>

              <!-- Package Selection -->
              <section class="space-y-6">
                <h4 class="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                    <PackageIcon class="w-5 h-5 text-orange-500" /> Reklam Paketi Seçin
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                        v-for="pkg in adPackages" 
                        :key="pkg.id"
                        @click="localForm.adPackage = pkg.id"
                        class="p-6 rounded-3xl border-2 transition-all text-left flex flex-col justify-between h-52 relative overflow-hidden"
                        :class="localForm.adPackage === pkg.id ? 'bg-orange-50 border-orange-500 ring-4 ring-orange-500/5' : 'bg-gray-50 border-transparent hover:border-gray-200'"
                    >
                        <SparklesIcon v-if="localForm.adPackage === pkg.id" class="absolute -top-4 -right-4 w-20 h-20 text-orange-200/50" />
                        <div>
                            <span class="text-[10px] font-black uppercase" :class="localForm.adPackage === pkg.id ? 'text-orange-600' : 'text-gray-400'">{{ pkg.price }}</span>
                            <h5 class="text-lg font-black text-gray-900 mt-1 leading-tight">{{ pkg.label }}</h5>
                        </div>
                        <ul class="text-[10px] font-bold text-gray-500 space-y-1">
                            <li v-for="(f, i) in pkg.features" :key="i" class="flex items-center gap-1"><div class="w-1 h-1 rounded-full bg-orange-400" /> {{ f }}</li>
                        </ul>
                        <div v-if="localForm.adPackage === pkg.id" class="absolute bottom-4 right-4"><CheckCircleIcon class="w-6 h-6 text-orange-500" /></div>
                    </button>
                </div>
              </section>

              <!-- Products to Swap -->
              <section class="space-y-6">
                <div class="flex items-center justify-between">
                    <h4 class="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                        <GiftIcon class="w-5 h-5 text-orange-500" /> Takas Edilecek Ürünler
                    </h4>
                    <span class="text-[10px] font-black text-gray-400">{{ localForm.productIds.length }} Seçili</span>
                </div>
                <div class="bg-gray-50 rounded-3xl p-6 border border-gray-100 max-h-64 overflow-y-auto custom-scrollbar">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button 
                            v-for="p in vendorProducts" 
                            :key="p.id"
                            @click="toggleProduct(p.id)"
                            class="relative aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1"
                            :class="localForm.productIds.includes(p.id) ? 'border-orange-500 shadow-lg shadow-orange-100' : 'border-transparent bg-white'"
                        >
                            <img :src="p.image" class="w-full h-full object-cover rounded-xl" />
                            <div v-if="localForm.productIds.includes(p.id)" class="absolute inset-0 bg-orange-500/10 flex items-center justify-center backdrop-blur-[1px]">
                                <CheckCircleIcon class="w-8 h-8 text-orange-600 drop-shadow-md" />
                            </div>
                        </button>
                    </div>
                </div>
              </section>

              <!-- Ad Placement -->
               <section class="space-y-6">
                <h4 class="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                    <MegaphoneIcon class="w-5 h-5 text-orange-500" /> Görünüm Alanları
                </h4>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <button 
                    v-for="slot in availableSlots" 
                    :key="slot.id"
                    @click="toggleSlot(slot.id)"
                    class="h-16 px-4 rounded-2xl border-2 flex items-center justify-between transition-all"
                    :class="localForm.targetSlots.includes(slot.id) ? 'bg-orange-50 border-orange-500' : 'bg-gray-50 border-transparent hover:border-gray-100'"
                  >
                    <span class="text-[10px] font-black leading-tight" :class="localForm.targetSlots.includes(slot.id) ? 'text-orange-700' : 'text-gray-400 font-bold'">{{ slot.label }}</span>
                    <CheckCircleIcon v-if="localForm.targetSlots.includes(slot.id)" class="w-5 h-5 text-orange-500" />
                  </button>
                </div>
              </section>
            </div>

            <!-- Right: Geo & File (5 cols) -->
            <div class="lg:col-span-5 space-y-10">
               <!-- Banner Upload (Similar but red themed) -->
               <section class="space-y-4">
                <h4 class="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <CloudArrowUpIcon class="w-5 h-5 text-orange-500" /> Ad-Swap Banner Görseli
                </h4>
                <div class="relative aspect-[3/4] bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden hover:border-orange-300 transition-colors group">
                    <img v-if="imagePreview" :src="imagePreview" class="absolute inset-0 w-full h-full object-cover" />
                    <div v-else class="flex flex-col items-center text-center px-8">
                        <CloudArrowUpIcon class="w-10 h-10 text-gray-300 mb-4" />
                        <p class="text-xs font-bold text-gray-400">Paket içeriğine bağlı olarak görsel yükle</p>
                    </div>
                    <input type="file" @change="handleFileUpload" class="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    <button v-if="imagePreview" @click="emit('clearFile')" class="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-xl text-red-500 shadow-sm border border-red-50 hover:bg-white"><TrashIcon class="w-5 h-5" /></button>
                </div>
              </section>

              <!-- Target URL -->
              <section class="space-y-2">
                <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">ÖZEL HEDEF URL (OPSİYONEL)</label>
                <div class="relative">
                    <input v-model="localForm.targetUrl" type="text" placeholder="https://bazarx.com/..." class="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 outline-none focus:border-orange-400 font-bold" />
                </div>
              </section>

              <!-- Geo Status (Simplified view for Swap) -->
              <section class="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 space-y-6">
                <div class="flex items-center gap-2">
                    <MapPinIcon class="w-5 h-5 text-orange-500" />
                    <h4 class="text-sm font-black text-gray-900 uppercase tracking-widest">Hedef Konumlar</h4>
                </div>
                <!-- Reusing common logic here later in final assembly -->
                <p class="text-[11px] font-bold text-gray-400 italic">Coğrafi hedefleme yapılmazsa tüm Türkiye kapsanacaktır.</p>
                <div class="space-y-4 relative" ref="geo.cityDropdownRef">
                    <button @click="geo.isCityDropdownOpen.value = !geo.isCityDropdownOpen.value" class="w-full h-14 bg-white border border-gray-100 rounded-2xl px-6 flex items-center justify-between shadow-sm">
                        <span class="text-sm font-bold text-gray-500 truncate">{{ geo.selectedCities.value.length ? geo.selectedCities.value.join(', ') : 'Tüm Türkiye' }}</span>
                        <ChevronDownIcon class="w-5 h-5 text-gray-400" />
                    </button>
                    <!-- Dropdown Content -->
                    <div v-if="geo.isCityDropdownOpen.value" class="absolute z-30 top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 space-y-3">
                        <input v-model="geo.citySearch.value" type="text" placeholder="Şehir ara..." class="w-full h-10 bg-gray-50 rounded-xl px-4 text-sm" />
                        <div class="max-h-40 overflow-y-auto custom-scrollbar">
                            <button v-for="c in geo.filteredCities.value" :key="c" @click="geo.toggleCity(c)" class="w-full px-4 py-2 text-left text-sm font-bold hover:bg-gray-50 rounded-lg flex justify-between">
                                {{ c }} <CheckCircleIcon v-if="geo.selectedCities.value.includes(c)" class="w-4 h-4 text-orange-600" />
                            </button>
                        </div>
                    </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-6">
          <button @click="emit('update:modelValue', false)" class="px-8 py-4 font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">Vazgeç</button>
          <button 
            @click="onSubmit"
            :disabled="isLoading || !isValid" 
            class="px-12 py-4 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-2xl font-black uppercase tracking-widest hover:from-orange-500 hover:to-red-600 disabled:from-gray-200 disabled:to-gray-200 disabled:cursor-not-allowed transition-all shadow-xl shadow-orange-200 flex items-center gap-3"
          >
            <ArrowPathIcon v-if="isLoading" class="w-5 h-5 animate-spin" />
            {{ isLoading ? 'BAŞLATILIYOR...' : 'AD-SWAP KAMPANYASINI BAŞLAT' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
</style>
