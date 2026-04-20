<template>
  <div v-if="vendor?.showAd">
    <!-- Left Ad -->
    <div class="hidden 2xl:flex absolute left-0 top-[450px] bottom-0 w-60 flex-col px-4 pointer-events-none z-10">
      <div class="sticky top-32 pointer-events-auto flex flex-col gap-6">
        <div v-if="vendor?.adProductLeft" class="w-full h-[550px] bg-gradient-to-b from-primary-100 to-white rounded-3xl border-4 border-dashed border-primary-300 flex flex-col items-center justify-center p-6 text-center shadow-xl hover:border-primary-500 hover:scale-105 transition-all cursor-pointer group overflow-hidden shrink-0" @click="navigateToProduct(vendor.adProductLeft.id)">
          <NuxtImg :src="getImageUrl(vendor.adProductLeft)" :alt="vendor.adProductLeft.name" class="w-full h-48 object-contain mb-6 rounded-2xl group-hover:scale-110 transition-transform shadow-lg bg-white/50" />
          <p class="text-sm font-black text-primary-900 uppercase tracking-tighter mb-2 line-clamp-2 px-1 leading-tight">{{ vendor.adProductLeft.name }}</p>
          <div class="flex items-center gap-2 mb-4">
            <span class="text-lg font-black text-primary-600">{{ formatPrice(vendor.adProductLeft.price) }}</span>
          </div>
          <button class="px-6 py-2 bg-primary-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg hover:bg-primary-700 transition-colors" @click.stop="$emit('add-to-cart', vendor.adProductLeft)">İNCELE</button>
        </div>
        <div v-else-if="vendor?.adImageUrlLeft" class="group relative overflow-hidden rounded-3xl shadow-2xl border-4 border-white transform hover:scale-105 transition-all duration-500">
          <a :href="vendor.adLinkUrlLeft || '#'" target="_blank" class="block">
            <NuxtImg :src="vendor.adImageUrlLeft" class="w-full h-auto" />
          </a>
        </div>
      </div>
    </div>

    <!-- Right Ad -->
    <div class="hidden 2xl:flex absolute right-0 top-[450px] bottom-0 w-60 flex-col px-4 pointer-events-none z-10">
      <div class="sticky top-32 pointer-events-auto flex flex-col gap-6">
        <div v-if="vendor?.adProductRight" class="w-full h-[550px] bg-gradient-to-b from-purple-100 to-white rounded-3xl border-4 border-dashed border-purple-300 flex flex-col items-center justify-center p-6 text-center shadow-xl hover:border-purple-500 hover:scale-105 transition-all cursor-pointer group overflow-hidden shrink-0" @click="navigateToProduct(vendor.adProductRight.id)">
          <NuxtImg :src="getImageUrl(vendor.adProductRight)" :alt="vendor.adProductRight.name" class="w-full h-48 object-contain mb-6 rounded-2xl group-hover:scale-110 transition-transform shadow-lg bg-white/50" />
          <p class="text-sm font-black text-purple-900 uppercase tracking-tighter mb-2 line-clamp-2 px-1 leading-tight">{{ vendor.adProductRight.name }}</p>
          <div class="flex items-center gap-2 mb-4">
            <span class="text-lg font-black text-purple-600">{{ formatPrice(vendor.adProductRight.price) }}</span>
          </div>
          <button class="px-6 py-2 bg-purple-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg hover:bg-purple-700 transition-colors" @click.stop="$emit('add-to-cart', vendor.adProductRight)">HEMEN KATIL</button>
        </div>
        <div v-else-if="vendor?.adImageUrlRight" class="group relative overflow-hidden rounded-3xl shadow-2xl border-4 border-white transform hover:scale-105 transition-all duration-500">
          <a :href="vendor.adLinkUrlRight || '#'" target="_blank" class="block">
            <NuxtImg :src="vendor.adImageUrlRight" class="w-full h-auto" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ vendor: Object })
defineEmits(['add-to-cart'])

const navigateToProduct = (id) => navigateTo(`/products/${id}`)
const getImageUrl = (p) => {
  if (!p?.image) return '/images/placeholder.png'
  return typeof p.image === 'string' ? p.image : p.image.url
}
const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p || 0)
</script>
