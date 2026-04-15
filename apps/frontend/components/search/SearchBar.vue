<template>
  <div ref="searchContainer" class="relative w-full group">
    <!-- Input area -->
    <div class="relative">
      <input 
        v-model="query"
        type="text" 
        class="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold focus:bg-white focus:border-primary-500/30 transition-all outline-none shadow-sm group-hover:shadow-md"
        :placeholder="$t('nav.searchPlaceholder')"
        @input="fetchSuggestions"
        @keydown.enter="submitSearch"
        @focus="showDropdown = true"
      />
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon name="heroicons:magnifying-glass" class="w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
      </div>
      <div class="absolute right-4 inset-y-0 flex items-center space-x-1">
         <kbd class="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-black text-gray-400">⌘</kbd>
         <kbd class="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-black text-gray-400">K</kbd>
      </div>
    </div>

    <!-- Dropdown Suggestions -->
    <Transition name="fade-scale">
      <div v-if="showDropdown && suggestions.length" class="absolute top-[calc(100%+12px)] left-0 right-0 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-gray-100 z-[1000] overflow-hidden">
        <div class="p-4 border-b border-gray-50 bg-gray-50/50">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Önerilen Ürünler</p>
        </div>
        <div class="p-2 space-y-1">
          <NuxtLink 
            v-for="item in suggestions" 
            :key="item.id"
            :to="`/products/${item.slug}`"
            class="flex items-center gap-4 p-3 hover:bg-primary-50 rounded-2xl transition-colors group/item"
            @click="closeDropdown"
          >
            <div class="w-12 h-12 rounded-xl bg-white border border-gray-100 p-1 flex-shrink-0">
              <img :src="item.image" class="w-full h-full object-contain" />
            </div>
            <div class="flex-grow">
              <h4 class="text-xs font-black text-dark-950 group-hover/item:text-primary-600 transition-colors line-clamp-1 italic">{{ item.name }}</h4>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ item.category?.name }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs font-black text-dark-950">{{ formatPrice(item.price) }}</p>
            </div>
          </NuxtLink>
        </div>
        <div class="p-4 bg-primary-600 text-center">
          <button @click="submitSearch" class="text-[10px] font-black text-white uppercase tracking-widest hover:underline">
            Tüm Sonuçları Gör
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

const searchContainer = ref(null)
const { query, suggestions, showDropdown, fetchSuggestions, submitSearch, closeDropdown } = useSearch()
const { formatPrice } = useFormat()

onClickOutside(searchContainer, () => {
  if (showDropdown.value) closeDropdown()
})
</script>

<style scoped>
.fade-scale-enter-active, .fade-scale-leave-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.fade-scale-enter-from, .fade-scale-leave-to { opacity: 0; transform: translateY(-10px) scale(0.98); }
</style>
