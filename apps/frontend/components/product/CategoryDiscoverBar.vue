<template>
  <div class="category-discover-bar w-full mb-6 max-w-7xl mx-auto">
    <div
      class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFF5F0] to-[#FEFAF6] p-3 sm:p-4 border border-[#FDEEE4] shadow-sm"
    >
      <!-- Background Elements -->
      <div class="absolute -right-4 -top-4 w-16 h-16 bg-orange-100 rounded-full blur-2xl opacity-40" />
      <div class="absolute -left-4 -bottom-4 w-16 h-16 bg-orange-50 rounded-full blur-2xl opacity-40" />

      <div class="relative flex flex-col gap-3">
        <!-- Title Section (Top Row) -->
        <div class="flex items-center justify-between border-b border-orange-100/50 pb-2.5">
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 rounded-lg bg-orange-100/50 flex items-center justify-center text-orange-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <h2 class="text-sm sm:text-base font-black text-[#8B4513] tracking-tight uppercase">
              {{ categoryName }} <span class="text-orange-400">Kategorisinde</span>
            </h2>
          </div>

          <!-- Visual Icon (Discover / Reset) -->
          <div class="flex-shrink-0">
            <button
              class="relative group focus:outline-none focus:ring-2 focus:ring-orange-300 rounded-full transition-all"
              title="Sıralamayı Sıfırla"
              @click="handleTabClick('')"
            >
              <div
                class="absolute inset-0 bg-yellow-400 rounded-full blur-lg opacity-10 group-hover:opacity-40 transition-opacity"
              />
              <img
                src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
                alt="Discover"
                class="w-8 h-8 object-contain relative transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 active:scale-90"
              >
            </button>
          </div>
        </div>

        <!-- Filter Pills Section (Bottom Row) -->
        <div class="w-full">
          <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="[
                'px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 relative border whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105 z-10'
                  : 'bg-white text-slate-600 border-slate-100 hover:border-orange-200 hover:bg-orange-50/30'
              ]"
              @click="handleTabClick(tab.id)"
            >
              {{ tab.label }}

              <span
                v-if="tab.badgeText"
                class="px-1.5 py-0.5 rounded-[4px] text-[8px] bg-orange-500 text-white font-black uppercase tracking-tighter shadow-sm animate-pulse pointer-events-none"
              >
                {{ tab.badgeText }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
    categoryName: {
        type: String,
        default: 'Ürün'
    },
    activeTab: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['tab-change'])

const tabs = [
    { id: '', label: 'Keşfet' },
    { id: 'created_desc', label: 'Yeni Gelenler', badgeText: 'Yeni' },
    { id: 'best_sellers', label: 'En Çok Satılanlar' },
    { id: 'most_visited', label: 'En Çok Ziyaret Edilenler' },
    { id: 'most_favorited', label: 'En Çok Favorilenenler' },
    { id: 'most_reviewed', label: 'En Çok Değerlendirilenler' },
    { id: 'most_repurchased', label: 'En Çok Tekrar Satın Alınanlar' }
]

const handleTabClick = (tabId) => {
    emit('tab-change', tabId)
}
</script>

<style scoped>
.category-discover-bar {
    animation: slideDown 0.6s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
