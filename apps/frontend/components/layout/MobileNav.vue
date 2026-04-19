<template>
  <nav
    class="lg:hidden fixed bottom-4 left-4 right-4 h-16 glass rounded-[2rem] shadow-2xl border border-white/40 flex items-center justify-around px-2 z-[100] backdrop-blur-xl ring-1 ring-black/5 overflow-hidden"
  >
    <NuxtLink
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      :class="['flex-1 flex flex-col items-center justify-center space-y-0.5 group', item.isCenter ? 'translate-y-[-10px]' : '']"
      active-class="text-primary-600 !opacity-100"
    >
      <div v-if="item.isCenter" class="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/40 border-4 border-white">
        <component :is="item.icon" class="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
        <span
          v-if="item.count && item.count > 0"
          class="absolute -top-1 -right-1 h-5 w-5 bg-white text-primary-600 text-[10px] font-black rounded-full flex items-center justify-center border border-primary-600 shadow-sm animate-bounce"
        >
          {{ item.count }}
        </span>
      </div>
      <template v-else>
        <component 
          :is="item.icon" 
          class="h-6 w-6 text-gray-400 group-hover:text-primary-600 transition-all nav-icon opacity-70 group-[.router-link-active]:opacity-100 group-[.router-link-active]:text-primary-600" 
        />
        <span class="text-[8px] font-black uppercase tracking-tighter text-gray-400 group-[.router-link-active]:text-primary-600">
          {{ $t(item.label) }}
        </span>
      </template>
      <span v-if="item.isCenter" class="text-[8px] font-black uppercase tracking-tighter text-gray-400 mt-1 absolute -bottom-5">
        {{ $t(item.label) }}
      </span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { HomeIcon, Squares2X2Icon, ShoppingCartIcon, ShoppingBagIcon, UserIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  cartCount: number
}>()

const navItems = computed(() => [
  { label: 'nav.home', path: '/', icon: HomeIcon },
  { label: 'nav.categories', path: '/categories', icon: Squares2X2Icon },
  { label: 'nav.cart', path: '/cart', icon: ShoppingCartIcon, isCenter: true, count: props.cartCount },
  { label: 'nav.orders', path: '/orders', icon: ShoppingBagIcon },
  { label: 'nav.account', path: '/profile', icon: UserIcon }
])
</script>
