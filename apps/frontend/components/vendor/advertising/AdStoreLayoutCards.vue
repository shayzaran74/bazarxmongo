<!-- apps/frontend/pages/vendor/advertising/components/AdStoreLayoutCards.vue -->
<script setup lang="ts">
import { 
  RectangleStackIcon, 
  ComputerDesktopIcon, 
  BuildingStorefrontIcon 
} from '@heroicons/vue/24/outline'

const emit = defineEmits<{
  (e: 'openLayout', type: number): void
}>()

const layouts = [
  { id: 1, title: 'Kategori Sayfası', desc: 'Kategori sayfalarının en üstünde, markanızı temsil eden geniş banner alanları.', icon: RectangleStackIcon },
  { id: 2, title: 'Benzer Ürünler', desc: 'Rakip ürün sayfalarında "Benzer Sponsorlu Ürünler" sekmesinde görünün.', icon: ComputerDesktopIcon },
  { id: 3, title: 'Marka Mağazası', desc: 'Tüm ürünlerinizi sergilediğiniz, markanıza özel özelleştirilebilir mikro-site.', icon: BuildingStorefrontIcon }
]
</script>

<template>
  <div class="mt-12 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12">
    <div class="px-10 py-8 border-b border-gray-100 bg-gray-50/50">
      <h2 class="text-2xl font-black text-gray-900 tracking-tight">
        Marka Mağazası ve Yerleşimler
      </h2>
      <p class="text-gray-500 text-sm font-medium mt-1">
        Reklamlarınızın sitede nerede ve nasıl göründüğünü kontrol edin.
      </p>
    </div>
    <div class="p-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="layout in layouts"
          :key="layout.id"
          class="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center text-center group hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
        >
          <div
            class="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm"
          >
            <component :is="layout.icon" class="w-10 h-10 text-indigo-600" />
          </div>
          <h4 class="text-base font-black text-gray-900 mb-2">
            {{ layout.title }}
          </h4>
          <p class="text-[12px] font-bold text-gray-500 mb-8 px-4 leading-relaxed">
            {{ layout.desc }}
          </p>

          <button
            class="mt-auto w-full py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-gray-200 hover:shadow-indigo-500/20"
            @click="emit('openLayout', layout.id)"
          >
            Düzeni Düzenle
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
