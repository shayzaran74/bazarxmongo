<template>
  <div class="mega-menu-container" style="z-index: 200;">
    <nav class="bg-transparent z-[10] lg:mt-2">
      <div class="flex items-center">
        <!-- All Categories Trigger -->
        <div class="flex-shrink-0 mr-4" @mouseenter="showAllCategoriesMenu" @mouseleave="hideSubMenuDelayed">
          <button
            class="flex items-center space-x-2 px-5 py-2.5 text-[11px] font-black text-white bg-dark-950 hover:bg-primary-600 transition-all uppercase tracking-widest rounded-2xl focus:outline-none shadow-lg active:scale-95 group border border-white/10"
            @click="toggleAllCategories"
          >
            <Icon name="heroicons:squares-2x2" class="w-4 h-4" />
            <span>{{ $t('nav.allCategories') }}</span>
            <Icon
              name="heroicons:chevron-down"
              class="w-3 h-3 transition-transform duration-300 ml-1 opacity-70"
              :class="{ 'rotate-180': showingAllCategories }"
            />
          </button>

          <!-- Dropdown Area -->
          <Transition name="slide-fade">
             <div v-if="showingAllCategories" class="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-full max-w-7xl px-5 z-[510]">
                <div class="bg-white/95 backdrop-blur-2xl shadow-2xl border border-gray-100 rounded-[2.5rem] overflow-hidden flex h-[400px]">
                   <!-- Categories List -->
                   <div class="w-1/3 border-r border-gray-100 py-6 overflow-y-auto custom-scrollbar">
                      <div v-for="cat in categories" :key="cat.id" 
                           class="px-6 py-3 mx-4 rounded-xl cursor-pointer transition-all duration-300 flex items-center justify-between group/item"
                           :class="currentCategory?.id === cat.id ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50 text-gray-600'"
                           @mouseenter="currentCategory = cat">
                         <span class="text-xs font-black uppercase tracking-widest">{{ cat.name }}</span>
                         <Icon name="heroicons:chevron-right" class="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      </div>
                   </div>
                   <!-- Sub-categories panel -->
                   <div class="flex-1 p-10 bg-gray-50/30 overflow-y-auto">
                      <div v-if="currentCategory" class="grid grid-cols-3 gap-10">
                         <div v-for="sub in currentCategory.children" :key="sub.id" class="space-y-4">
                            <h4 class="text-xs font-black text-dark-950 uppercase tracking-[0.2em] border-b border-primary-500/20 pb-2">{{ sub.name }}</h4>
                            <ul class="space-y-2">
                               <li v-for="detail in sub.children" :key="detail.id">
                                  <NuxtLink :to="`/products?category=${detail.id}`" class="text-xs font-bold text-gray-500 hover:text-primary-600 transition-colors" @click="hideMegaMenu">{{ detail.name }}</NuxtLink>
                               </li>
                            </ul>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </Transition>
        </div>

        <!-- Horizontal Quick Links -->
        <div class="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
           <NuxtLink v-for="cat in categories" :key="cat.id" :to="`/products?category=${cat.id}`" 
                     class="px-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-500 hover:text-primary-600 hover:border-primary-500 transition-all uppercase tracking-widest whitespace-nowrap shadow-sm">
              {{ cat.name }}
           </NuxtLink>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  categories: any[];
}>();

const showingAllCategories = ref(false);
const currentCategory = ref<any>(null);
const hideTimeout = ref<any>(null);

const toggleAllCategories = () => {
  showingAllCategories.value = !showingAllCategories.value;
};

const showAllCategoriesMenu = () => {
  if (hideTimeout.value) clearTimeout(hideTimeout.value);
  showingAllCategories.value = true;
};

const hideSubMenuDelayed = () => {
  hideTimeout.value = setTimeout(() => {
    showingAllCategories.value = false;
  }, 300);
};

const hideMegaMenu = () => {
  showingAllCategories.value = false;
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
