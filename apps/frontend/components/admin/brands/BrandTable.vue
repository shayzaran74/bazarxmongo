<template>
  <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <th class="px-6 py-4">Marka Bilgisi</th>
            <th class="px-6 py-4">Popüler</th>
            <th class="px-6 py-4">Başvuru Türü</th>
            <th class="px-6 py-4">Durum</th>
            <th class="px-6 py-4">Tarih</th>
            <th class="px-6 py-4 text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="loading">
             <td colspan="6" class="px-6 py-12 text-center text-gray-400 text-xs">Yükleniyor...</td>
          </tr>
          <tr
            v-for="brand in brands"
            :key="brand.id"
            class="hover:bg-gray-50/50 transition-all group"
          >
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    v-if="brand.image || brand.icon"
                    :src="resolveImageUrl(brand.image || brand.icon)"
                    class="w-full h-full object-contain"
                  >
                  <DocumentTextIcon v-else class="h-5 w-5 text-gray-300" />
                </div>
                <div>
                  <p class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {{ brand.name }}
                  </p>
                  <p class="text-[10px] text-gray-400 font-mono">
                    {{ brand.slug }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <FireIcon
                v-if="brand.isPopular"
                class="h-5 w-5 text-rose-500"
              />
              <span v-else class="text-gray-200 text-xs">—</span>
            </td>
            <td class="px-6 py-4">
              <span
                :class="getApplicationTypeBadge(brand.applicationType)"
                class="px-2.5 py-1 rounded-lg text-[10px] font-bold"
              >
                {{ getApplicationTypeLabel(brand.applicationType) }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span
                :class="getStatusBadgeClass(brand.status, brand.additionalDocsRequestedAt)"
                class="px-2.5 py-1 rounded-lg text-[10px] font-bold border"
              >
                {{ getStatusLabel(brand.status, brand.additionalDocsRequestedAt) }}
              </span>
            </td>
            <td class="px-6 py-4">
              <p class="text-xs text-gray-500 font-medium">
                {{ formatDate(brand.createdAt) }}
              </p>
            </td>
            <td class="px-6 py-4">
              <div class="flex justify-end gap-2">
                <button
                  class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  @click="$emit('edit', brand)"
                >
                  <PencilIcon class="h-5 w-5" />
                </button>
                <button
                  class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  @click="$emit('delete', brand.id)"
                >
                  <TrashIcon class="h-5 w-5" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="brands.length === 0 && !loading">
            <td colspan="6" class="px-6 py-12 text-center text-gray-400 text-xs">Marka bulunamadı.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { DocumentTextIcon, PencilIcon, TrashIcon, FireIcon } from '@heroicons/vue/24/outline'
import { 
  getApplicationTypeBadge, 
  getApplicationTypeLabel, 
  getStatusBadgeClass, 
  getStatusLabel 
} from '~/utils/brand-helpers'

const props = defineProps({
  brands: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit', 'delete'])

const { resolveImageUrl } = useAppImage()

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('tr-TR')
}
</script>
