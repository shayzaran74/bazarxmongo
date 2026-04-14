<template>
  <div class="space-y-8">
    <!-- Filters/Stats Header (Optional) -->
    <div
      v-if="showHeader"
      class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-gray-100"
    >
      <div class="space-y-1">
        <h3 class="text-2xl font-black text-gray-900 uppercase tracking-tightest italic leading-none">
          GELEN <span class="text-primary-600">DEĞERLENDİRMELER</span>
        </h3>
        <p class="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] font-mono">
          Verified Performance
          Feed
        </p>
      </div>

      <div class="flex items-center space-x-3">
        <select
          v-model="filters.minRating"
          class="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 text-[10px] font-black text-gray-900 uppercase tracking-widest focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all cursor-pointer outline-none shadow-sm"
        >
          <option :value="0">
            TÜM PUANLAR
          </option>
          <option
            v-for="r in [5, 4, 3, 2, 1]"
            :key="r"
            :value="r"
          >
            {{ r }} YILDIZ VE ÜSTÜ
          </option>
        </select>
      </div>
    </div>

    <!-- Content State -->
    <div
      v-if="loading"
      class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="h-64 bg-gray-50 rounded-[2.5rem] border border-gray-100"
      />
    </div>

    <div
      v-else-if="reviews.length === 0"
      class="py-20 flex flex-col items-center text-center space-y-6"
    >
      <div
        class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-inner"
      >
        <StarIcon class="h-10 w-10 text-gray-200" />
      </div>
      <div class="space-y-2">
        <h4 class="text-lg font-black text-gray-900 uppercase tracking-tightest italic">
          HİÇ YORUM BULUNAMADI
        </h4>
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Henüz bir değerlendirme
          yapılmamış veya filtreye uygun sonuç yok.
        </p>
      </div>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReviewCard
          v-for="review in reviews"
          :key="review.id"
          :review="review"
          class="animate-fade-in-up"
        />
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex items-center justify-center pt-10 space-x-3"
      >
        <button
          :disabled="page === 1"
          class="p-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all disabled:opacity-20 shadow-sm"
          @click="changePage(page - 1)"
        >
          <ChevronLeftIcon class="h-4 w-4 text-gray-900" />
        </button>

        <div class="flex items-center space-x-2">
          <button
            v-for="p in visiblePages"
            :key="p"
            class="w-12 h-12 rounded-2xl flex items-center justify-center text-[11px] font-black transition-all shadow-sm"
            :class="p === page ? 'bg-primary-600 text-white scale-110 shadow-primary-600/30' : 'bg-white border border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-50'"
            @click="changePage(p)"
          >
            {{ p }}
          </button>
        </div>

        <button
          :disabled="page === totalPages"
          class="p-4 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all disabled:opacity-20 shadow-sm"
          @click="changePage(page + 1)"
        >
          <ChevronRightIcon class="h-4 w-4 text-gray-900" />
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'
import ReviewCard from './ReviewCard.vue'

const props = defineProps({
    userId: {
        type: String,
        required: true
    },
    showHeader: {
        type: Boolean,
        default: true
    },
    pageSize: {
        type: Number,
        default: 10
    }
})

const reviews = ref([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)
const filters = ref({ minRating: 0 })
const config = useRuntimeConfig()

const fetchReviews = async () => {
    if (!props.userId) return
    loading.value = true
    try {
        const params = {
            toUserId: props.userId,
            page: page.value,
            limit: props.pageSize,
            minRating: filters.value.minRating > 0 ? filters.value.minRating : undefined
        }

        const response = await $fetch(`/api/trade-reviews`, {
            baseURL: config.public.apiBase,
            params
        })

        if (response.success) {
            reviews.value = response.data.reviews
            totalPages.value = response.data.pagination.totalPages
        }
    } catch (error) {
        console.error('Fetch reviews error:', error)
    } finally {
        loading.value = false
    }
}

const changePage = (p) => {
    if (p < 1 || p > totalPages.value) return
    page.value = p
    fetchReviews()
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const visiblePages = computed(() => {
    const pages = []
    for (let i = 1; i <= totalPages.value; i++) {
        if (i === 1 || i === totalPages.value || Math.abs(i - page.value) <= 1) {
            pages.push(i)
        }
    }
    return pages
})

watch(() => props.userId, () => {
    page.value = 1
    fetchReviews()
})

watch(() => filters.value.minRating, () => {
    page.value = 1
    fetchReviews()
})

onMounted(() => {
    fetchReviews()
})
</script>

<style scoped>
.animate-fade-in-up {
    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.tracking-tightest {
    letter-spacing: -0.05em;
}
</style>
