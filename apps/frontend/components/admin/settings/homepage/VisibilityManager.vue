<template>
  <div class="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden mb-8">
    <div class="p-6 border-b border-gray-100 bg-gray-50/50">
      <h2 class="text-lg font-black text-gray-900 flex items-center italic uppercase leading-none">
        <EyeIcon class="h-5 w-5 mr-2 text-indigo-600" />
        Bölüm <span class="text-indigo-600 ml-1">Görünürlüğü</span>
      </h2>
    </div>

    <div class="p-8 space-y-6">
      <div v-for="item in sections" :key="item.key" class="p-5 bg-gray-50/50 rounded-2xl border border-gray-100/50 flex items-center justify-between group hover:border-indigo-200 transition-all">
        <div class="flex items-center gap-5">
          <div :class="item.bg" class="p-3 rounded-xl shadow-sm text-white group-hover:scale-110 transition-transform">
            <component :is="item.icon" class="h-6 w-6" />
          </div>
          <div>
            <h3 class="text-sm font-black text-gray-900 uppercase leading-none mb-1">{{ item.label }}</h3>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{{ item.desc }}</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <NuxtLink v-if="item.link" :to="item.link" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-[9px] font-black uppercase text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
            YönET
          </NuxtLink>
          <button 
            class="w-12 h-6 rounded-full transition-colors relative" 
            :class="modelValue[item.key] ? 'bg-indigo-600' : 'bg-gray-300'"
            @click="$emit('toggle', item.key)"
          >
            <div class="w-4 h-4 bg-white rounded-full absolute top-1 transition-all" :class="modelValue[item.key] ? 'right-1' : 'left-1'" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { EyeIcon, BoltIcon, FireIcon, MegaphoneIcon, PhotoIcon, Squares2X2Icon, UserGroupIcon } from '@heroicons/vue/24/outline'

defineProps({ modelValue: Object, ecosystem: String })
defineEmits(['toggle'])

const sections = [
  { key: 'showHomeSlider', label: 'Ana Banner Slider', desc: 'En üstteki büyük slider alanı', icon: PhotoIcon, bg: 'bg-pink-500', link: '/admin/banners' },
  { key: 'showFlashSales', label: 'Flaş Ürünler', desc: 'Süreli indirimli ürünler bölümü', icon: BoltIcon, bg: 'bg-amber-500' },
  { key: 'showSpecialOffers', label: 'Özel Fırsatlar', desc: 'Sezona veya kategoriye özel fırsatlar', icon: FireIcon, bg: 'bg-red-500' },
  { key: 'showAds', label: 'Yan Reklamlar', desc: 'Dikey yan reklam blokları', icon: MegaphoneIcon, bg: 'bg-indigo-500', link: '/admin/settings/side-ads' },
  { key: 'showQuadCards', label: 'Dörtlü Vitrin (Quad)', desc: 'Görsel ağırlıklı 4\'lü kartlar', icon: Squares2X2Icon, bg: 'bg-blue-500', link: '/admin/settings/quad-cards' },
  { key: 'showVendors', label: 'Popüler Mağazalar', desc: 'Ekosistemdeki öne çıkan satıcılar', icon: UserGroupIcon, bg: 'bg-green-500' },
  { key: 'showBrands', label: 'Markalar', desc: 'Anlaşmalı marka logoları', icon: Squares2X2Icon, bg: 'bg-slate-500' },
  { key: 'showNewsletter', label: 'Bülten Kayıt', desc: 'E-posta abonelik alanı', icon: MegaphoneIcon, bg: 'bg-teal-500' }
]
</script>
