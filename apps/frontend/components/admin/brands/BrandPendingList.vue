<template>
  <div class="space-y-4">
    <div v-if="brands.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="brand in brands"
        :key="brand.id"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all group"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 p-2 flex items-center justify-center overflow-hidden">
              <img
                v-if="brand.image || brand.icon"
                :src="resolveImageUrl(brand.image || brand.icon)"
                class="w-full h-full object-contain"
              >
              <DocumentTextIcon v-else class="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <h4 class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {{ brand.name }}
              </h4>
              <p class="text-[10px] text-gray-400 font-mono">
                ID: {{ brand.id.slice(0, 8) }}...
              </p>
            </div>
          </div>
          <span
            :class="getApplicationTypeBadge(brand.applicationType)"
            class="px-2 py-0.5 rounded-lg text-[10px] font-bold"
          >
            {{ getApplicationTypeLabel(brand.applicationType) }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 mb-4">
          <div class="p-2 bg-gray-50 rounded-xl border border-gray-100">
            <p class="text-[9px] text-gray-400 font-bold uppercase mb-1">
              Belge Durumu
            </p>
            <div class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span class="text-[10px] font-bold text-gray-700">Yüklendi</span>
            </div>
          </div>
          <div class="p-2 bg-gray-50 rounded-xl border border-gray-100">
            <p class="text-[9px] text-gray-400 font-bold uppercase mb-1">
              Başvuru Tarihi
            </p>
            <p class="text-[10px] font-bold text-gray-700">
              {{ formatDate(brand.createdAt) }}
            </p>
          </div>
        </div>

        <button
          class="w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          @click="$emit('review', brand)"
        >
          <EyeIcon class="h-4 w-4" />
          Başvuruyu İncele
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
      <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <ClockIcon class="h-10 w-10 text-gray-300" />
      </div>
      <h3 class="text-lg font-bold text-gray-900">
        Bekleyen Başvuru Yok
      </h3>
      <p class="text-sm text-gray-500 text-center max-w-xs mx-auto">
        Şu an için inceleme bekleyen yeni bir marka başvurusu bulunmuyor.
      </p>
    </div>
  </div>
</template>

<script setup>
import { DocumentTextIcon, EyeIcon, ClockIcon } from '@heroicons/vue/24/outline'
import { getApplicationTypeBadge, getApplicationTypeLabel } from '~/utils/brand-helpers'

const props = defineProps({
  brands: {
    type: Array,
    required: true
  }
})

defineEmits(['review'])

const { resolveImageUrl } = useAppImage()

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('tr-TR')
}
</script>
