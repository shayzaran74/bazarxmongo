<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col h-[90vh]">
        <!-- Header -->
        <div class="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">
              Marka Başvurusu İnceleme
            </h2>
            <p class="text-sm text-gray-500 font-medium">
              Lütfen yüklenen belgeleri ve başvuru detaylarını dikkatlice kontrol edin.
            </p>
          </div>
          <button
            class="p-2 bg-white rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 transition-all shadow-sm"
            @click="$emit('close')"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <div class="flex-1 flex overflow-hidden">
          <!-- Left: Document Preview -->
          <div class="w-1/2 p-8 overflow-y-auto border-r border-gray-100 bg-slate-50/30">
            <h3 class="font-bold text-gray-700 mb-6 flex items-center gap-2">
              <DocumentTextIcon class="h-5 w-5 text-blue-600" />
              Yüklenen Belgeler
            </h3>

            <div class="space-y-6">
              <div v-if="brand?.documentUrl">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Marka Tescil Belgesi</p>
                <div class="relative group rounded-3xl overflow-hidden border-2 border-white shadow-lg bg-white">
                  <iframe v-if="brand.documentUrl.toLowerCase().endsWith('.pdf')" :src="resolveImageUrl(brand.documentUrl)" class="w-full h-[400px]" />
                  <img v-else :src="resolveImageUrl(brand.documentUrl)" class="w-full h-auto cursor-zoom-in" @click="openImage(brand.documentUrl)">
                </div>
              </div>
              <div v-if="brand?.invoiceChainUrl">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Fatura Silsilesi</p>
                <div class="relative group rounded-3xl overflow-hidden border-2 border-white shadow-lg bg-white">
                  <iframe v-if="brand.invoiceChainUrl.toLowerCase().endsWith('.pdf')" :src="resolveImageUrl(brand.invoiceChainUrl)" class="w-full h-[400px]" />
                  <img v-else :src="resolveImageUrl(brand.invoiceChainUrl)" class="w-full h-auto cursor-zoom-in" @click="openImage(brand.invoiceChainUrl)">
                </div>
              </div>
              <div v-if="brand?.authorizationUrl">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Yetki Belgesi</p>
                <div class="relative group rounded-3xl overflow-hidden border-2 border-white shadow-lg bg-white">
                  <iframe v-if="brand.authorizationUrl.toLowerCase().endsWith('.pdf')" :src="resolveImageUrl(brand.authorizationUrl)" class="w-full h-[400px]" />
                  <img v-else :src="resolveImageUrl(brand.authorizationUrl)" class="w-full h-auto cursor-zoom-in" @click="openImage(brand.authorizationUrl)">
                </div>
              </div>
              
              <div v-if="!brand?.documentUrl && !brand?.invoiceChainUrl && !brand?.authorizationUrl" class="h-64 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                <p class="font-medium">Belge yüklenmemiş</p>
              </div>
            </div>
          </div>

          <!-- Right: Review Actions -->
          <div class="w-1/2 overflow-y-auto p-8">
            <!-- Brand Info -->
            <div class="mb-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
              <h3 class="font-bold text-blue-900 mb-4">Başvuru Bilgileri</h3>
              <div class="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p class="text-gray-500 text-[10px] uppercase font-bold mb-1">Marka Adı</p>
                  <p class="font-black text-gray-900 text-base leading-tight">{{ brand?.name }}</p>
                </div>
                <div>
                  <p class="text-gray-500 text-[10px] uppercase font-bold mb-1">Başvuru Türü</p>
                  <span :class="getApplicationTypeBadge(brand?.applicationType)" class="px-2.5 py-1 rounded-lg text-xs font-bold inline-block">
                    {{ getApplicationTypeLabel(brand?.applicationType) }}
                  </span>
                </div>
                <div v-if="brand?.trademarkNumber">
                  <p class="text-gray-500 text-[10px] uppercase font-bold mb-1">Tescil No</p>
                  <p class="font-bold text-blue-600">{{ brand?.trademarkNumber }}</p>
                </div>
                <div>
                  <p class="text-gray-500 text-[10px] uppercase font-bold mb-1">Başvuru Tarihi</p>
                  <p class="font-medium text-gray-700">{{ formatDate(brand?.createdAt) }}</p>
                </div>
              </div>
            </div>

            <!-- Rejection Templates -->
            <div class="mb-8">
              <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ExclamationTriangleIcon class="h-5 w-5 text-red-500" />
                Hızlı Red Şablonları
              </h3>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="template in templates"
                  :key="template.id"
                  :class="[
                    'p-3 rounded-2xl border text-left transition-all text-xs font-bold leading-tight',
                    selectedTemplate === template.id ? 'border-red-400 bg-red-50 text-red-700 shadow-sm' : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50 text-gray-600'
                  ]"
                  @click="$emit('select-template', template)"
                >
                  {{ template.label }}
                </button>
              </div>
            </div>

            <!-- Review Notes -->
            <div class="mb-8">
              <label class="block text-sm font-bold text-gray-900 mb-2">Red Nedeni / İnceleme Notu</label>
              <textarea
                :value="rejectionReason"
                @input="$emit('update:rejectionReason', $event.target.value)"
                rows="4"
                class="w-full px-5 py-4 border border-gray-200 rounded-3xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none text-sm"
                placeholder="Başvuru neden reddedildi veya ek not ekleyin..."
              />
            </div>

            <!-- Popular Toggle -->
            <div class="mb-8 p-5 bg-amber-50 rounded-3xl border border-amber-200 flex items-center justify-between">
              <div>
                <p class="font-bold text-amber-900">Popüler Marka</p>
                <p class="text-xs text-amber-600">Ana sayfada öne çıkar</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  :checked="isPopular"
                  type="checkbox"
                  class="sr-only peer"
                  @change="$emit('update:isPopular', $event.target.checked)"
                >
                <div class="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-10 after:transition-all peer-checked:bg-amber-500" />
              </label>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-3 gap-4">
              <button
                :disabled="submitting"
                class="bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-green-200 disabled:opacity-50 flex flex-col items-center justify-center gap-1"
                @click="$emit('approve')"
              >
                <CheckIcon class="h-6 w-6" />
                Onayla
              </button>
              <button
                :disabled="submitting"
                class="bg-gradient-to-br from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-amber-200 disabled:opacity-50 flex flex-col items-center justify-center gap-1"
                @click="$emit('request-docs')"
              >
                <DocumentPlusIcon class="h-6 w-6" />
                Belge İste
              </button>
              <button
                :disabled="submitting || (!rejectionReason && !selectedTemplate)"
                class="bg-gradient-to-br from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex flex-col items-center justify-center gap-1"
                @click="$emit('reject')"
              >
                <XMarkIcon class="h-6 w-6" />
                Reddet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { 
  XMarkIcon, 
  DocumentTextIcon, 
  CheckIcon, 
  DocumentPlusIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/vue/24/outline'
import { getApplicationTypeBadge, getApplicationTypeLabel } from '~/utils/brand-helpers'

const props = defineProps({
  show: Boolean,
  brand: Object,
  rejectionReason: String,
  selectedTemplate: String,
  isPopular: Boolean,
  submitting: Boolean,
  templates: Array
})

defineEmits([
  'close', 
  'update:rejectionReason', 
  'update:isPopular', 
  'select-template', 
  'approve', 
  'reject', 
  'request-docs'
])

const { resolveImageUrl } = useAppImage()

const openImage = (url) => {
  window.open(resolveImageUrl(url), '_blank')
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>
