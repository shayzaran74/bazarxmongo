<!-- apps/frontend/pages/vendor/advertising/components/AdCampaignModal.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  XMarkIcon, 
  MegaphoneIcon, 
  MapPinIcon, 
  ChevronDownIcon, 
  CheckCircleIcon,
  CloudArrowUpIcon,
  TrashIcon,
  PlusIcon,
  PlusCircleIcon,
  InformationCircleIcon as InfoIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'
import { useGeoSelector } from '~/composables/advertising/useGeoSelector'
import type { NewCampaignForm, VendorProduct, TargetSlot } from '~/types/advertising'

const props = defineProps<{
  modelValue: boolean
  vendorProducts: VendorProduct[]
  availableSlots: TargetSlot[]
  isLoading: boolean
  imagePreview: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'create', form: NewCampaignForm, selectedProducts: string[], city: string[], district: string[], file: File | null): void
  (e: 'uploadFile', file: File): void
  (e: 'clearFile'): void
}>()

const geo = useGeoSelector()

// Form State
const localForm = ref<NewCampaignForm>({
    name: '',
    type: 'SPONSORED_PRODUCT',
    budget: 50,
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    pricingModel: 'CPC',
    maxBidPerClick: 0.5,
    maxBidPerMille: 5.0,
    budgetOverflow: 10,
    targetSlots: [],
    platform: 'BAZARX',
    negativeKeywords: []
})

const selectedProducts = ref<string[]>([])
const newNegativeKeyword = ref('')
const currentFile = ref<File | null>(null)

// Helpers
const toggleSlot = (id: string) => {
    const idx = localForm.value.targetSlots.indexOf(id)
    if (idx === -1) localForm.value.targetSlots.push(id)
    else localForm.value.targetSlots.splice(idx, 1)
}

const toggleProduct = (id: string) => {
    const index = selectedProducts.value.indexOf(id)
    if (index === -1) {
        if (selectedProducts.value.length < 10) selectedProducts.value.push(id)
    } else {
        selectedProducts.value.splice(index, 1)
    }
}

const addNegativeKeyword = () => {
    const kw = newNegativeKeyword.value.trim()
    if (kw && !localForm.value.negativeKeywords.includes(kw)) {
        localForm.value.negativeKeywords.push(kw)
    }
    newNegativeKeyword.value = ''
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
        selectedProducts.value, 
        geo.selectedCities.value, 
        geo.selectedDistricts.value,
        currentFile.value
    )
}

const isValid = computed(() => {
    return localForm.value.name && localForm.value.budget > 0 && selectedProducts.value.length > 0
})
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <MegaphoneIcon class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-xl font-black text-gray-900 tracking-tight">Yeni Kampanya Oluştur</h3>
              <p class="text-sm text-gray-500 font-medium">Hedef kitlenize ulaşmak için ayarları yapılandırın</p>
            </div>
          </div>
          <button @click="emit('update:modelValue', false)" class="p-2.5 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200 shadow-sm">
            <XMarkIcon class="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <!-- Left Column: Main Settings (7 cols) -->
            <div class="lg:col-span-7 space-y-10">
              <!-- Basic Info -->
              <section class="space-y-6">
                <div class="flex items-center gap-2 mb-2">
                  <span class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">1</span>
                  <h4 class="text-sm font-black text-gray-900 uppercase tracking-widest">Temel Bilgiler</h4>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">KAMPANYA ADI</label>
                    <input v-model="localForm.name" type="text" placeholder="Örn: Yaz İndirimi 2024" class="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-700" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">GÜNLÜK BÜTÇE (₺)</label>
                    <input v-model="localForm.budget" type="number" class="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-700" />
                  </div>
                </div>
              </section>

              <!-- Product Selection -->
              <section class="space-y-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">2</span>
                    <h4 class="text-sm font-black text-gray-900 uppercase tracking-widest">Ürün Seçimi</h4>
                  </div>
                  <span class="text-[10px] font-black text-gray-400">{{ selectedProducts.length }} / 10 Ürün</span>
                </div>

                <div class="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                  <div class="flex flex-wrap gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    <button 
                      v-for="p in vendorProducts" 
                      :key="p.id"
                      @click="toggleProduct(p.id)"
                      class="flex items-center gap-3 p-2 pr-4 bg-white rounded-xl border transition-all text-left"
                      :class="selectedProducts.includes(p.id) ? 'border-indigo-600 shadow-md shadow-indigo-100 ring-2 ring-indigo-500/10' : 'border-transparent hover:border-gray-200'"
                    >
                      <img :src="p.image" class="w-10 h-10 rounded-lg object-cover" />
                      <div class="flex flex-col">
                        <span class="text-[11px] font-bold text-gray-900 truncate max-w-[120px]">{{ p.name }}</span>
                        <span class="text-[9px] font-black text-gray-400">SKU: {{ p.sku }}</span>
                      </div>
                      <PlusCircleIcon v-if="!selectedProducts.includes(p.id)" class="w-4 h-4 text-gray-200 ml-auto" />
                      <CheckCircleIcon v-else class="w-5 h-5 text-indigo-600 ml-auto" />
                    </button>
                  </div>
                </div>
              </section>

              <!-- Ad Placement -->
              <section class="space-y-6">
                <div class="flex items-center gap-2">
                  <span class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">3</span>
                  <h4 class="text-sm font-black text-gray-900 uppercase tracking-widest">Reklam Alanları</h4>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <button 
                    v-for="slot in availableSlots" 
                    :key="slot.id"
                    @click="toggleSlot(slot.id)"
                    class="h-16 px-4 rounded-2xl border-2 flex items-center justify-between transition-all group"
                    :class="localForm.targetSlots.includes(slot.id) ? 'bg-indigo-50 border-indigo-600' : 'bg-gray-50 border-transparent hover:border-gray-100'"
                  >
                    <span class="text-[10px] font-black leading-tight" :class="localForm.targetSlots.includes(slot.id) ? 'text-indigo-700' : 'text-gray-400 font-bold'">{{ slot.label }}</span>
                    <CheckCircleIcon v-if="localForm.targetSlots.includes(slot.id)" class="w-5 h-5 text-indigo-600" />
                  </button>
                </div>
              </section>

              <!-- Geo-Smart (Simplified copy as it uses internal composable) -->
              <section class="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 space-y-6">
                <div class="flex items-center gap-2">
                    <MapPinIcon class="w-5 h-5 text-indigo-600" />
                    <h4 class="text-sm font-black text-gray-900 uppercase tracking-widest">Hedef Konumlar</h4>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2 relative" ref="geo.cityDropdownRef">
                        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">ŞEHİR SEÇİMİ</label>
                        <button @click="geo.isCityDropdownOpen.value = !geo.isCityDropdownOpen.value" class="w-full h-14 bg-white border border-gray-100 rounded-2xl px-6 flex items-center justify-between">
                            <span class="text-sm font-bold text-gray-500 truncate">{{ geo.selectedCities.value.length ? geo.selectedCities.value.join(', ') : 'Tüm Türkiye' }}</span>
                            <ChevronDownIcon class="w-5 h-5 text-gray-400" />
                        </button>
                        <!-- City Dropdown Content here -->
                        <div v-if="geo.isCityDropdownOpen.value" class="absolute z-30 top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 space-y-4">
                            <input v-model="geo.citySearch.value" type="text" placeholder="Şehir ara..." class="w-full h-10 bg-gray-50 rounded-xl px-4 text-sm" />
                            <div class="max-h-48 overflow-y-auto custom-scrollbar">
                                <button v-for="c in geo.filteredCities.value" :key="c" @click="geo.toggleCity(c)" class="w-full px-4 py-2 text-left text-sm font-bold hover:bg-gray-50 rounded-lg flex justify-between">
                                    {{ c }} <CheckCircleIcon v-if="geo.selectedCities.value.includes(c)" class="w-4 h-4 text-indigo-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="space-y-2 relative" v-if="geo.selectedCities.value.length" ref="geo.districtDropdownRef">
                        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">İLÇE SEÇİMİ</label>
                        <button @click="geo.isDistrictDropdownOpen.value = !geo.isDistrictDropdownOpen.value" class="w-full h-14 bg-white border border-gray-100 rounded-2xl px-6 flex items-center justify-between">
                            <span class="text-sm font-bold text-gray-500">{{ geo.selectedDistricts.value.length }} İlçe seçildi</span>
                            <ChevronDownIcon class="w-5 h-5 text-gray-400" />
                        </button>
                        <!-- District Dropdown Content here -->
                    </div>
                </div>
              </section>
            </div>

            <!-- Right Column: Banner & Keywords (5 cols) -->
            <div class="lg:col-span-5 space-y-10">
              <!-- Banner Upload -->
              <section class="space-y-4">
                <h4 class="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <CloudArrowUpIcon class="w-5 h-5 text-indigo-600" /> Kampanya Görseli
                </h4>
                <div class="relative aspect-[3/4] bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden hover:border-indigo-300 transition-colors group">
                    <img v-if="imagePreview" :src="imagePreview" class="absolute inset-0 w-full h-full object-cover" />
                    <div v-else class="flex flex-col items-center text-center px-8">
                        <CloudArrowUpIcon class="w-10 h-10 text-gray-300 mb-4" />
                        <p class="text-xs font-bold text-gray-400">Ürünü vurgulayan bir görsel yükle (Opsiyonel)</p>
                    </div>
                    <input type="file" @change="handleFileUpload" class="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                    <button v-if="imagePreview" @click="emit('clearFile')" class="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-xl text-red-500 shadow-sm border border-red-50 hover:bg-white"><TrashIcon class="w-5 h-5" /></button>
                </div>
              </section>

              <!-- Negative Keywords -->
              <section class="bg-gray-50 rounded-3xl p-8 border border-gray-100 space-y-6">
                <div class="flex items-center gap-2">
                    <XMarkIcon class="w-5 h-5 text-red-500" />
                    <h4 class="text-sm font-black text-gray-900 uppercase tracking-widest">Negatif Kelimeler</h4>
                    <div class="group relative inline-block">
                        <InfoIcon class="w-4 h-4 text-gray-400" />
                        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">Bu kelimelerle arama yapıldığında reklamınız görünmez.</div>
                    </div>
                </div>
                
                <div class="flex gap-2">
                    <input v-model="newNegativeKeyword" @keyup.enter="addNegativeKeyword" type="text" placeholder="Kelime ekle..." class="w-full h-12 bg-white border border-gray-100 rounded-xl px-4 text-sm font-bold outline-none" />
                    <button @click="addNegativeKeyword" class="shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all"><PlusIcon class="w-5 h-5" /></button>
                </div>

                <div class="flex flex-wrap gap-2">
                    <span v-for="(kw, idx) in localForm.negativeKeywords" :key="idx" class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 flex items-center gap-2">
                        {{ kw }}
                        <button @click="localForm.negativeKeywords.splice(idx, 1)" class="hover:text-red-500"><XMarkIcon class="w-3 h-3" /></button>
                    </span>
                </div>
              </section>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-6">
          <div class="mr-auto hidden sm:flex items-center gap-4">
              <div class="flex flex-col">
                  <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">GÜNLÜK TAHMİNİ</span>
                  <span class="text-sm font-black text-indigo-700">~2.500 - 5.000 GÖSTERİM</span>
              </div>
          </div>
          <button @click="emit('update:modelValue', false)" class="px-8 py-4 font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">Vazgeç</button>
          <button 
            @click="onSubmit"
            :disabled="isLoading || !isValid" 
            class="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-200 flex items-center gap-3"
          >
            <ArrowPathIcon v-if="isLoading" class="w-5 h-5 animate-spin" />
            {{ isLoading ? 'OLUŞTURULUYOR...' : 'KAMPANYAYI BAŞLAT' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}
</style>
