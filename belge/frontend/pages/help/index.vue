<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <AnnouncementBar page="help" />
    <!-- Hero Search Section -->
    <div
      class="bg-gradient-to-br from-orange-500 to-orange-600 pt-20 pb-24 px-4 sm:px-6 lg:px-8 text-center text-white relative overflow-hidden"
    >
      <!-- Decor Balls -->
      <div
        class="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
      />
      <div
        class="absolute bottom-0 right-0 w-96 h-96 bg-orange-400 opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"
      />

      <div class="relative z-10 max-w-3xl mx-auto">
        <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
          Size nasıl yardımcı olabiliriz?
        </h1>
        <p class="text-orange-100 text-lg mb-8">
          Siparişleriniz, kargo süreçleri ve iadeler hakkında merak
          ettikleriniz.
        </p>

        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-6 w-6 text-gray-400" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Ne aramıştınız? (örn: iade, kargo takibi...)"
            class="w-full pl-12 pr-6 py-5 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-orange-300/50 shadow-2xl text-lg transition-shadow"
            @input="handleSearch"
          >

          <!-- Search Results Dropdown -->
          <div
            v-if="searchQuery"
            class="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-xl mt-3 text-left overflow-hidden z-20 text-gray-900 border border-gray-100"
          >
            <div v-if="searchResults.length > 0">
              <NuxtLink
                v-for="res in searchResults"
                :key="res.id"
                :to="`/help/article/${res.slug}`"
                class="block px-6 py-4 hover:bg-orange-50 border-b border-gray-50 last:border-0 transition-colors group"
              >
                <span
                  class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 mb-1"
                >
                  <component
                    :is="getIcon(res.categoryIcon)"
                    class="w-4 h-4"
                  />
                  {{ res.categoryName }}
                </span>
                <span class="font-medium text-gray-800 group-hover:text-orange-700 block">{{ res.title
                }}</span>
              </NuxtLink>
            </div>
            <div
              v-else
              class="p-8 text-center text-gray-500"
            >
              <QuestionMarkCircleIcon class="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>Aradığınız kriterlere uygun sonuç bulunamadı.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-20">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="bg-white h-40 rounded-2xl shadow-sm"
        />
      </div>

      <!-- Categories Grid -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
      >
        <NuxtLink
          v-for="cat in categories"
          :key="cat.id"
          :to="`/help/category/${cat.slug}`"
          class="bg-white p-8 rounded-3xl shadow-lg shadow-gray-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100/50 group flex flex-col items-center text-center sm:items-start sm:text-left sm:flex-row gap-6"
        >
          <div
            class="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shrink-0"
          >
            <component
              :is="getIcon(cat.icon)"
              class="w-8 h-8"
            />
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-2">
              {{ cat.title }}
            </h3>
            <p class="text-gray-500 text-sm leading-relaxed mb-3">
              Sipariş, iade ve diğer işlemler hakkında
              detaylı bilgi.
            </p>
            <span
              class="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full group-hover:bg-orange-100 group-hover:text-orange-700 transition-colors"
            >
              {{ cat._count.articles }} Makale
            </span>
          </div>
        </NuxtLink>
      </div>

      <!-- Visual Guides -->
      <div class="mb-16">
        <!-- Commission Calculator Section -->
        <!-- Calculators Section -->
        <div
          id="calculators-section"
          class="mb-16 scroll-mt-24"
        >
          <HelpCalculators ref="calculatorRef" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <PhotoIcon class="w-8 h-8 text-orange-500" />
          Hızlı Hesaplama Araçları & Görsel Rehber
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Commission Guide -->
          <div
            class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] group"
            @click="scrollToCalculator('commission')"
          >
            <div
              class="relative aspect-video rounded-xl overflow-hidden mb-4 bg-orange-100 flex items-center justify-center"
            >
              <CalculatorIcon
                class="w-12 h-12 text-orange-600 group-hover:scale-110 transition-transform"
              />
            </div>
            <h3
              class="text-center font-bold text-gray-800 text-lg mb-1 group-hover:text-orange-600 transition-colors"
            >
              Komisyon Hesapla
            </h3>
            <p class="text-center text-sm text-gray-500">
              Pazar yeri komisyonlarını ve net kazancınızı
              hesaplayın.
            </p>
          </div>

          <!-- Desi Guide -->
          <div
            class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] group"
            @click="scrollToCalculator('desi')"
          >
            <div
              class="relative aspect-video rounded-xl overflow-hidden mb-4 bg-blue-100 flex items-center justify-center"
            >
              <CubeIcon class="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3
              class="text-center font-bold text-gray-800 text-lg mb-1 group-hover:text-orange-600 transition-colors"
            >
              Desi Hesapla
            </h3>
            <p class="text-center text-sm text-gray-500">
              Kargolarınızın hacimsel ağırlığını (desi) öğrenin.
            </p>
          </div>

          <!-- Shipping Guide -->
          <div
            class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] group"
            @click="scrollToCalculator('shipping')"
          >
            <div
              class="relative aspect-video rounded-xl overflow-hidden mb-4 bg-green-100 flex items-center justify-center"
            >
              <TruckIcon class="w-12 h-12 text-green-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3
              class="text-center font-bold text-gray-800 text-lg mb-1 group-hover:text-orange-600 transition-colors"
            >
              Kargo Ücreti
            </h3>
            <p class="text-center text-sm text-gray-500">
              Tahmini kargo gönderim maliyetlerinizi hesaplayın.
            </p>
          </div>

          <!-- VAT Guide -->
          <div
            class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] group"
            @click="scrollToCalculator('vat')"
          >
            <div
              class="relative aspect-video rounded-xl overflow-hidden mb-4 bg-purple-100 flex items-center justify-center"
            >
              <ScaleIcon class="w-12 h-12 text-purple-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3
              class="text-center font-bold text-gray-800 text-lg mb-1 group-hover:text-orange-600 transition-colors"
            >
              KDV Hesapla
            </h3>
            <p class="text-center text-sm text-gray-500">
              KDV dahil ve hariç tutarları kolayca hesaplayın.
            </p>
          </div>
        </div>
      </div>

      <!-- Popular Questions & Help Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
        <!-- Popular Questions (Accordion) -->
        <div class="lg:col-span-2">
          <div class="flex items-center gap-3 mb-8">
            <StarIcon class="w-8 h-8 text-orange-500" />
            <h2 class="text-2xl font-bold text-gray-900">
              En Çok Merak Edilenler
            </h2>
          </div>

          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div
              v-for="(article, index) in popularArticles"
              :key="article.id"
              class="border-b border-gray-50 last:border-0"
            >
              <button
                class="flex justify-between items-center w-full text-left p-6 sm:p-8 hover:bg-gray-50 transition-colors group"
                @click="toggleAccordion(article.id)"
              >
                <span class="flex items-center gap-4">
                  <span
                    class="w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 text-sm font-bold shrink-0"
                  >
                    {{ index + 1 }}
                  </span>
                  <span
                    class="font-semibold text-gray-900 text-lg group-hover:text-orange-600 transition-colors"
                  >{{
                    article.title }}</span>
                </span>
                <div
                  class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all ml-4 shrink-0"
                >
                  <ChevronDownIcon
                    :class="{ 'rotate-180 text-orange-600': openArticleId === article.id }"
                    class="w-5 h-5 text-gray-400 transition-transform duration-300"
                  />
                </div>
              </button>
              <div
                v-show="openArticleId === article.id"
                class="px-8 pb-8 pt-0"
              >
                <div
                  class="pl-12 pt-4 border-t border-gray-100 text-gray-600 leading-relaxed whitespace-pre-line prose prose-orange max-w-none"
                >
                  {{ article.content }}
                </div>
                <div class="pl-12 mt-4 flex gap-4">
                  <NuxtLink
                    :to="`/help/article/${article.slug}`"
                    class="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    Detaylı Görüntüle
                    <ArrowRightIcon class="w-4 h-4" />
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact / Support Box -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-24">
            <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <LifebuoyIcon class="w-6 h-6 text-orange-500" />
              Hala yardıma mı ihtiyacınız var?
            </h3>

            <div class="space-y-4">
              <div class="bg-blue-50 p-5 rounded-2xl flex items-start gap-4">
                <ChatBubbleLeftRightIcon class="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                <div>
                  <h4 class="font-bold text-blue-900 text-sm">
                    Canlı Destek
                  </h4>
                  <p class="text-blue-700/80 text-sm mt-1 mb-2">
                    Müşteri temsilcimizle anında görüşün.
                  </p>
                  <button
                    class="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sohbeti
                    Başlat
                  </button>
                </div>
              </div>

              <div class="bg-green-50 p-5 rounded-2xl flex items-start gap-4">
                <PhoneIcon class="w-6 h-6 text-green-600 shrink-0 mt-1" />
                <div>
                  <h4 class="font-bold text-green-900 text-sm">
                    Çağrı Merkezi
                  </h4>
                  <p class="text-green-700/80 text-sm mt-1">
                    0850 123 45 67
                  </p>
                  <p class="text-green-700/60 text-xs mt-1">
                    Hafta içi 09:00 - 18:00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHelpService } from '~/services/api/HelpService'
import {
    ShoppingBagIcon,
    ArrowPathIcon, // RotateCcw substitute
    TruckIcon,
    InformationCircleIcon,
    TicketIcon,
    StarIcon,
    CreditCardIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
    QuestionMarkCircleIcon,
    ArrowRightIcon,
    LifebuoyIcon,
    ChatBubbleLeftRightIcon,
    PhoneIcon,
    PhotoIcon,
    CalculatorIcon,
    CubeIcon,
    ScaleIcon
} from '@heroicons/vue/24/outline'
import AnnouncementBar from '~/components/common/AnnouncementBar.vue'

const categories = ref([])
const popularArticles = ref([])
const loading = ref(true)
const searchQuery = ref('')
const searchResults = ref([])
const openArticleId = ref(null)
const calculatorRef = ref(null)

const helpService = useHelpService()

// Use lazy fetch to prevent blocking navigation if API is slow, usually better for client-side heavy pages
const { data: catData } = await useAsyncData('helpCats', () => helpService.getCategories())
const { data: popData } = await useAsyncData('helpPopular', () => helpService.getPopular())

watch([catData, popData], () => {
    if (catData.value?.success) categories.value = catData.value.data
    if (popData.value?.success) popularArticles.value = popData.value.data
    loading.value = false
}, { immediate: true })

const getIcon = (name) => {
    const icons = {
        'ShoppingBag': ShoppingBagIcon,
        'RotateCcw': ArrowPathIcon,
        'Truck': TruckIcon,
        'Info': InformationCircleIcon,
        'Ticket': TicketIcon,
        'Star': StarIcon,
        'CreditCard': CreditCardIcon
    }
    return icons[name] || InformationCircleIcon
}


const toggleAccordion = (id) => {
    openArticleId.value = openArticleId.value === id ? null : id
}

let searchTimeout
const handleSearch = async () => {
    if (!searchQuery.value) { searchResults.value = []; return }
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(async () => {
        const data = await helpService.search(searchQuery.value).catch(() => null)
        if (data?.success) searchResults.value = data.data
    }, 300)
}

const scrollToCalculator = (mode = 'commission') => {
    // Scroll
    const el = document.getElementById('calculators-section')
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    // Set active calculator
    if (calculatorRef.value && calculatorRef.value.setCalculator) {
        calculatorRef.value.setCalculator(mode)
    }
}
</script>
