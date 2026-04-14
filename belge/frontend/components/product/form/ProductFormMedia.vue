<script setup lang="ts">
import { PhotoIcon, CloudArrowUpIcon, TrashIcon, StarIcon } from '@heroicons/vue/24/outline'
import type { Product } from '@barterborsa/shared-types'

interface Props {
  productImages: string[]
  newImageUrl: string
  foundCatalogProduct: Product | null
  isEditing: boolean
}

defineProps<Props>()
const emit = defineEmits(['upload', 'addImageUrl', 'removeImage', 'setAsMain', 'update:newImageUrl'])

const { resolveImageUrl } = useAppImage()
</script>

<template>
  <section
    id="media"
    class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    :class="{ 'opacity-50 grayscale select-none pointer-events-none': foundCatalogProduct && !isEditing }"
  >
    <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
      <div class="flex items-center space-x-3">
        <div class="bg-rose-100 p-2 rounded-lg">
          <PhotoIcon class="h-5 w-5 text-rose-600" />
        </div>
        <h3 class="text-lg font-bold text-gray-900">
          5. Medya Galerisi
        </h3>
      </div>
      <div class="flex items-center space-x-2">
        <span
          class="text-[10px] font-black px-2 py-0.5 rounded-full"
          :class="productImages.length >= 1 ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'"
        >
          {{ productImages.length }} / 10 Görsel
        </span>
      </div>
    </div>
    <div class="p-6 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          class="relative group cursor-pointer border-2 border-dashed border-gray-200 rounded-2xl p-8 transition-all hover:border-blue-400 hover:bg-blue-50/30"
        >
          <input
            id="fileUpload"
            type="file"
            class="hidden"
            accept="image/*"
            multiple
            @change="e => emit('upload', e)"
          >
          <label
            for="fileUpload"
            class="h-full w-full flex flex-col items-center justify-center cursor-pointer"
          >
            <CloudArrowUpIcon class="h-10 w-10 text-gray-400 mb-2 group-hover:text-blue-500" />
            <span class="text-sm font-bold text-gray-600">Görselleri Yükleyin</span>
            <span class="text-[10px] text-gray-400 mt-1">En az 1, en fazla 10 görsel. WebP önerilir.</span>
          </label>
        </div>
        <div class="space-y-4">
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider">URL ile Resim Ekle</label>
          <div class="flex gap-2">
            <input
              :value="newImageUrl"
              type="url"
              placeholder="https://..."
              class="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
              @input="e => emit('update:newImageUrl', (e.target as HTMLInputElement).value)"
            >
            <button
              type="button"
              class="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
              @click="emit('addImageUrl')"
            >
              Ekle
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="productImages.length > 0"
        class="grid grid-cols-2 sm:grid-cols-5 gap-4"
      >
        <div
          v-for="(img, index) in productImages"
          :key="index"
          class="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100 shadow-sm transition-all hover:scale-105"
        >
          <img
            :src="resolveImageUrl(img)"
            class="w-full h-full object-cover"
          >
          <div
            class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center space-x-2"
          >
            <button
              type="button"
              class="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
              @click="emit('removeImage', index)"
            >
              <TrashIcon class="h-4 w-4" />
            </button>
            <button
              v-if="index !== 0"
              type="button"
              class="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              @click="emit('setAsMain', index)"
            >
              <StarIcon class="h-4 w-4" />
            </button>
          </div>
          <div
            v-if="index === 0"
            class="absolute top-2 left-2 bg-blue-600 text-[8px] font-black text-white px-2 py-0.5 rounded-full"
          >
            ANA GÖRSEL
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
