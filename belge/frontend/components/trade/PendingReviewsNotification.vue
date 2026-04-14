<template>
  <div
    v-if="pendingCount > 0"
    class="relative group"
  >
    <!-- Notification Icon/Badge -->
    <button
      class="p-4 bg-amber-50 rounded-2xl border border-amber-100/50 hover:bg-amber-100 transition-all active:scale-95 group relative"
      @click="showDropdown = !showDropdown"
    >
      <StarIcon class="h-6 w-6 text-amber-500 fill-amber-500/20" />
      <span class="absolute -top-1 -right-1 flex h-5 w-5">
        <span
          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"
        />
        <span
          class="relative inline-flex rounded-full h-5 w-5 bg-amber-500 text-[9px] font-black text-white items-center justify-center"
        >
          {{ pendingCount }}
        </span>
      </span>
    </button>

    <!-- Dropdown Panel -->
    <div
      v-if="showDropdown"
      class="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-gray-100 z-[100] p-6 animate-dropdown-in overflow-hidden"
    >
      <!-- Background Decor -->
      <div class="absolute -right-10 -top-10 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />

      <div class="relative z-10 space-y-6">
        <div class="space-y-1">
          <h4 class="text-lg font-black text-gray-900 uppercase tracking-tightest italic leading-none">
            YORUM <span class="text-amber-500">BEKLEYENLER</span>
          </h4>
          <p class="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Pending Evaluations
          </p>
        </div>

        <div class="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
          <div
            v-for="trade in pendingTrades"
            :key="trade.id"
            class="p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-amber-500/20 hover:bg-white transition-all cursor-pointer group/item"
            @click="openReview(trade)"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl bg-white p-1 border border-gray-100 overflow-hidden">
                <img
                  :src="getPartnerImage()"
                  class="w-full h-full object-cover rounded-lg"
                >
              </div>
              <div class="flex-1 overflow-hidden">
                <p class="text-[10px] font-black text-gray-900 uppercase tracking-tight truncate">
                  {{
                    getPartnerName(trade) }}
                </p>
                <p class="text-[8px] font-bold text-gray-400 uppercase mt-0.5">
                  İşlem Tamamlandı
                </p>
              </div>
              <ChevronRightIcon
                class="h-4 w-4 text-gray-300 group-hover/item:text-amber-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <NuxtLink
          to="/dashboard/trades"
          class="block w-full text-center py-4 bg-gray-900 hover:bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg"
        >
          TÜMÜNÜ GÖRÜNTÜLE
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { StarIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'

const pendingTrades = ref([])
const pendingCount = computed(() => pendingTrades.value.length)
const showDropdown = ref(false)
const config = useRuntimeConfig()
const authStore = useAuthStore()

const fetchPending = async () => {
    try {
        const response = await $fetch('/api/trade-reviews/pending', {
            baseURL: config.public.apiBase,
            headers: { Authorization: `Bearer ${authStore.token}` }
        })
        if (response.success) {
            pendingTrades.value = response.data
        }
    } catch (error) {
        console.error('Fetch pending reviews error:', error)
    }
}

const getPartnerName = (trade) => {
    const currentCompanyId = authStore.user?.companyId
    return trade.fromCompanyId === currentCompanyId ? trade.toCompany.name : trade.fromCompany.name
}

const getPartnerImage = () => {
    // Logic to return partner's company logo or placeholder
    return '/placeholder-surplus.jpg'
}

const openReview = (trade) => {
    // Logic to open review modal for this trade
    showDropdown.value = false
    // Use a global event or store to trigger the modal
    useEvent('trade:open-review', trade)
}

onMounted(() => {
    fetchPending()
    // Poll every 5 minutes
    setInterval(fetchPending, 5 * 60 * 1000)
})
</script>

<style scoped>
.animate-dropdown-in {
    animation: dropdownIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes dropdownIn {
    from {
        opacity: 0;
        transform: translateY(10px) scale(0.95);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
