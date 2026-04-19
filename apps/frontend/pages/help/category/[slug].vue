<template>
  <div class="min-h-screen bg-gray-50 pb-20 font-sans">
    <!-- Header -->
    <div class="bg-gray-900 text-white pt-12 pb-24 relative overflow-hidden">
      <!-- Background Elements -->
      <div
        class="absolute top-0 right-0 w-96 h-96 bg-orange-500 opacity-10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"
      />

      <div class="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <NuxtLink
          to="/help"
          class="text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-8 text-sm font-medium"
        >
          <ArrowLeftIcon class="w-4 h-4" /> Yardım Merkezine Dön
        </NuxtLink>

        <div
          v-if="category"
          class="flex flex-col sm:flex-row items-start sm:items-center gap-6"
        >
          <div
            class="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-orange-400 backdrop-blur-sm border border-white/5"
          >
            <component
              :is="getIcon(category.icon || '')"
              class="w-10 h-10"
            />
          </div>
          <div>
            <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              {{ category.title }}
            </h1>
            <div class="flex items-center gap-3 text-gray-400">
              <span class="flex items-center gap-1">
                <DocumentTextIcon class="w-4 h-4" />
                {{ category.articles?.length || 0 }} makale
              </span>
            </div>
          </div>
        </div>

        <div
          v-else-if="pending"
          class="h-24 w-full max-w-md bg-white/10 rounded-2xl animate-pulse"
        />
      </div>
    </div>

    <!-- Article List -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 -mt-12 relative z-10">
      <div
        v-if="pending"
        class="space-y-4"
      >
        <div
          v-for="i in 5"
          :key="i"
          class="h-24 bg-white rounded-2xl shadow-sm animate-pulse"
        />
      </div>

      <div
        v-else-if="category"
        class="space-y-4"
      >
        <NuxtLink
          v-for="article in category.articles"
          :key="article.id"
          :to="`/help/article/${article.slug}`"
          class="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-100 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group"
        >
          <div class="pr-6">
            <h3 class="font-bold text-gray-900 text-lg group-hover:text-orange-600 transition-colors mb-2">
              {{ article.title }}
            </h3>
            <p class="text-gray-500 text-sm line-clamp-2 leading-relaxed">
              {{ article.content.substring(0,
                                           150).replace(/\n/g, ' ') }}...
            </p>
          </div>
          <div
            class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors shrink-0"
          >
            <ChevronRightIcon class="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-all" />
          </div>
        </NuxtLink>

        <div
          v-if="category.articles?.length === 0"
          class="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm"
        >
          <InboxIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-xl font-bold text-gray-900">
            Henüz makale yok
          </h3>
          <p class="text-gray-500 mt-2">
            Bu kategoriye henüz içerik eklenmemiş.
          </p>
        </div>
      </div>
      <div
        v-else
        class="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm"
      >
        <ExclamationCircleIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-gray-900">
          Kategori bulunamadı
        </h3>
        <div class="mt-6">
          <NuxtLink
            to="/help"
            class="text-orange-600 font-bold hover:underline"
          >
            Tüm kategorilere göz atın
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHelpService } from '~/services/api/HelpService'
import {
    ShoppingBagIcon,
    ArrowPathIcon,
    TruckIcon,
    InformationCircleIcon,
    TicketIcon,
    StarIcon,
    CreditCardIcon,
    ArrowLeftIcon,
    ChevronRightIcon,
    DocumentTextIcon,
    InboxIcon,
    ExclamationCircleIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const helpService = useHelpService()

const { data, pending } = await useAsyncData(`helpCat-${route.params.slug}`, () => helpService.getCategory(route.params.slug as string))

const category = computed(() => data.value?.data)

useHead({
    title: computed(() => category.value ? `${category.value.title} - Yardım Merkezi` : 'Yükleniyor...'),
})

const getIcon = (name: string) => {
    const icons = {
        'ShoppingBag': ShoppingBagIcon,
        'RotateCcw': ArrowPathIcon,
        'Truck': TruckIcon,
        'Info': InformationCircleIcon,
        'Ticket': TicketIcon,
        'Star': StarIcon,
        'CreditCard': CreditCardIcon
    }
    const iconComp = icons[name as keyof typeof icons] || InformationCircleIcon
    return iconComp
}
</script>
