<!-- apps/frontend/pages/vendor/advertising/components/AdLayoutEditorModal.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { 
  XMarkIcon, 
  ComputerDesktopIcon, 
  CloudArrowUpIcon, 
  LinkIcon, 
  ArrowPathIcon,
  MapPinIcon,
  ChevronDownIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'
import { useGeoSelector } from '~/composables/advertising/useGeoSelector'
import type { LayoutForm } from '~/types/advertising'

const props = defineProps<{
  modelValue: boolean
  layoutType: number
  initialForm: LayoutForm
  isSaving: boolean
  isUploading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', form: LayoutForm, city: string[], district: string[]): void
  (e: 'upload', file: File): void
}>()

// Internal form state
const form = ref<LayoutForm>({ ...props.initialForm })
const geo = useGeoSelector()

// Sync form when it changes externally
watch(() => props.initialForm, (newVal) => {
  form.value = { ...newVal }
}, { deep: true })

// Modal titles mapping
const titles: Record<number, string> = {
  1: 'Kategori Sayfası Bannerı',
  2: 'Benzer Ürünler Reklamı',
  3: 'Marka Mağazası Tasarımı'
}

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    emit('upload', target.files[0])
  }
}

const onSave = () => {
  emit('save', form.value, geo.selectedCities.value, geo.selectedDistricts.value)
}

// Reset geo when modal opens
watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
        // Initial geo setup should be handled by parent or passed as props if editing
    }
})

// Expose geo refs for parent if needed
defineExpose({ geo })
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
    >
      <div class="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <ComputerDesktopIcon class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-xl font-black text-gray-900">{{ titles[layoutType] || 'Düzen Editörü' }}</h3>
              <p class="text-sm text-gray-500 font-medium">Görünüm ve hedefleme ayarlarını yapılandırın</p>
            </div>
          </div>
          <button @click="emit('update:modelValue', false)" class="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200">
            <XMarkIcon class="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <!-- Left: Settings -->
            <div class="space-y-8">
              <!-- Rejection Reason if any -->
              <div v-if="form.status === 'REJECTED'" class="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3">
                <XMarkIcon class="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <h4 class="text-sm font-bold text-red-900 uppercase">Red Nedeni</h4>
                  <p class="text-xs text-red-700 mt-0.5">{{ form.rejectionReason || 'Görsel politikasına uygun değil.' }}</p>
                </div>
              </div>

              <!-- Upload Section -->
              <div class="space-y-4">
                <label class="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <CloudArrowUpIcon class="w-5 h-5 text-indigo-600" /> Banner Görseli
                </label>
                <div 
                  class="relative aspect-[21/9] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden hover:border-indigo-300 transition-colors group"
                >
                  <img v-if="form.imageUrl" :src="form.imageUrl" class="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" />
                  
                  <div v-if="!form.imageUrl && !isUploading" class="flex flex-col items-center">
                    <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                      <CloudArrowUpIcon class="w-6 h-6 text-indigo-400" />
                    </div>
                    <p class="text-xs font-bold text-gray-400">Tıkla veya sürükle</p>
                    <p class="text-[10px] text-gray-400 mt-1">PNG, JPG (Max 2MB)</p>
                  </div>

                  <div v-if="isUploading" class="flex flex-col items-center bg-white/80 backdrop-blur-sm inset-0 absolute justify-center">
                    <ArrowPathIcon class="w-8 h-8 text-indigo-600 animate-spin" />
                    <span class="text-xs font-black text-indigo-700 mt-2 uppercase">Yükleniyor...</span>
                  </div>

                  <input 
                    type="file" 
                    class="absolute inset-0 opacity-0 cursor-pointer" 
                    accept="image/*"
                    @change="handleFileUpload"
                  />
                  
                  <div v-if="form.imageUrl" class="absolute bottom-4 right-4 flex gap-2">
                    <div class="px-3 py-1.5 bg-white/90 backdrop-blur shadow-sm rounded-lg text-[10px] font-black text-indigo-700 border border-white">DEĞİŞTİR</div>
                  </div>
                </div>
              </div>

              <!-- Link URL -->
              <div class="space-y-4">
                <label class="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <LinkIcon class="w-5 h-5 text-indigo-600" /> Hedef Bağlantı (URL)
                </label>
                <div class="relative">
                  <input 
                    v-model="form.linkUrl"
                    type="text" 
                    placeholder="https://bazarx.com/product/..." 
                    class="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-700"
                  />
                </div>
                <p class="text-[10px] text-gray-400 font-bold px-2">Kullanıcı görsele tıkladığında yönlendirilecek adres.</p>
              </div>

              <!-- Template Select -->
              <div class="space-y-4">
                <label class="text-sm font-black text-gray-900 uppercase tracking-widest">Görünüm Şablonu</label>
                <div class="grid grid-cols-2 gap-4">
                  <button 
                    v-for="t in ['A', 'B']" 
                    :key="t"
                    @click="form.template = t"
                    class="h-14 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-black text-sm"
                    :class="form.template === t ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-100'"
                  >
                    ŞABLON {{ t }}
                    <CheckCircleIcon v-if="form.template === t" class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Right: Geo-Targeting -->
            <div class="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 space-y-8">
              <h4 class="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <MapPinIcon class="w-5 h-5 text-indigo-600" /> Coğrafi Hedefleme
              </h4>

              <!-- City Select -->
              <div class="space-y-4">
                <label class="text-xs font-black text-gray-400 uppercase tracking-widest">Şehirler (Opsiyonel)</label>
                <div class="relative" ref="geo.cityDropdownRef">
                  <button 
                    @click="geo.isCityDropdownOpen.value = !geo.isCityDropdownOpen.value"
                    class="w-full h-14 bg-white border border-gray-100 rounded-2xl px-6 flex items-center justify-between shadow-sm"
                  >
                    <span class="text-sm font-bold text-gray-500 truncate">
                      {{ geo.selectedCities.value.length ? geo.selectedCities.value.join(', ') : 'Tüm Türkiye' }}
                    </span>
                    <ChevronDownIcon class="w-5 h-5 text-gray-400 transition-transform" :class="geo.isCityDropdownOpen.value ? 'rotate-180' : ''" />
                  </button>

                  <div v-if="geo.isCityDropdownOpen.value" class="absolute z-20 top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 space-y-4">
                    <input v-model="geo.citySearch.value" type="text" placeholder="Şehir ara..." class="w-full h-10 bg-gray-50 rounded-xl px-4 text-sm outline-none border border-gray-100" />
                    <div class="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                      <button 
                        v-for="city in geo.filteredCities.value" 
                        :key="city"
                        @click="geo.toggleCity(city)"
                        class="w-full px-4 py-2 rounded-lg text-left text-sm font-bold transition-all flex items-center justify-between"
                        :class="geo.selectedCities.value.includes(city) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'"
                      >
                        {{ city }}
                        <CheckCircleIcon v-if="geo.selectedCities.value.includes(city)" class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

               <!-- District Select -->
               <div class="space-y-4" v-if="geo.selectedCities.value.length > 0">
                <label class="text-xs font-black text-gray-400 uppercase tracking-widest">İlçeler (Opsiyonel)</label>
                <div class="relative" ref="geo.districtDropdownRef">
                    <button 
                      @click="geo.isDistrictDropdownOpen.value = !geo.isDistrictDropdownOpen.value"
                      class="w-full h-14 bg-white border border-gray-100 rounded-2xl px-6 flex items-center justify-between shadow-sm"
                    >
                      <span class="text-sm font-bold text-gray-500 truncate">
                        {{ geo.selectedDistricts.value.length ? geo.selectedDistricts.value.length + ' İlçe seçildi' : 'Tüm İlçeler' }}
                      </span>
                      <ChevronDownIcon class="w-5 h-5 text-gray-400 transition-transform" :class="geo.isDistrictDropdownOpen.value ? 'rotate-180' : ''" />
                    </button>

                    <div v-if="geo.isDistrictDropdownOpen.value" class="absolute z-20 top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 space-y-4">
                      <input v-model="geo.districtSearch.value" type="text" placeholder="İlçe ara..." class="w-full h-10 bg-gray-50 rounded-xl px-4 text-sm outline-none border border-gray-100" />
                      <div class="max-h-60 overflow-y-auto custom-scrollbar">
                        <div v-for="city in geo.selectedCities.value" :key="city" class="mb-4">
                          <div class="text-[10px] font-black text-gray-400 uppercase mb-2 px-2 border-l-2 border-indigo-200 ml-2">{{ city }}</div>
                          <div class="space-y-1">
                            <button 
                              v-for="d in geo.getFilteredDistricts(city)" 
                              :key="d"
                              @click="geo.toggleDistrict(d + ' ('+city+')')"
                              class="w-full px-4 py-2 rounded-lg text-left text-sm font-bold transition-all flex items-center justify-between"
                              :class="geo.selectedDistricts.value.includes(d + ' ('+city+')') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'"
                            >
                              {{ d }}
                              <CheckCircleIcon v-if="geo.selectedDistricts.value.includes(d + ' ('+city+')')" class="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-4">
          <button @click="emit('update:modelValue', false)" class="px-8 py-4 font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">İPTAL</button>
          <button 
            @click="onSave"
            :disabled="isSaving || !form.imageUrl"
            class="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all shadow-xl shadow-gray-200"
          >
            <ArrowPathIcon v-if="isSaving" class="w-5 h-5 animate-spin inline mr-2" />
            AYARLARI KAYDET
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
