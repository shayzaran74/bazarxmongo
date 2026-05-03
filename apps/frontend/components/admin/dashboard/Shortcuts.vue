<template>
  <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
    <NuxtLink
      v-for="link in shortcuts"
      :key="link.path"
      :to="link.path" 
      class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center text-center group"
    >
      <div :class="[link.bg, 'w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm']">
        <component
          :is="link.icon"
          class="h-6 w-6 text-white"
        />
      </div>
      <span class="text-[10px] font-black uppercase text-gray-700 tracking-tighter">{{ link.label }}</span>
    </NuxtLink>
  </div>
</template>

<script setup>
import ShoppingBagIcon from '@heroicons/vue/24/outline/ShoppingBagIcon'
import FolderIcon from '@heroicons/vue/24/outline/FolderIcon'
import CurrencyDollarIcon from '@heroicons/vue/24/outline/CurrencyDollarIcon'
import TicketIcon from '@heroicons/vue/24/outline/TicketIcon'
import UsersIcon from '@heroicons/vue/24/outline/UsersIcon'
import PhotoIcon from '@heroicons/vue/24/outline/PhotoIcon'
import TruckIcon from '@heroicons/vue/24/outline/TruckIcon'
import MegaphoneIcon from '@heroicons/vue/24/outline/MegaphoneIcon'

const shortcuts = [
  { label: 'Ürünler', path: '/admin/products', icon: ShoppingBagIcon, bg: 'bg-primary-600' },
  { label: 'Kategoriler', path: '/admin/categories', icon: FolderIcon, bg: 'bg-emerald-600' },
  { label: 'Siparişler', path: '/admin/orders', icon: TruckIcon, bg: 'bg-orange-500' },
  { label: 'Açık Artırma', path: '/admin/auctions', icon: CurrencyDollarIcon, bg: 'bg-purple-600' },
  { label: 'Bildirimler', path: '/admin/marketing/notifications', icon: MegaphoneIcon, bg: 'bg-indigo-600' },
  { label: 'Kullanıcılar', path: '/admin/users', icon: UsersIcon, bg: 'bg-blue-600' },
  { label: 'Bannerlar', path: '/admin/banners', icon: PhotoIcon, bg: 'bg-rose-500' }
]
</script>
