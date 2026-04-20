<template>
  <div class="fixed inset-0 z-[300] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-gray-900/80 backdrop-blur-md" @click="$emit('close')" />
    
    <div class="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up">
      <!-- Header -->
      <div class="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h2 class="text-2xl font-black text-gray-900 uppercase tracking-tightest italic flex items-center">
            <SparklesIcon class="h-6 w-6 mr-3 text-primary-600" />
            {{ props.item ? 'İLANİ DÜZENLE' : 'YENİ FAZLA MAL İLANI' }}
          </h2>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Takas etmek istediğiniz ürünü premium detaylarla listeleyin</p>
        </div>
        <button class="p-3 bg-white hover:bg-gray-100 rounded-2xl transition-all shadow-sm" @click="$emit('close')">
          <XMarkIcon class="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div class="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-12">
        <SurplusBasicInfo 
          v-model="formData" 
          v-model:selected-main="selectedMainCategory"
          v-model:selected-sub1="selectedSubCategory1"
          v-model:selected-sub2="selectedSubCategory2"
          :main-categories="mainCategories"
          :sub1-list="subCategories1"
          :sub2-list="subCategories2"
          :advisor-data="priceAdvisorData"
          :advisor-loading="priceAdvisorLoading"
          :units="units"
          @main-change="handleMainCategoryChange"
          @sub1-change="handleSubCategory1Change"
        />

        <SurplusMediaSection 
          :images="formData.images"
          v-model:url-model="newImageUrl"
          :resolve-image-url="resolveImageUrl"
          @add-files="processFiles"
          @add-url="() => { if(newImageUrl){ formData.images.push(newImageUrl); newImageUrl = ''; } }"
          @remove="idx => formData.images.splice(idx, 1)"
          @set-main="idx => { const img = formData.images.splice(idx,1)[0]; formData.images.unshift(img); }"
        />

        <SurplusTradePreferences 
          :main-categories="mainCategories"
          :surplus-categories="surplusCategories"
          :selected-categories="formData.wantedCategories"
          v-model:selected-modes="formData.tradeModes"
          :trade-mode-options="tradeModeOptions"
          @add-cat="cat => !formData.wantedCategories.includes(cat) && formData.wantedCategories.push(cat)"
          @remove-cat="idx => formData.wantedCategories.splice(idx, 1)"
        />

        <SurplusTechnicalSpecs 
          :attributes="surplusAttributes"
          :specs="formData.technicalSpecs"
          :custom-specs="technicalSpecsList"
          @add-spec="technicalSpecsList.push({ key: '', value: '' })"
          @remove-spec="idx => technicalSpecsList.splice(idx, 1)"
        />

        <!-- Action Button -->
        <div class="pt-6">
          <button
            :disabled="submitting"
            class="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-[2rem] py-6 text-xs font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-primary-600/30 active:scale-95 disabled:opacity-50 relative group"
            @click="handleSave"
          >
            <span v-if="submitting" class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> 
              KAYDEDİLİYOR...
            </span>
            <span v-else class="flex items-center justify-center">
              <CheckCircleIcon class="h-5 w-5 mr-2" /> {{ props.item ? 'DEĞİŞİKLİKLERİ KAYDET' : 'İLANİ ONAYA GÖNDER' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { SparklesIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { useSurplusForm } from '~/composables/useSurplusForm'

// Internal Components
import SurplusBasicInfo from '~/components/surplus/form/SurplusBasicInfo.vue'
import SurplusMediaSection from '~/components/surplus/form/SurplusMediaSection.vue'
import SurplusTradePreferences from '~/components/surplus/form/SurplusTradePreferences.vue'
import SurplusTechnicalSpecs from '~/components/surplus/form/SurplusTechnicalSpecs.vue'

const props = defineProps({ item: { type: Object, default: null } })
const emit = defineEmits(['close', 'success'])

const {
  formData, loading, submitting, newImageUrl,
  mainCategories, subCategories1, subCategories2,
  selectedMainCategory, selectedSubCategory1, selectedSubCategory2,
  surplusAttributes, technicalSpecsList,
  priceAdvisorData, priceAdvisorLoading,
  units, tradeModeOptions, surplusCategories,
  initialize, handleMainCategoryChange, handleSubCategory1Change, 
  processFiles, submitForm, resolveImageUrl
} = useSurplusForm(props.item)

const handleSave = async () => {
  const success = await submitForm()
  if (success) {
    emit('success')
    emit('close')
  }
}

onMounted(initialize)
</script>

<style scoped>
.animate-scale-up { animation: scale-up 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes scale-up { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #F9FAFB; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
</style>
