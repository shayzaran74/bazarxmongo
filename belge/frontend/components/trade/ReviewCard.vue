<template>
  <div
    class="group bg-white rounded-[2.5rem] p-8 border border-gray-100/50 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden"
  >
    <!-- Hover Background Gradient -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
    />

    <div class="relative z-10 space-y-6">
      <!-- Top Section -->
      <div class="flex items-start justify-between">
        <div class="flex items-center space-x-4">
          <div
            class="w-14 h-14 rounded-2xl bg-gray-50 p-1 border border-gray-100 overflow-hidden shadow-sm group-hover:scale-105 transition-transform"
          >
            <img
              :src="review.fromUser?.company?.logo || '/placeholder-surplus.jpg'"
              class="w-full h-full object-cover rounded-xl"
            >
          </div>
          <div>
            <h5 class="text-xs font-black text-gray-900 uppercase tracking-tight italic">
              {{
                review.fromUser?.company?.name || 'Anonim Şirket' }}
            </h5>
            <div class="flex items-center space-x-1 mt-1">
              <StarIcon
                v-for="i in 5"
                :key="i"
                class="h-2.5 w-2.5"
                :class="i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'"
              />
            </div>
          </div>
        </div>
        <div class="text-right">
          <p class="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] font-mono">
            {{
              formatDate(review.createdAt) }}
          </p>
          <div
            v-if="review.tradeOffer?.completion"
            class="inline-flex items-center mt-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100/50"
          >
            <span
              class="text-[8px] font-black text-emerald-600 uppercase tracking-widest italic"
            >Doğrulanmış
              İşlem</span>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="relative">
        <QuoteIcon
          class="absolute -left-2 -top-2 h-8 w-8 text-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <p
          class="text-sm font-medium text-gray-600 leading-relaxed italic relative z-10 pl-2 border-l-2 border-primary-500/20 group-hover:border-primary-500 transition-colors"
        >
          "{{ review.comment || 'Detaylı yorum bırakılmadı.' }}"
        </p>
      </div>

      <!-- Trade Context -->
      <div
        v-if="review.tradeOffer"
        class="pt-4 border-t border-gray-50 flex items-center justify-between"
      >
        <div class="flex items-center space-x-2">
          <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest">Takas Konusu:</span>
          <span
            class="text-[8px] font-black text-primary-600 uppercase tracking-tightest italic truncate max-w-[150px]"
          >
            {{ review.tradeOffer.offeredItem?.title }} / {{ review.tradeOffer.requestedItem?.title }}
          </span>
        </div>
        <ChevronRightIcon class="h-3 w-3 text-gray-300 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { StarIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'

defineProps({
    review: {
        type: Object,
        required: true
    }
})

const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'LONG', year: 'numeric' }).format(date)
}

// Custom Quote Icon Component
const QuoteIcon = defineComponent({
    render() {
        return h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, [
            h('path', { d: 'M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 7.55228 14.017 7V5C14.017 4.44772 14.4647 4 15.017 4H19.017C21.2261 4 23.017 5.79086 23.017 8V15C23.017 18.866 19.883 22 16.017 22H14.017V21ZM5.017 21L5.017 18C5.017 16.8954 5.91243 16 7.017 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.017C5.46472 8 5.017 7.55228 5.017 7V5C5.017 4.44772 5.46472 4 6.017 4H10.017C12.2261 4 14.017 5.79086 14.017 8V15C14.017 18.866 10.883 22 7.017 22H5.017V21Z' })
        ])
    }
})
</script>

<style scoped>
.tracking-tightest {
    letter-spacing: -0.05em;
}
</style>
